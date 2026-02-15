import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminAuditLog } from "@/components/admin-audit-log";
import { useTRPC } from "@/lib/trpc";
import { useAuditLogStore } from "@/stores/audit-log";

export const Route = createFileRoute("/admin/audit")({
  component: AdminAuditPage,
});

function AdminAuditPage() {
  const trpc = useTRPC();
  const auditLogQuery = useQuery(trpc.admin.auditLog.queryOptions());
  const filter = useAuditLogStore((s) => s.filter);

  const auditCount = auditLogQuery.data?.items.length ?? 0;

  const filteredAuditItems = useMemo(() => {
    const items = auditLogQuery.data?.items ?? [];
    if (filter === "all") {
      return items;
    }
    return items.filter((item: { category: string }) => item.category === filter);
  }, [filter, auditLogQuery.data?.items]);

  return (
    <AdminAuditLog
      items={filteredAuditItems}
      totalCount={auditCount}
    />
  );
}
