# AV Stack

Production-ready monorepo template for full-stack TypeScript applications.

## Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | Turborepo + pnpm workspaces |
| **Framework** | TanStack Start (SSR, file-based routing) |
| **UI** | React 19 + TypeScript (strict) |
| **API** | tRPC v11 (end-to-end typesafe) |
| **Auth** | better-auth (email/password, OAuth-ready) |
| **Database** | Drizzle ORM + PostgreSQL |
| **Styling** | Tailwind CSS v4 + shadcn/ui (OKLCH colors) |
| **Animation** | motion.dev + tailwindcss-motion |
| **Linting** | oxlint (Rust-based, fast) |
| **Testing** | Vitest |

## Getting Started

```bash
# Clone
git clone https://github.com/adinvadim-dev/av-stack.git
cd av-stack

# Install
pnpm install

# Set up environment
cp apps/web/.env.example apps/web/.env
# Edit .env with your DATABASE_URL and BETTER_AUTH_SECRET

# Generate DB migrations
pnpm db:generate

# Run DB migrations
pnpm db:migrate

# Dev
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps
pnpm typecheck    # TypeScript type checking
pnpm lint         # Lint with oxlint
pnpm test         # Run tests with vitest
pnpm db:generate  # Generate Drizzle migrations
pnpm db:migrate   # Apply Drizzle migrations
```

## Structure

```
av-stack/
├── apps/
│   └── web/                 # TanStack Start app
│       ├── src/
│       │   ├── routes/      # File-based routing
│       │   ├── components/  # UI components (shadcn/ui)
│       │   ├── lib/         # Utilities, auth client, tRPC
│       │   ├── server/      # tRPC router & procedures
│       │   └── styles/      # Tailwind CSS globals
│       └── ...
├── packages/
│   ├── db/                  # Drizzle ORM schema & client
│   └── typescript-config/   # Shared TypeScript configs
├── turbo.json
└── pnpm-workspace.yaml
```

## License

MIT
