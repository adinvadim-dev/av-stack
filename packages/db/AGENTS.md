# AGENTS.md (packages/db)

## Purpose

`packages/db` is the single source of truth for database structure and access patterns.

## Schema Organization

- Split schema by logical subschemas/modules when it grows (auth, settings, billing, etc.).
- Keep exported schema cohesive and easy to import from `src/schema.ts`.

## Query Organization

- Always keep database queries in dedicated services under `src/services`.
- Keep service APIs simple and explicit, for example:

```ts
export const DBSettings = {
  getAll() {},
  getByKey(key: string) {},
  upsert(input: { key: string; value: string }) {},
}
```

- Avoid putting DB queries in route handlers/components directly.
