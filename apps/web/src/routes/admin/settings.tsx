import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminSettings } from "@/components/admin-settings";
import type { SystemSettingKey } from "@/lib/system-settings";
import { useTRPC } from "@/lib/trpc";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const settingsQueryOptions = trpc.admin.settings.list.queryOptions();
  const auditLogQueryOptions = trpc.admin.auditLog.queryOptions();

  const settingsQuery = useQuery(settingsQueryOptions);

  const [settingsFilter, setSettingsFilter] = useState("");
  const [draftValues, setDraftValues] = useState<Partial<Record<SystemSettingKey, string>>>({});

  const upsertSettingMutation = useMutation(
    trpc.admin.settings.upsert.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: settingsQueryOptions.queryKey }),
          queryClient.invalidateQueries({ queryKey: auditLogQueryOptions.queryKey }),
        ]);
      },
    }),
  );

  const resetSettingMutation = useMutation(
    trpc.admin.settings.reset.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: settingsQueryOptions.queryKey }),
          queryClient.invalidateQueries({ queryKey: auditLogQueryOptions.queryKey }),
        ]);
      },
    }),
  );

  const settingsCount = settingsQuery.data?.items.length ?? 0;

  const groupedSettings = useMemo(() => {
    const items = settingsQuery.data?.items ?? [];
    const normalizedFilter = settingsFilter.trim().toLowerCase();

    const filtered = items.filter((setting) => {
      if (!normalizedFilter) {
        return true;
      }

      return (
        setting.label.toLowerCase().includes(normalizedFilter) ||
        setting.key.toLowerCase().includes(normalizedFilter) ||
        setting.description.toLowerCase().includes(normalizedFilter)
      );
    });

    return filtered.reduce<Record<string, typeof filtered>>((groups, current) => {
      const list = groups[current.group] ?? [];
      list.push(current);
      groups[current.group] = list;
      return groups;
    }, {});
  }, [settingsFilter, settingsQuery.data?.items]);

  const dirtySettingsCount = (settingsQuery.data?.items ?? []).filter((setting) => {
    const draft = draftValues[setting.key] ?? setting.value;
    return draft !== setting.value;
  }).length;

  const setDraftValue = (key: SystemSettingKey, value: string) => {
    setDraftValues((current) => ({ ...current, [key]: value }));
  };

  const getDraftValue = (key: SystemSettingKey, fallback: string) => {
    return draftValues[key] ?? fallback;
  };

  const saveSetting = async (key: SystemSettingKey, value: string) => {
    const previousValue = settingsQuery.data?.items.find((s) => s.key === key)?.value;
    await toast.promise(
      upsertSettingMutation.mutateAsync({ key, value }).then(() => {
        setDraftValue(key, value);
      }),
      {
        loading: `Saving ${key}...`,
        success: `Setting "${key}" saved`,
        error: `Failed to save "${key}"`,
        action: previousValue !== undefined && previousValue !== value
          ? {
              label: "Undo",
              onClick: () => {
                upsertSettingMutation.mutate({ key, value: previousValue });
                setDraftValue(key, previousValue);
              },
            }
          : undefined,
      }
    );
  };

  const resetSetting = async (key: SystemSettingKey, fallback: string) => {
    const previousValue = settingsQuery.data?.items.find((s) => s.key === key)?.value;
    await toast.promise(
      resetSettingMutation.mutateAsync({ key }).then(() => {
        setDraftValue(key, fallback);
      }),
      {
        loading: `Resetting ${key}...`,
        success: `Setting "${key}" reset to default`,
        error: `Failed to reset "${key}"`,
        action: previousValue !== undefined && previousValue !== fallback
          ? {
              label: "Undo",
              onClick: () => {
                upsertSettingMutation.mutate({ key, value: previousValue });
                setDraftValue(key, previousValue);
              },
            }
          : undefined,
      }
    );
  };

  return (
    <AdminSettings
      groupedSettings={groupedSettings}
      settingsFilter={settingsFilter}
      onFilterChange={setSettingsFilter}
      settingsCount={settingsCount}
      dirtySettingsCount={dirtySettingsCount}
      getDraftValue={getDraftValue}
      setDraftValue={setDraftValue}
      saveSetting={saveSetting}
      resetSetting={resetSetting}
      isSaving={upsertSettingMutation.isPending}
      isResetting={resetSettingMutation.isPending}
    />
  );
}
