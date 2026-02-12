# AGENTS.md

## Project Purpose

AV Stack is a production-ready monorepo starter for full-stack TypeScript applications.

## High-Level Structure

- `apps/web`: TanStack Start app (SSR + file-based routes), UI, tRPC server, auth integration.
- `packages/db`: Drizzle ORM schema, DB client, and DB services.
- `packages/typescript-config`: shared TypeScript config package.

## Core Stack

- Monorepo: Turborepo + pnpm workspaces
- Frontend: React 19 + TanStack Start + TanStack Router + TanStack Query
- API: tRPC v11
- Database: PostgreSQL + Drizzle ORM
- Auth: better-auth
- Styling: Tailwind CSS v4 + shadcn/ui
- Tooling: TypeScript, Vitest, oxlint

## Conventions

- Keep API/business logic explicit and strongly typed.
- Prefer small reusable UI components.
- Keep DB access in dedicated services under `packages/db/src/services`.
- Keep documentation and examples in sync with implemented features.
