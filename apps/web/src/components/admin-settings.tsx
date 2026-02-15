import {
  ChevronRight,
  KeyRound,
  Megaphone,
  Paintbrush,
  Search,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { SystemSettingKey } from "@/lib/system-settings";
import { cn } from "@/lib/utils";
import { useSettingsDraftStore } from "@/stores/settings-draft";

// ─── Types ────────────────────────────────────────────────────────────

type SettingItem = {
  key: SystemSettingKey;
  label: string;
  description: string;
  group: string;
  type: "text" | "textarea" | "boolean" | "number" | "select";
  value: string;
  defaultValue: string;
  source: string;
  placeholder?: string;
  min?: number;
  max?: number;
  options?: ReadonlyArray<{ value: string; label: string }>;
};

type GroupedSettings = Record<string, SettingItem[]>;

export interface AdminSettingsProps {
  groupedSettings: GroupedSettings;
  settingsCount: number;
  dirtySettingsCount: number;
  saveSetting: (key: SystemSettingKey, value: string) => Promise<void>;
  resetSetting: (key: SystemSettingKey, fallback: string) => Promise<void>;
  isSaving: boolean;
  isResetting: boolean;
}

const groupIcons: Record<string, React.ReactNode> = {
  General: <Settings2 className="size-4" />,
  Auth: <KeyRound className="size-4" />,
  Security: <ShieldCheck className="size-4" />,
  UI: <Paintbrush className="size-4" />,
  Marketing: <Megaphone className="size-4" />,
};

// ─── Shared Setting Control ───────────────────────────────────────────

function SettingControl({
  setting,
  draft,
  onDraftChange,
}: {
  setting: SettingItem;
  draft: string;
  onDraftChange: (value: string) => void;
}) {
  if (setting.type === "textarea") {
    return (
      <Textarea
        value={draft}
        placeholder={setting.placeholder}
        onChange={(e) => onDraftChange(e.target.value)}
        className="min-h-[80px]"
      />
    );
  }

  if (setting.type === "text" || setting.type === "number") {
    return (
      <Input
        type={setting.type === "number" ? "number" : "text"}
        value={draft}
        placeholder={setting.placeholder}
        min={setting.min}
        max={setting.max}
        onChange={(e) => onDraftChange(e.target.value)}
      />
    );
  }

  if (setting.type === "boolean") {
    return (
      <div className="flex items-center gap-3">
        <Switch
          checked={draft === "true"}
          onCheckedChange={(checked) =>
            onDraftChange(checked ? "true" : "false")
          }
        />
        <span className="text-sm text-muted-foreground">
          {draft === "true" ? "Enabled" : "Disabled"}
        </span>
      </div>
    );
  }

  if (setting.type === "select") {
    return (
      <Select value={draft} onValueChange={onDraftChange}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="Select value" />
        </SelectTrigger>
        <SelectContent>
          {setting.options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return null;
}

// ─── Settings Layout ──────────────────────────────────────────────────

function SettingsLayout(props: AdminSettingsProps) {
  const groups = Object.keys(props.groupedSettings);
  const { activeGroup, setActiveGroup, getDraft, setDraft } = useSettingsDraftStore();

  // Fall back to first available group if current group has no items
  const effectiveGroup = props.groupedSettings[activeGroup] ? activeGroup : (groups[0] ?? "General");
  const currentItems = props.groupedSettings[effectiveGroup] ?? [];

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 md:block">
        <nav className="sticky top-24 space-y-0.5">
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                effectiveGroup === group
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {groupIcons[group]}
              <span>{group}</span>
              <ChevronRight
                className={cn(
                  "ml-auto size-3.5 transition-opacity",
                  effectiveGroup === group ? "opacity-100" : "opacity-0"
                )}
              />
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile select */}
      <div className="md:hidden">
        <Select value={effectiveGroup} onValueChange={setActiveGroup}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-6 flex items-center gap-2 border-b pb-4">
          {groupIcons[effectiveGroup]}
          <h2 className="text-lg font-semibold">{effectiveGroup}</h2>
          <Badge variant="secondary" className="ml-auto">
            {currentItems.length} settings
          </Badge>
        </div>

        <div className="space-y-8">
          {currentItems.map((setting) => {
            const draft = getDraft(setting.key, setting.value);
            const isDirty = draft !== setting.value;

            return (
              <div key={setting.key}>
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      {setting.label}
                    </Label>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                  {isDirty && (
                    <Badge variant="outline" className="ml-2 shrink-0 text-xs">
                      modified
                    </Badge>
                  )}
                </div>

                <div className="mt-2 max-w-lg">
                  <SettingControl
                    setting={setting}
                    draft={draft}
                    onDraftChange={(v) => setDraft(setting.key, v)}
                  />
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <Button
                    size="sm"
                    disabled={props.isSaving || !isDirty}
                    onClick={() => props.saveSetting(setting.key, draft)}
                    className="h-8"
                  >
                    Save changes
                  </Button>
                  <Button
                    size="sm"
                    variant="link"
                    disabled={props.isResetting}
                    onClick={() =>
                      props.resetSetting(setting.key, setting.defaultValue)
                    }
                    className="h-8 text-muted-foreground"
                  >
                    Reset to default
                  </Button>
                  <span className="ml-auto font-mono text-xs text-muted-foreground/50">
                    {setting.key}
                  </span>
                </div>

                <Separator className="mt-6" />
              </div>
            );
          })}

          {currentItems.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No settings in this group.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Exported Component ──────────────────────────────────────────

export function AdminSettings(props: AdminSettingsProps) {
  const { filter, setFilter } = useSettingsDraftStore();

  return (
    <div className="space-y-6">
      {/* Filter + stats */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter settings..."
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {props.settingsCount} settings
          </Badge>
          {props.dirtySettingsCount > 0 && (
            <Badge variant="default">
              {props.dirtySettingsCount} unsaved
            </Badge>
          )}
        </div>
      </div>

      {/* Settings layout */}
      <SettingsLayout {...props} />
    </div>
  );
}
