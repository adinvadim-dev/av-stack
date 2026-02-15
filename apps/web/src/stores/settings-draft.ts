import { create } from "zustand";
import type { SystemSettingKey } from "@/lib/system-settings";

type SettingsDraftState = {
  /** Search / filter text for the settings list */
  filter: string;
  /** Currently selected group in the sidebar */
  activeGroup: string;
  /** Draft (unsaved) values keyed by setting key */
  drafts: Partial<Record<SystemSettingKey, string>>;
};

type SettingsDraftActions = {
  setFilter: (value: string) => void;
  setActiveGroup: (group: string) => void;
  getDraft: (key: SystemSettingKey, fallback: string) => string;
  setDraft: (key: SystemSettingKey, value: string) => void;
  resetDrafts: () => void;
};

export type SettingsDraftStore = SettingsDraftState & SettingsDraftActions;

export const useSettingsDraftStore = create<SettingsDraftStore>()((set, get) => ({
  filter: "",
  activeGroup: "General",
  drafts: {},

  setFilter: (value) => set({ filter: value }),
  setActiveGroup: (group) => set({ activeGroup: group }),

  getDraft: (key, fallback) => get().drafts[key] ?? fallback,

  setDraft: (key, value) =>
    set((state) => ({
      drafts: { ...state.drafts, [key]: value },
    })),

  resetDrafts: () => set({ drafts: {} }),
}));
