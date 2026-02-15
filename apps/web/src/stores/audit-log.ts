import { create } from "zustand";

type AuditCategory = "all" | "user" | "setting";

type AuditLogState = {
  /** Category chip filter */
  filter: AuditCategory;
  /** Free-text search query */
  search: string;
  /** Currently selected event id for the detail side panel */
  selectedId: string | null;
};

type AuditLogActions = {
  setFilter: (value: AuditCategory) => void;
  setSearch: (value: string) => void;
  setSelectedId: (id: string | null) => void;
  toggleSelectedId: (id: string) => void;
};

export type AuditLogStore = AuditLogState & AuditLogActions;

export const useAuditLogStore = create<AuditLogStore>()((set, get) => ({
  filter: "all",
  search: "",
  selectedId: null,

  setFilter: (value) => set({ filter: value }),
  setSearch: (value) => set({ search: value }),
  setSelectedId: (id) => set({ selectedId: id }),
  toggleSelectedId: (id) =>
    set({ selectedId: get().selectedId === id ? null : id }),
}));
