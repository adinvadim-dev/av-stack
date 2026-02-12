# CLAUDE.md (apps/web)

## Toast & Notification Rules

All user-facing feedback MUST go through Sonner toasts (`import { toast } from "sonner"`).

### Async Operations

- **Always** wrap async calls (mutations, fetches, server actions) with `toast.promise`:

```ts
toast.promise(
  mutateAsync(payload),
  {
    loading: "Saving...",
    success: "Saved!",
    error: "Failed to save",
  }
);
```

### Undo Pattern

- Wherever a destructive or reversible action is performed (role change, setting update, deletion), provide an **Undo** action inside the toast:

```ts
toast.promise(doAction(), {
  loading: "Updating...",
  success: "Updated",
  error: "Failed",
  action: {
    label: "Undo",
    onClick: () => revertAction(),
  },
});
```

### Error & Success Reporting

- **Errors**: Always surface via `toast.error(message)` or the `error` field of `toast.promise`. Never silently swallow errors.
- **Success**: Always confirm via `toast.success(message)` or the `success` field of `toast.promise`. Users must know their action completed.
- **Warnings**: Use `toast.warning()` for non-blocking cautions (e.g. approaching limits).
- **Info**: Use `toast.info()` for neutral informational updates.

### Do NOT

- Use `alert()` or `console.log` for user-facing feedback.
- Show inline error text when a toast would suffice.
- Fire toasts for trivial UI state changes (tab switches, filter changes).
