import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { ModuleRecord } from "@/lib/store";
import { useStore } from "@/lib/store";
import type { ModuleKey } from "@/lib/modules";

export interface UseModuleCRUDOptions {
  moduleKey: ModuleKey;
  searchFields?: (keyof ModuleRecord | string)[];
}

export function useModuleCRUD({ moduleKey, searchFields = ["name"] }: UseModuleCRUDOptions) {
  const navigate = useNavigate();
  const records = useStore((s) => s.records[moduleKey]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredRecords = records.filter((r: ModuleRecord) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return searchFields.some((field) => {
      const value = field === "name" ? r.name : r.meta?.[field as string];
      return value?.toString().toLowerCase().includes(query);
    });
  });

  const handleCreate = () => {
    navigate({ to: `/${moduleKey}/novo` });
  };

  const handleEdit = (id: string) => {
    navigate({ to: `/${moduleKey}/$id`, params: { id } as any });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este registro?")) {
      // Import removeRecord dynamically to avoid circular dependency
      import("@/lib/store").then(({ removeRecord }) => {
        removeRecord(moduleKey, id);
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleClearSelection = () => {
    setSelectedId(null);
  };

  return {
    records,
    filteredRecords,
    searchQuery,
    selectedId,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSearch,
    handleSelect,
    handleClearSelection,
  };
}
