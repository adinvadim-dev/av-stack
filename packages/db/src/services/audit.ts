import { desc } from "drizzle-orm";
import { db } from "../index.js";
import { auditLog } from "../schema.js";

interface AuditInsertInput {
  category: string;
  action: string;
  title: string;
  description: string;
  actor: string;
  metadata?: Record<string, unknown>;
}

export const DBAudit = {
  async list(opts?: { limit?: number }) {
    const limit = opts?.limit ?? 200;
    return db
      .select()
      .from(auditLog)
      .orderBy(desc(auditLog.createdAt))
      .limit(limit);
  },

  async insert(input: AuditInsertInput) {
    const [entry] = await db
      .insert(auditLog)
      .values({
        id: crypto.randomUUID(),
        category: input.category,
        action: input.action,
        title: input.title,
        description: input.description,
        actor: input.actor,
        metadata: input.metadata ?? {},
      })
      .returning();

    if (!entry) {
      throw new Error("Failed to insert audit log entry");
    }

    return entry;
  },
};
