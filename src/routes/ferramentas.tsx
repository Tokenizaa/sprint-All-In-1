import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Wrench, Trash2, Pencil, Calendar, Clock, AlertTriangle, TrendingUp, CheckCircle, XCircle, Settings, BarChart3, Activity, Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ModuleHeader } from "@/components/module-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { IndustrialAgent } from "@/components/industrial-copilot";
import { MODULES } from "@/lib/modules";
import { removeRecord, useStore, type ModuleRecord } from "@/lib/store";
import { useModuleForm } from "@/hooks/useModuleForm";
import { cn } from "@/lib/utils";

const mod = MODULES.find((m) => m.key === "ferramentas")!;

export const Route = createFileRoute("/ferramentas")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Draft = {
  name: string; tipo: string; setor: string; status: string;
  aquisicao: string; manutencoes: string; vidautil: string; uso: string;
};
const empty: Draft = { name:"", tipo:"", setor:"", status:"", aquisicao:"", manutencoes:"", vidautil:"", uso:"" };

function Page() {
  const records = useStore((s) => s.records.ferramentas);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);

  const summary = records.reduce((acc, r) => {
    acc.total += 1;
    if (r.meta?.tipo === "Molde") acc.molde += 1;
    if (r.meta?.tipo === "Gabarito") acc.gabarito += 1;
    if (r.meta?.tipo === "Ferramenta") acc.ferramenta += 1;
    return acc;
  }, { total: 0, molde: 0, gabarito: 0, ferramenta: 0 });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ModuleHeader mod={mod} action={records.length > 0 && (
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      )} />

      <IndustrialAgent moduleKey="ferramentas" />
      {records.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {records.map((r) => {
              const status = r.meta?.status || "Ativo";
              const needsMaintenance = status === "Manutenção";
              return (
                <article key={r.id} className="surface-elevated group rounded-xl p-5 transition hover:ring-1 hover:ring-primary/30">
                  <header className="flex items-start gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <Wrench className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-semibold">{r.name}</h3>
                          <p className="text-xs text-muted-foreground">{r.meta?.tipo ?? "—"} · {r.meta?.setor ?? "—"}</p>
                        </div>
                        <Badge variant={needsMaintenance ? "destructive" : status === "Ativo" ? "default" : "secondary"} className="shrink-0 text-[10px]">
                          {status}
                        </Badge>
                      </div>
                    </div>
                  </header>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Calendar className="size-3" /> Aquisição
                      </div>
                      <div className="mt-1 text-sm font-semibold">{r.meta?.aquisicao || "—"}</div>
                      <div className="text-[10px] text-muted-foreground">Vida útil: {r.meta?.vidautil || "—"}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Settings className="size-3" /> Manutenções
                      </div>
                      <div className="mt-1 text-sm font-semibold">{r.meta?.manutencoes || "—"}</div>
                      <div className="text-[10px] text-muted-foreground">Última: {r.meta?.aquisicao || "—"}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Activity className="size-3" /> Uso
                      </div>
                      <div className="mt-1 text-sm font-semibold">{r.meta?.uso || "—"}</div>
                      <div className="text-[10px] text-muted-foreground">Frequência: Alta</div>
                    </div>
                  </div>

                  <footer className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Settings className="size-3.5" />
                        <span>{r.meta?.setor || "Sem setor"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
                      <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setEditing(r); setOpen(true); }}>
                        <Pencil className="size-3.5" /> Gerenciar
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => { if (confirm(`Remover "${r.name}"?`)) removeRecord("ferramentas", r.id); }}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </footer>
                </article>
              );
            })}
          </div>

          <aside className="space-y-4">
            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <BarChart3 className="size-3.5" /> Resumo
              </div>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Total</div>
                    <div className="font-mono text-lg font-semibold">{summary.total}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Moldes</div>
                    <div className="font-mono text-lg font-semibold text-blue-500">{summary.molde}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Gabaritos</div>
                    <div className="font-mono text-lg font-semibold text-amber-500">{summary.gabarito}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Ferramentas</div>
                    <div className="font-mono text-lg font-semibold text-purple-500">{summary.ferramenta}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <AlertTriangle className="size-3.5" /> Ferramentas em Manutenção
              </div>
              <div className="mt-4 space-y-2">
                <MaintenanceTool name="Molde Colchão King" issue="Desgaste excessivo" priority="high" />
                <MaintenanceTool name="Gabarito Corte" issue="Ajuste necessário" priority="medium" />
                <MaintenanceTool name="Ferramenta Prensagem" issue="Troca de peças" priority="low" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="size-3.5" /> Ciclo de Vida
              </div>
              <div className="mt-4 space-y-2">
                <LifecycleItem name="Molde Pocket" progress={75} status="Em uso" />
                <LifecycleItem name="Gabarito Casal" progress={90} status="Próximo fim" />
                <LifecycleItem name="Molde Solteiro" progress={100} status="Substituir" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Activity className="size-3.5" /> Utilização por Setor
              </div>
              <div className="mt-4 space-y-2">
                <UsageBar sector="Corte" value={85} />
                <UsageBar sector="Montagem" value={92} />
                <UsageBar sector="Acabamento" value={78} />
              </div>
            </div>
          </aside>
        </div>
      )}
      <FerramentaForm open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function MaintenanceTool({ name, issue, priority }: { name: string; issue: string; priority: "high" | "medium" | "low" }) {
  const config = {
    high: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
    medium: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    low: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  };
  const c = config[priority];
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border p-2.5", c.border, c.bg)}>
      <div className={cn("grid size-5 shrink-0 place-items-center rounded-md", c.bg, c.color)}>
        <AlertTriangle className="size-3" />
      </div>
      <div className="flex-1">
        <div className="text-xs font-medium">{name}</div>
        <div className="text-[10px] text-muted-foreground">{issue}</div>
      </div>
    </div>
  );
}

function LifecycleItem({ name, progress, status }: { name: string; progress: number; status: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{name}</span>
        <Badge variant="outline" className="text-[10px]">{status}</Badge>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", progress >= 90 ? "bg-red-500" : progress >= 70 ? "bg-amber-500" : "bg-green-500")} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function UsageBar({ sector, value }: { sector: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-[10px] text-muted-foreground">{sector}</div>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} />
      </div>
      <div className="w-10 text-right font-mono text-xs">{value}%</div>
    </div>
  );
}

function FerramentaForm({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: ModuleRecord | null }) {
  const { data, setField, canSave, submit, reset, setData } = useModuleForm<Draft>({
    moduleKey: "ferramentas",
    initialData: empty,
    toRecord: (d) => {
      const meta: Record<string, string> = {};
      for (const [k, v] of Object.entries(d)) {
        if (k !== "name" && v) meta[k] = v;
      }
      return { name: d.name.trim(), meta };
    },
    validate: (d) => {
      if (d.name.trim().length === 0) {
        return { name: "Nome é obrigatório" };
      }
      return {};
    },
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        const meta = editing.meta || {};
        setData({
          name: editing.name,
          tipo: meta.tipo || "",
          setor: meta.setor || "",
          status: meta.status || "",
          aquisicao: meta.aquisicao || "",
          manutencoes: meta.manutencoes || "",
          vidautil: meta.vidautil || "",
          uso: meta.uso || "",
        });
      } else {
        reset();
      }
    }
  }, [open, editing, reset, setData]);

  const handleSave = () => {
    submit(editing ? { kind: "edit", record: editing! } : { kind: "create" });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle>{editing ? "Editar ferramenta" : "Nova ferramenta"}</SheetTitle>
          <SheetDescription>Cadastre moldes, gabaritos e ferramentas auxiliares.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome da ferramenta *</Label>
            <Input autoFocus value={data.name} onChange={(e) => setField("name", e.target.value)} placeholder="Ex.: Molde Colchão Pocket" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={data.tipo} onChange={(e) => setField("tipo", e.target.value)}>
                <option value="">Selecione...</option>
                <option>Molde</option>
                <option>Gabarito</option>
                <option>Ferramenta</option>
                <option>Dispositivo</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Setor</Label>
              <Input value={data.setor} onChange={(e) => setField("setor", e.target.value)} placeholder="Ex.: Galpão A" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={data.status} onChange={(e) => setField("status", e.target.value)}>
                <option value="">Selecione...</option>
                <option>Ativo</option>
                <option>Manutenção</option>
                <option>Inativo</option>
                <option>Descartado</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data de aquisição</Label>
              <Input type="date" value={data.aquisicao} onChange={(e) => setField("aquisicao", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Vida útil (anos)</Label>
              <Input type="number" value={data.vidautil} onChange={(e) => setField("vidautil", e.target.value)} placeholder="Ex.: 5" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Manutenções realizadas</Label>
              <Input type="number" value={data.manutencoes} onChange={(e) => setField("manutencoes", e.target.value)} placeholder="Ex.: 3" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Frequência de uso</Label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={data.uso} onChange={(e) => setField("uso", e.target.value)}>
              <option value="">Selecione...</option>
              <option>Alta</option>
              <option>Média</option>
              <option>Baixa</option>
            </select>
          </div>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!canSave} className="gap-1.5"><Check className="size-4" /> {editing ? "Salvar" : "Criar ferramenta"}</Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
