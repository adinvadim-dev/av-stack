# TypeScript Starter

Production-ready monorepo starter for full-stack TypeScript applications.

## Stack

| Layer | Technology |
| --- | --- |
| Monorepo | Turborepo + pnpm workspaces |
| Framework | TanStack Start (SSR, file-based routing) |
| UI | React 19 + TypeScript (strict) |
| API | tRPC v11 |
| Auth | better-auth (email/password) |
| Database | Drizzle ORM + PostgreSQL |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Tooling | oxlint + Vitest |

## Quick Start

```bash
pnpm install
pnpm db:up
cp apps/web/.env.example apps/web/.env
pnpm db:migrate
pnpm dev
```

Open `http://localhost:3000`.

## First-Run Checklist

1. Initialize the template:
   ```bash
   pnpm init:template "Acme Platform" "@acme"
   ```
2. Edit `apps/web/.env` with secure values:
   - `BETTER_AUTH_SECRET` (min 16 chars)
   - `BETTER_AUTH_URL`
   - `DATABASE_URL`
3. Create your first account at `/auth`.
4. Promote first superuser:
   ```bash
   pnpm --filter @av-stack/web setup:superuser -- admin@example.com
   ```

## Security Defaults

- Admin APIs are protected by session + superuser role checks.
- tRPC context resolves better-auth session on each request.
- Environment variables are validated at startup.
- Role demotion prevents removing the last superuser.

## Scripts

```bash
pnpm dev
pnpm build
pnpm check
pnpm lint
pnpm typecheck
pnpm test
pnpm db:up
pnpm db:down
pnpm db:generate
pnpm db:migrate
pnpm init:template "App Name" "@scope"
```

## Deploy (Nixpacks/Coolify)

`nixpacks.toml` in repo root contains the default production setup:
- Node.js `22`
- `pnpm@10.28.2`
- Build command: `pnpm --filter @av-stack/web build`
- Start command: `cd apps/web && node server.mjs`

## Project Structure

```text
.
├── apps/
│   └── web/
├── packages/
│   ├── db/
│   └── typescript-config/
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

## License

MIT
