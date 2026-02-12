export const systemSettingKeys = [
  "general.app_name",
  "general.project_name",
  "general.support_email",
  "auth.allow_self_registration",
  "security.session_timeout_minutes",
  "ui.default_language",
  "marketing.homepage_hero_title",
] as const;

export type SystemSettingKey = (typeof systemSettingKeys)[number];

export type SystemSettingType = "text" | "textarea" | "boolean" | "number" | "select";

export type SystemSettingDefinition = {
  key: SystemSettingKey;
  label: string;
  description: string;
  group: "General" | "Auth" | "Security" | "UI" | "Marketing";
  type: SystemSettingType;
  defaultValue: string;
  placeholder?: string;
  min?: number;
  max?: number;
  options?: ReadonlyArray<{
    value: string;
    label: string;
  }>;
};

export const systemSettingsRegistry: ReadonlyArray<SystemSettingDefinition> = [
  {
    key: "general.app_name",
    label: "Application Name",
    description: "Displayed in browser title and admin shell.",
    group: "General",
    type: "text",
    defaultValue: "TypeScript Starter",
    placeholder: "Acme Platform",
  },
  {
    key: "general.project_name",
    label: "Project Name",
    description: "Name of the current project. Shown in dashboards and reports.",
    group: "General",
    type: "text",
    defaultValue: "",
    placeholder: "My Project",
  },
  {
    key: "general.support_email",
    label: "Support Email",
    description: "Primary contact email used in user-facing support blocks.",
    group: "General",
    type: "text",
    defaultValue: "support@example.com",
    placeholder: "support@company.com",
  },
  {
    key: "auth.allow_self_registration",
    label: "Allow Self Registration",
    description: "When disabled, users can sign in only if invited by admin.",
    group: "Auth",
    type: "boolean",
    defaultValue: "true",
  },
  {
    key: "security.session_timeout_minutes",
    label: "Session Timeout (minutes)",
    description: "Idle timeout before forcing re-authentication.",
    group: "Security",
    type: "number",
    defaultValue: "120",
    min: 15,
    max: 1440,
    placeholder: "120",
  },
  {
    key: "ui.default_language",
    label: "Default Language",
    description: "Used when user profile does not have language selected.",
    group: "UI",
    type: "select",
    defaultValue: "en",
    options: [
      { value: "en", label: "English" },
      { value: "ru", label: "Russian" },
      { value: "de", label: "German" },
    ],
  },
  {
    key: "marketing.homepage_hero_title",
    label: "Homepage Hero Title",
    description: "Main headline in landing hero section.",
    group: "Marketing",
    type: "textarea",
    defaultValue: "Build faster with a production-grade TypeScript stack.",
    placeholder: "Headline for homepage hero",
  },
];

const systemSettingByKey = new Map(systemSettingsRegistry.map((item) => [item.key, item]));

export function getSystemSettingDefinition(key: SystemSettingKey) {
  const setting = systemSettingByKey.get(key);
  if (!setting) {
    throw new Error(`Unknown system setting: ${key}`);
  }
  return setting;
}

export function validateSystemSettingValue(key: SystemSettingKey, value: string) {
  const definition = getSystemSettingDefinition(key);

  if (definition.type === "boolean") {
    return value === "true" || value === "false";
  }

  if (definition.type === "number") {
    if (!/^\d+$/.test(value)) {
      return false;
    }

    const asNumber = Number(value);
    if (definition.min !== undefined && asNumber < definition.min) {
      return false;
    }

    if (definition.max !== undefined && asNumber > definition.max) {
      return false;
    }

    return true;
  }

  if (definition.type === "select") {
    return definition.options?.some((option) => option.value === value) ?? false;
  }

  return value.trim().length > 0;
}
