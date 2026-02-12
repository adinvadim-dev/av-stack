import { initTRPC } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { DBUsers } from "@av-stack/db/services/users";
import { auth } from "@/lib/auth";

type SessionData = Awaited<ReturnType<typeof auth.api.getSession>>;

type TRPCContext = {
  session: SessionData;
};

export async function createTRPCContext({ headers }: { headers: Headers }): Promise<TRPCContext> {
  const session = await auth.api.getSession({ headers });
  return { session };
}

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign in required" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
    },
  });
});

export const superuserProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const dbUser = await DBUsers.getById(ctx.user.id);
  if (!dbUser || dbUser.role !== "superuser") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Superuser access required" });
  }

  return next();
});

export { z };
