import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminAuditLog } from "@/components/admin-audit-log";
import { useTRPC } from "@/lib/trpc";

export const Route = createFileRoute("/admin/audit")({
  component: AdminAuditPage,
});

function AdminAuditPage() {
  const trpc = useTRPC();
  const auditLogQuery = useQuery(trpc.admin.auditLog.queryOptions());

  const [auditFilter, setAuditFilter] = useState<"all" | "user" | "setting">("all");

  const auditCount = auditLogQuery.data?.items.length ?? 0;

  const filteredAuditItems = useMemo(() => {
    const items = auditLogQuery.data?.items ?? [];
    if (auditFilter === "all") {
      return items;
    }
    return items.filter((item) => item.category === auditFilter);
  }, [auditFilter, auditLogQuery.data?.items]);

  return (
    <AdminAuditLog
      items={filteredAuditItems}
      filter={auditFilter}
      onFilterChange={setAuditFilter}
      totalCount={auditCount}
    />
  );
}
