import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Check, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmpresaForm } from "@/components/empresa-form";
import { Button } from "@/components/ui/button";
import { MODULES } from "@/lib/modules";
import { removeRecord, useStore } from "@/lib/store";

const mod = MODULES.find((m) => m.key === "empresa")!;

export const Route = createFileRoute("/empresa/$id")({
  head: () => ({ meta: [{ title: `Editar empresa — Industrial OS` }] }),
  component: EditEmpresa,
});

function EditEmpresa() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();
  const record = useStore((s) => s.records.empresa.find((r) => r.id === id));

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Link to="/empresa" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ChevronLeft className="size-3.5" /> Voltar para Empresa
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {record ? record.name : "Empresa não encontrada"}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{mod.benefit}</p>
        </div>

        {!record ? (
          <div className="surface-elevated rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">
              O registro foi removido ou o link está incorreto.
            </p>
            <Button asChild className="mt-4">
              <Link to="/empresa">Voltar para a lista</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1fr_280px] md:items-start">
            <EmpresaForm mode={{ kind: "edit", record }} />
            <aside className="space-y-4">
              <div className="surface-elevated rounded-xl p-5">
                <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Checklist inicial
                </div>
                <ul className="space-y-2 text-sm">
                  {mod.checklist.map((c) => {
                    const done = checklistDone(c, record);
                    return (
                      <li key={c} className="flex items-start gap-2">
                        <span className={`mt-0.5 grid size-4 place-items-center rounded-full border ${done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>
                          <Check className={`size-2.5 ${done ? "" : "text-muted-foreground"}`} />
                        </span>
                        <span className={done ? "line-through text-muted-foreground" : ""}>{c}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="surface-elevated rounded-xl p-5">
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Zona de perigo
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  Remover desfaz o cadastro desta empresa em todos os relatórios.
                </p>
                <Button
                  variant="outline" size="sm"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm(`Remover "${record.name}"?`)) {
                      removeRecord("empresa", record.id);
                      navigate({ to: "/empresa" });
                    }
                  }}
                >
                  <Trash2 className="size-3.5" /> Remover empresa
                </Button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function checklistDone(item: string, record: { name: string; meta?: Record<string, string> }) {
  const lower = item.toLowerCase();
  if (lower.includes("razão social") || lower.includes("cnpj")) return !!record.meta?.cnpj;
  if (lower.includes("endereço")) return !!record.meta?.endereco;
  if (lower.includes("logotipo")) return !!record.meta?.logotipo;
  if (lower.includes("responsável")) return !!record.meta?.responsavel;
  return false;
}
