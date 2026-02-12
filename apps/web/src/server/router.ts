import { protectedProcedure, publicProcedure, router, superuserProcedure, z } from "./trpc";
import { DBAudit } from "@av-stack/db/services/audit";
import { DBInvites } from "@av-stack/db/services/invites";
import { DBSettings } from "@av-stack/db/services/settings";
import { DBUsers } from "@av-stack/db/services/users";
import {
  systemSettingKeys,
  systemSettingsRegistry,
  validateSystemSettingValue,
} from "@/lib/system-settings";

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),

  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return { greeting: `Hello, ${input.name ?? "world"}!` };
    }),

  stack: publicProcedure.query(() => {
    return {
      items: [
        { name: "Turborepo", description: "High-performance build system for monorepos", category: "build" },
        { name: "TanStack Start", description: "Full-stack React framework with SSR & file-based routing", category: "framework" },
        { name: "React 19", description: "The latest React with server components & actions", category: "ui" },
        { name: "TypeScript", description: "Strict type safety across the entire stack", category: "language" },
        { name: "tRPC", description: "End-to-end typesafe APIs without code generation", category: "api" },
        { name: "better-auth", description: "Authentication with session management & OAuth", category: "auth" },
        { name: "Drizzle ORM", description: "TypeScript ORM with SQL-like query builder for Postgres", category: "database" },
        { name: "Tailwind CSS v4", description: "Utility-first CSS with OKLCH colors & @theme", category: "styling" },
        { name: "shadcn/ui", description: "Beautiful, accessible components built on Radix UI", category: "components" },
        { name: "motion.dev", description: "Production-ready animation library for React", category: "animation" },
        { name: "oxlint", description: "Blazing fast linter written in Rust", category: "tooling" },
        { name: "Vitest", description: "Fast unit testing powered by Vite", category: "testing" },
      ],
    };
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return { user: ctx.user };
  }),

  auth: router({
    registration: publicProcedure.query(async () => {
      const allowSelfRegistration = await DBSettings.getBoolean("auth.allow_self_registration", true);

      return {
        allowSelfRegistration,
      };
    }),

    inviteStatus: publicProcedure
      .input(
        z.object({
          token: z.string().trim().min(1),
        }),
      )
      .query(async ({ input }) => {
        const invite = await DBInvites.getValidByToken(input.token);

        if (!invite) {
          return {
            valid: false as const,
          };
        }

        return {
          valid: true as const,
          email: invite.email,
          expiresAt: invite.expiresAt.toISOString(),
        };
      }),
  }),

  account: router({
    profile: protectedProcedure.query(async ({ ctx }) => {
      const user = await DBUsers.getById(ctx.user.id);
      if (!user) {
        throw new Error("User not found");
      }

      return { user };
    }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().trim().min(2).max(64),
          email: z.string().trim().email(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const updated = await DBUsers.updateProfile({
          userId: ctx.user.id,
          name: input.name,
          email: input.email,
        });

        await DBAudit.insert({
          category: "user",
          action: "profile.update",
          title: `Profile updated: ${updated.email}`,
          description: "User profile information was updated",
          actor: ctx.user.email,
          metadata: {
            userId: ctx.user.id,
            email: updated.email,
          },
        });

        return { user: updated };
      }),
  }),

  admin: router({
    users: superuserProcedure.query(async () => {
      return {
        items: await DBUsers.listForAdmin(),
      };
    }),

    profile: superuserProcedure.query(async ({ ctx }) => {
      const users = await DBUsers.listForAdmin();
      const currentUser = users.find((user) => user.id === ctx.user.id) ?? null;
      const superusers = users.filter((current) => current.role === "superuser");

      return {
        user: currentUser,
        stats: {
          usersCount: users.length,
          superusersCount: superusers.length,
        },
      };
    }),

    auditLog: superuserProcedure.query(async () => {
      const entries = await DBAudit.list({ limit: 120 });

      return {
        items: entries.map((entry) => ({
          id: entry.id,
          category: entry.category as "user" | "setting",
          title: entry.title,
          description: entry.description,
          at: entry.createdAt.toISOString(),
          actor: entry.actor,
          metadata: entry.metadata as Record<string, string>,
        })),
      };
    }),

    setUserRole: superuserProcedure
      .input(
        z.object({
          userId: z.string().min(1),
          role: z.enum(["user", "superuser"]),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.id === input.userId && input.role !== "superuser") {
          throw new Error("You cannot remove your own superuser role");
        }

        const users = await DBUsers.listForAdmin();
        const targetUser = users.find((u) => u.id === input.userId);
        const oldRole = targetUser?.role ?? "unknown";

        const updated = await DBUsers.setRole(input.userId, input.role);

        await DBAudit.insert({
          category: "user",
          action: "role.change",
          title: `Role changed: ${updated.email}`,
          description: `Role changed from '${oldRole}' to '${input.role}'`,
          actor: ctx.user.email,
          metadata: {
            userId: input.userId,
            email: updated.email,
            oldRole,
            newRole: input.role,
          },
        });

        return {
          user: updated,
        };
      }),

    invites: router({
      list: superuserProcedure.query(async () => {
        const invites = await DBInvites.listForAdmin();

        return {
          items: invites.map((invite) => ({
            id: invite.id,
            email: invite.email,
            role: invite.role,
            token: invite.token,
            expiresAt: invite.expiresAt.toISOString(),
            createdAt: invite.createdAt.toISOString(),
            usedAt: invite.usedAt?.toISOString() ?? null,
            revokedAt: invite.revokedAt?.toISOString() ?? null,
            usedByEmail: invite.usedByEmail,
          })),
        };
      }),

      create: superuserProcedure
        .input(
          z.object({
            email: z.string().trim().email(),
            expiresInDays: z.number().int().min(1).max(30).default(7),
          }),
        )
        .mutation(async ({ ctx, input }) => {
          const expiresAt = new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000);
          const invite = await DBInvites.create({
            email: input.email,
            createdByUserId: ctx.user.id,
            expiresAt,
          });

          await DBAudit.insert({
            category: "user",
            action: "invite.create",
            title: `Invite created: ${invite.email}`,
            description: "Admin created a registration invite link",
            actor: ctx.user.email,
            metadata: {
              inviteId: invite.id,
              email: invite.email,
              expiresAt: invite.expiresAt.toISOString(),
            },
          });

          return {
            invite: {
              id: invite.id,
              email: invite.email,
              token: invite.token,
              role: invite.role,
              expiresAt: invite.expiresAt.toISOString(),
              createdAt: invite.createdAt.toISOString(),
            },
          };
        }),

      revoke: superuserProcedure
        .input(
          z.object({
            inviteId: z.string().min(1),
          }),
        )
        .mutation(async ({ ctx, input }) => {
          const invite = await DBInvites.revokeById(input.inviteId);

          await DBAudit.insert({
            category: "user",
            action: "invite.revoke",
            title: `Invite revoked: ${invite.email}`,
            description: "Admin revoked a registration invite link",
            actor: ctx.user.email,
            metadata: {
              inviteId: invite.id,
              email: invite.email,
            },
          });

          return {
            invite: {
              id: invite.id,
              revokedAt: invite.revokedAt?.toISOString() ?? null,
            },
          };
        }),
    }),

    settings: router({
      list: superuserProcedure.query(async () => {
        const storedSettings = await DBSettings.getAll();
        const settingsMap = new Map(storedSettings.map((item) => [item.key, item.value]));

        return {
          items: systemSettingsRegistry.map((definition) => {
            const value = settingsMap.get(definition.key) ?? definition.defaultValue;

            return {
              ...definition,
              value,
              source: settingsMap.has(definition.key) ? "database" : "default",
            };
          }),
        };
      }),

      upsert: superuserProcedure
        .input(
          z.object({
            key: z.enum(systemSettingKeys),
            value: z.string(),
          }),
        )
        .mutation(async ({ ctx, input }) => {
          if (!validateSystemSettingValue(input.key, input.value)) {
            throw new Error(`Invalid value for system setting '${input.key}'`);
          }

          const setting = await DBSettings.upsert(input);

          const valuePreview =
            input.value.length > 90
              ? `${input.value.slice(0, 90)}...`
              : input.value;

          await DBAudit.insert({
            category: "setting",
            action: "setting.update",
            title: `Setting changed: ${input.key}`,
            description: "Setting value was updated",
            actor: ctx.user.email,
            metadata: { key: input.key, valuePreview },
          });

          return {
            setting,
          };
        }),

      reset: superuserProcedure
        .input(
          z.object({
            key: z.enum(systemSettingKeys),
          }),
        )
        .mutation(async ({ ctx, input }) => {
          await DBSettings.remove(input.key);

          await DBAudit.insert({
            category: "setting",
            action: "setting.reset",
            title: `Setting reset: ${input.key}`,
            description: "Setting was reset to default",
            actor: ctx.user.email,
            metadata: { key: input.key },
          });

          return {
            ok: true,
          };
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
