import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Pencil, Trash2, Building2, MapPin, IdCard, Phone, Mail, Globe } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IndustrialAgent } from "@/components/industrial-copilot";
import { MODULES } from "@/lib/modules";
import { useModuleCRUD } from "@/hooks/useModuleCRUD";
import { cn } from "@/lib/utils";

const mod = MODULES.find((m) => m.key === "empresa")!;

export const Route = createFileRoute("/empresa/")({
  component: EmpresaList,
});

function EmpresaList() {
  const { filteredRecords, searchQuery, handleCreate, handleEdit, handleDelete, handleSearch } = useModuleCRUD({
    moduleKey: "empresa",
    searchFields: ["name", "nomeFantasia", "cnpj", "cidade"],
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Building2 className="size-3.5" /> {mod.group}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{mod.title}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{mod.description}</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      </header>

      <IndustrialAgent moduleKey="empresa" />
      {filteredRecords.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={handleCreate} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar empresas..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          {filteredRecords.map((record) => {
            const meta = record.meta || {};
            return (
              <article key={record.id} className="surface-elevated rounded-xl p-5">
                <header className="flex items-start gap-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <Building2 className="size-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold">{record.name}</h3>
                        <p className="text-xs text-muted-foreground">{meta.nomeFantasia || "—"}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(record.id)} className="gap-1.5"><Pencil className="size-3.5" />Editar</Button>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(record.id)}><Trash2 className="size-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                </header>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <IdCard className="size-3.5" /> {meta.cnpj || "—"}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> {meta.cidade ? `${meta.cidade}, ${meta.estado || ""}` : "—"}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="size-3.5" /> {meta.telefone || "—"}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
