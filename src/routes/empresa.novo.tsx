import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmpresaForm } from "@/components/empresa-form";
import { MODULES } from "@/lib/modules";

const mod = MODULES.find((m) => m.key === "empresa")!;

export const Route = createFileRoute("/empresa/novo")({
  head: () => ({
    meta: [
      { title: `Nova empresa — Industrial OS` },
      { name: "description", content: mod.description },
    ],
  }),
  component: () => (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Link to="/empresa" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ChevronLeft className="size-3.5" /> Voltar para Empresa
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Cadastrar empresa</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{mod.benefit}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_280px] md:items-start">
          <EmpresaForm mode={{ kind: "create" }} />
          <aside className="surface-elevated rounded-xl p-5">
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Checklist inicial
            </div>
            <ul className="space-y-2 text-sm">
              {mod.checklist.map((c) => (
                <li key={c} className="flex items-start gap-2">
                  <span className="mt-0.5 grid size-4 place-items-center rounded-full border border-border bg-background">
                    <Check className="size-2.5 text-muted-foreground" />
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </AppShell>
  ),
});
