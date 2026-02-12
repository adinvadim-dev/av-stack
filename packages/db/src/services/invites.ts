import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db } from "../index.js";
import { userInvite } from "../schema.js";

type UserRole = "user" | "superuser";

function normalizeInviteEmail(email: string) {
  return email.trim().toLowerCase();
}

export const DBInvites = {
  async create(input: {
    email: string;
    role?: UserRole;
    createdByUserId: string;
    expiresAt: Date;
  }) {
    const [invite] = await db
      .insert(userInvite)
      .values({
        id: crypto.randomUUID(),
        token: randomBytes(24).toString("base64url"),
        email: normalizeInviteEmail(input.email),
        role: input.role ?? "user",
        createdByUserId: input.createdByUserId,
        expiresAt: input.expiresAt,
      })
      .returning();

    if (!invite) {
      throw new Error("Failed to create invite");
    }

    return invite;
  },

  listForAdmin() {
    return db.select().from(userInvite).orderBy(desc(userInvite.createdAt));
  },

  getByToken(token: string) {
    return db.query.userInvite.findFirst({
      where: eq(userInvite.token, token),
    });
  },

  getValidByToken(token: string) {
    return db.query.userInvite.findFirst({
      where: and(
        eq(userInvite.token, token),
        isNull(userInvite.usedAt),
        isNull(userInvite.revokedAt),
        gt(userInvite.expiresAt, new Date()),
      ),
    });
  },

  async consumeByToken(input: { token: string; usedByUserId?: string; usedByEmail: string }) {
    const [updated] = await db
      .update(userInvite)
      .set({
        usedAt: new Date(),
        usedByUserId: input.usedByUserId,
        usedByEmail: normalizeInviteEmail(input.usedByEmail),
      })
      .where(
        and(
          eq(userInvite.token, input.token),
          isNull(userInvite.usedAt),
          isNull(userInvite.revokedAt),
          gt(userInvite.expiresAt, new Date()),
        ),
      )
      .returning();

    if (!updated) {
      throw new Error("Invite not found");
    }

    return updated;
  },

  async revokeById(id: string) {
    const [updated] = await db
      .update(userInvite)
      .set({ revokedAt: new Date() })
      .where(eq(userInvite.id, id))
      .returning();

    if (!updated) {
      throw new Error("Invite not found");
    }

    return updated;
  },
};
