# AGENTS.md (apps/web)

## App Overview

The `apps/web` package is a TanStack Start application with an admin panel, tRPC API, and full shadcn/ui component set.

## Toast Notification Conventions

This app uses **Sonner** for all toast notifications. The `<Toaster />` is mounted in `__root.tsx`.

### Mandatory Rules

1. **Use `toast.promise` for all async operations** — mutations, API calls, data fetches that trigger user-visible changes must use `toast.promise` so the user sees loading, success, and error states automatically.

2. **Always provide undo where possible** — when an action is reversible (role changes, setting updates, deletions), add an `action: { label: "Undo", onClick: ... }` to the toast. The undo callback should call the inverse mutation.

3. **All errors go to `toast.error`** — never silently catch errors. If a mutation fails, the user must see a toast with context about what failed.

4. **All successes go to `toast.success`** — the user must receive confirmation that their action completed.

5. **Import pattern** — always import from `"sonner"` directly:
   ```ts
   import { toast } from "sonner";
   ```

### Style Notes

- The Toaster uses custom CSS variables from `globals.css` (`--success`, `--warning`, `--info`, `--destructive-foreground`).
- Each toast type has a colored left accent border and glass backdrop.
- Action buttons inside toasts use `--primary` / `--primary-foreground` colors.
- Position: `bottom-right`. Close buttons enabled.

### Example Pattern

```ts
const previousValue = currentData.value;

toast.promise(
  mutation.mutateAsync(newPayload),
  {
    loading: "Saving changes...",
    success: "Changes saved",
    error: "Failed to save changes",
    action: {
      label: "Undo",
      onClick: () => mutation.mutate(previousPayload),
    },
  }
);
```
