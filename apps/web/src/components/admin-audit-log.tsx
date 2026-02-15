import { useMemo } from "react";
import {
  ArrowUpRight,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useAuditLogStore } from "@/stores/audit-log";

// ─── Types ────────────────────────────────────────────────────────────

type AuditItem = {
  id: string;
  category: "user" | "setting";
  title: string;
  description: string;
  at: string;
  actor: string;
  metadata: Record<string, string>;
};

export interface AdminAuditLogProps {
  items: AuditItem[];
  totalCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatTimestampFull(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// ─── Main Exported Component (Stripe Design) ─────────────────────────

export function AdminAuditLog({
  items,
  totalCount,
}: AdminAuditLogProps) {
  const { search, setSearch, filter, setFilter, selectedId, toggleSelectedId, setSelectedId } =
    useAuditLogStore();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.actor.toLowerCase().includes(q) ||
        Object.values(item.metadata).some((v) =>
          v.toLowerCase().includes(q),
        ),
    );
  }, [items, search]);

  const selectedItem = filtered.find((i) => i.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{totalCount} events total</Badge>
        <Badge variant="outline">{items.length} visible</Badge>
      </div>

      <div className="flex gap-6">
        {/* Main table area */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs..."
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-1.5">
              {(["all", "user", "setting"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    filter === cat
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {cat === "all" ? "All" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[180px]">Time</TableHead>
                  <TableHead className="w-[90px]">Type</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead className="w-[100px]">Actor</TableHead>
                  <TableHead className="w-[40px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow
                    key={item.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedId === item.id && "bg-muted/50",
                    )}
                    onClick={() => toggleSelectedId(item.id)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatTimestamp(item.at)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                          item.category === "user"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
                        )}
                      >
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs">{item.actor}</TableCell>
                    <TableCell>
                      <ArrowUpRight className="size-3.5 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No events found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Detail side panel */}
        {selectedItem && (
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Event Details</h3>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>
              <Separator />
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Event
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {selectedItem.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedItem.description}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Category
                  </p>
                  <Badge
                    variant={
                      selectedItem.category === "user"
                        ? "default"
                        : "secondary"
                    }
                    className="mt-1"
                  >
                    {selectedItem.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Timestamp
                  </p>
                  <p className="mt-1 font-mono text-xs">
                    {formatTimestampFull(selectedItem.at)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Actor
                  </p>
                  <p className="mt-1 text-sm">{selectedItem.actor}</p>
                </div>
                <Separator />
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Metadata
                  </p>
                  <div className="space-y-2">
                    {Object.entries(selectedItem.metadata).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="rounded-md bg-muted/50 px-2.5 py-1.5"
                        >
                          <p className="text-[10px] text-muted-foreground">
                            {key}
                          </p>
                          <p className="break-all font-mono text-xs">
                            {value}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
