import { createFileRoute, Link, useNavigate, Outlet } from "@tanstack/react-router";
import { Plus, Search, Pencil, Trash2, Building2, MapPin, IdCard, Phone, Mail, Globe } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IndustrialAgent } from "@/components/industrial-copilot";
import { MODULES } from "@/lib/modules";
import { useModuleCRUD } from "@/hooks/useModuleCRUD";
import { cn } from "@/lib/utils";

const mod = MODULES.find((m) => m.key === "empresa")!;


export const Route = createFileRoute("/empresa")({
  head: () => ({
    meta: [
      { title: `${mod.title} — Industrial OS` },
      { name: "description", content: mod.description },
    ],
  }),
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

function EmpresaList() {
  const navigate = useNavigate();
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
        <EmptyStateWithLink />
      ) : (
        <>
          <div className="surface-elevated flex items-center gap-3 rounded-xl px-4 py-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar por razão social, nome fantasia, CNPJ ou cidade…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Badge variant="secondary" className="font-mono">{filteredRecords.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecords.map((r) => (
              <article
                key={r.id}
                className="surface-elevated group rounded-xl p-5 transition hover:ring-1 hover:ring-primary/30 cursor-pointer"
                onClick={() => handleEdit(r.id)}
              >
                <header className="flex items-start gap-3 mb-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <Building2 className="size-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold truncate">{r.meta?.nomeFantasia || r.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{r.name}</p>
                  </div>
                </header>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground truncate">
                      {r.meta?.cidade && r.meta?.estado ? `${r.meta.cidade}, ${r.meta.estado}` : "Cidade/Estado não informado"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <IdCard className="mt-0.5 size-4 text-muted-foreground shrink-0" />
                    <span className="font-mono text-muted-foreground truncate">{r.meta?.cnpj || "CNPJ não informado"}</span>
                  </div>
                  {r.meta?.telefone && (
                    <div className="flex items-start gap-2">
                      <Phone className="mt-0.5 size-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground truncate">{r.meta.telefone}</span>
                    </div>
                  )}
                  {r.meta?.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="mt-0.5 size-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground truncate">{r.meta.email}</span>
                    </div>
                  )}
                  {r.meta?.website && (
                    <div className="flex items-start gap-2">
                      <Globe className="mt-0.5 size-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground truncate">{r.meta.website}</span>
                    </div>
                  )}
                </div>

                <footer className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Cadastrada em {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <Pencil className="size-4 text-muted-foreground" />
                  </div>
                </footer>
              </article>
            ))}
            {filteredRecords.length === 0 && (
              <div className="col-span-full surface-elevated rounded-xl p-8 text-center text-sm text-muted-foreground">
                Nenhuma empresa para "{searchQuery}".
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyStateWithLink() {
  const navigate = useNavigate();
  return (
    <EmptyState
      icon={mod.icon}
      title={`Comece pelo módulo ${mod.title}`}
      description={mod.description}
      benefit={mod.benefit}
      checklist={mod.checklist}
      primaryCta={mod.primaryCta}
      onPrimary={() => navigate({ to: "/empresa/novo" })}
    />
  );
}

