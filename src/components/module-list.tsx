import * as React from "react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search, Pencil, Trash2, Building2, MapPin, IdCard, Phone, Mail, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { IndustrialAgent } from "@/components/industrial-copilot";
import { MODULES } from "@/lib/modules";
import { useModuleCRUD } from "@/hooks/useModuleCRUD";
import { cn } from "@/lib/utils";
import type { ModuleRecord } from "@/lib/store";

export interface ModuleListProps {
  moduleKey: string;
  renderItem?: (record: ModuleRecord, onEdit: (id: string) => void, onDelete: (id: string) => void) => React.ReactNode;
  searchFields?: string[];
  showSearch?: boolean;
  showAgent?: boolean;
}

export function ModuleList({
  moduleKey,
  renderItem,
  searchFields = ["name"],
  showSearch = true,
  showAgent = true,
}: ModuleListProps) {
  const navigate = useNavigate();
  const mod = MODULES.find((m) => m.key === moduleKey)!;
  const { filteredRecords, searchQuery, handleCreate, handleEdit, handleDelete, handleSearch } = useModuleCRUD({
    moduleKey: moduleKey as any,
    searchFields,
  }) as { filteredRecords: ModuleRecord[]; searchQuery: string; handleCreate: () => void; handleEdit: (id: string) => void; handleDelete: (id: string) => void; handleSearch: (q: string) => void };

  const defaultRenderItem = (record: ModuleRecord, onEdit: (id: string) => void) => (
    <article
      key={record.id}
      className="surface-elevated group rounded-xl p-5 transition hover:ring-1 hover:ring-primary/30 cursor-pointer"
      onClick={() => onEdit(record.id)}
    >
      <header className="flex items-start gap-3 mb-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
          <Building2 className="size-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold truncate">{record.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{record.meta?.nomeFantasia || record.name}</p>
        </div>
      </header>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground truncate">
            {record.meta?.cidade && record.meta?.estado ? `${record.meta.cidade}, ${record.meta.estado}` : "Cidade/Estado não informado"}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <IdCard className="mt-0.5 size-4 text-muted-foreground shrink-0" />
          <span className="font-mono text-muted-foreground truncate">{record.meta?.cnpj || "CNPJ não informado"}</span>
        </div>
      </div>

      <footer className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Cadastrada em {new Date(record.createdAt).toLocaleDateString("pt-BR")}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <Pencil className="size-4 text-muted-foreground" />
        </div>
      </footer>
    </article>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            {mod.icon && <mod.icon className="size-3.5" />} {mod.group}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{mod.title}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{mod.description}</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      </header>

      {showAgent && <IndustrialAgent moduleKey={moduleKey as any} />}

      {filteredRecords.length === 0 ? (
        <EmptyState
          icon={mod.icon}
          title={`Comece pelo módulo ${mod.title}`}
          description={mod.description}
          benefit={mod.benefit}
          checklist={mod.checklist}
          primaryCta={mod.primaryCta}
          onPrimary={handleCreate}
        />
      ) : (
        <>
          {showSearch && (
            <div className="surface-elevated flex items-center gap-3 rounded-xl px-4 py-3">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Badge variant="secondary" className="font-mono">{filteredRecords.length}</Badge>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecords.map((record: ModuleRecord) =>
              renderItem ? (
                renderItem(record, handleEdit, handleDelete)
              ) : (
                defaultRenderItem(record, handleEdit)
              )
            )}
            {filteredRecords.length === 0 && (
              <div className="col-span-full surface-elevated rounded-xl p-8 text-center text-sm text-muted-foreground">
                Nenhum resultado para "{searchQuery}".
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
