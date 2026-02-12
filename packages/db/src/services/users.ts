import { desc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { user } from "../schema.js";

type UserRole = "user" | "superuser";

export const DBUsers = {
  listForAdmin() {
    return db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt));
  },

  listForAudit() {
    return db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .orderBy(desc(user.updatedAt));
  },

  getByEmail(email: string) {
    return db.query.user.findFirst({
      where: eq(user.email, email),
    });
  },

  getById(userId: string) {
    return db.query.user.findFirst({
      where: eq(user.id, userId),
    });
  },

  async countSuperusers() {
    const users = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.role, "superuser"));

    return users.length;
  },

  async setRole(userId: string, role: UserRole) {
    if (role === "user") {
      const target = await DBUsers.getById(userId);
      if (target?.role === "superuser") {
        const superusersCount = await DBUsers.countSuperusers();
        if (superusersCount <= 1) {
          throw new Error("Cannot remove the last superuser");
        }
      }
    }

    const [updatedUser] = await db
      .update(user)
      .set({ role, updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  },

  async updateProfile(input: { userId: string; name: string; email: string }) {
    const [updatedUser] = await db
      .update(user)
      .set({
        name: input.name,
        email: input.email,
        updatedAt: new Date(),
      })
      .where(eq(user.id, input.userId))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      });

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  },

  async promoteToSuperuserByEmail(email: string) {
    const targetUser = await DBUsers.getByEmail(email);

    if (!targetUser) {
      throw new Error(`User with email ${email} not found`);
    }

    return DBUsers.setRole(targetUser.id, "superuser");
  },
};
