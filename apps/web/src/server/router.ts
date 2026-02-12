import { publicProcedure, router, z } from "./trpc";

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
        { name: "tailwindcss-motion", description: "Motion utilities as Tailwind classes", category: "animation" },
        { name: "oxlint", description: "Blazing fast linter written in Rust", category: "tooling" },
        { name: "Vitest", description: "Fast unit testing powered by Vite", category: "testing" },
      ],
    };
  }),
});

export type AppRouter = typeof appRouter;
