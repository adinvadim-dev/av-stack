import { asc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { appSetting } from "../schema.js";

export const DBSettings = {
  getAll() {
    return db.select().from(appSetting).orderBy(asc(appSetting.key));
  },

  getByKey(key: string) {
    return db.query.appSetting.findFirst({
      where: eq(appSetting.key, key),
    });
  },

  async upsert(input: { key: string; value: string }) {
    const [setting] = await db
      .insert(appSetting)
      .values({
        key: input.key,
        value: input.value,
      })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: {
          value: input.value,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!setting) {
      throw new Error("Failed to upsert setting");
    }

    return setting;
  },

  remove(key: string) {
    return db.delete(appSetting).where(eq(appSetting.key, key));
  },
};
