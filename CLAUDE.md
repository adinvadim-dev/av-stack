# CLAUDE.md

## Architecture Notes

This repository is a starter template with a clear split between app runtime code and reusable packages:

- `apps/web` owns pages/routes, UI, API handlers, and app-specific integrations.
- `packages/db` owns schema definitions and data access services.

## Data Access Rules

- Do not scatter SQL/ORM calls across UI or route files.
- Add and use DB services in `packages/db/src/services`.
- Service style should stay simple and predictable, e.g.:

```ts
export const DBSettings = {
  getAll() {
    // query here
  },
}
```

## Quality Bar

- Strict TypeScript types.
- Keep public API shape stable where possible.
- Add minimal docs updates for new features (scripts/routes/capabilities).
