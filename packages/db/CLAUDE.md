# CLAUDE.md (packages/db)

## Database Development Rules

1. Prefer modular schema design
   - Group tables by domain and grow toward sub-schema files.
   - Keep shared exports centralized.

2. Keep queries in service objects
   - Use `src/services/*` for all DB reads/writes.
   - Favor explicit service objects such as `DBSettings`, `DBUsers`, etc.

3. Keep services intentionally small
   - Simple methods (`get`, `list`, `upsert`, `remove`, `setRole`) over large abstractions.
   - Return typed DB models or shaped DTOs for app use.

4. Migrations and schema stay aligned
   - Any table/column change should be reflected by generated Drizzle migrations.
