import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Building2, Trash2, Pencil, MapPin, Users, Cog, Layers, TrendingUp, BarChart3, Activity, ChevronRight, AlertTriangle, Check } from "lucide-react";
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

const mod = MODULES.find((m) => m.key === "setores")!;

export const Route = createFileRoute("/setores")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Draft = {
  name: string; tipo: string; unidade: string; responsavel: string;
  capacidade: string; ocupacao: string; equipamentos: string; funcionarios: string;
};
const empty: Draft = { name:"", tipo:"", unidade:"", responsavel:"", capacidade:"", ocupacao:"", equipamentos:"", funcionarios:"" };

function Page() {
  const records = useStore((s) => s.records.setores);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);

  const summary = records.reduce((acc, r) => {
    acc.total += 1;
    if (r.meta?.tipo === "Produção") acc.producao += 1;
    if (r.meta?.tipo === "Estoque") acc.estoque += 1;
    if (r.meta?.tipo === "Administrativo") acc.administrativo += 1;
    return acc;
  }, { total: 0, producao: 0, estoque: 0, administrativo: 0 });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ModuleHeader mod={mod} action={records.length > 0 && (
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      )} />

      <IndustrialAgent moduleKey="setores" />
      {records.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {records.map((r) => {
              const ocupacao = Number(r.meta?.ocupacao) || 0;
              const isHighOccupancy = ocupacao > 85;
              return (
                <article key={r.id} className="surface-elevated group rounded-xl p-5 transition hover:ring-1 hover:ring-primary/30">
                  <header className="flex items-start gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <Building2 className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-semibold">{r.name}</h3>
                          <p className="text-xs text-muted-foreground">{r.meta?.tipo ?? "—"} · {r.meta?.unidade ?? "—"}</p>
                        </div>
                        <Badge variant={isHighOccupancy ? "destructive" : "secondary"} className="shrink-0 text-[10px]">
                          {isHighOccupancy ? "Alta ocupação" : "Normal"}
                        </Badge>
                      </div>
                    </div>
                  </header>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Users className="size-3" /> Funcionários
                      </div>
                      <div className="mt-1 text-sm font-semibold">{r.meta?.funcionarios || "—"}</div>
                      <div className="text-[10px] text-muted-foreground">Resp: {r.meta?.responsavel || "—"}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Cog className="size-3" /> Equipamentos
                      </div>
                      <div className="mt-1 text-sm font-semibold">{r.meta?.equipamentos || "—"}</div>
                      <div className="text-[10px] text-muted-foreground">Capacidade: {r.meta?.capacidade || "—"}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Activity className="size-3" /> Ocupação
                      </div>
                      <div className="mt-1 text-sm font-semibold">{ocupacao}%</div>
                      <div className="h-1.5 w-full rounded-full bg-muted mt-1">
                        <div className={cn("h-full rounded-full transition-all", isHighOccupancy ? "bg-red-500" : "bg-green-500")} style={{ width: `${ocupacao}%` }} />
                      </div>
                    </div>
                  </div>

                  <footer className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        <span>{r.meta?.unidade || "Sem unidade"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
                      <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setEditing(r); setOpen(true); }}>
                        <Pencil className="size-3.5" /> Gerenciar
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => { if (confirm(`Remover "${r.name}"?`)) removeRecord("setores", r.id); }}>
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
                    <div className="text-muted-foreground">Produção</div>
                    <div className="font-mono text-lg font-semibold text-blue-500">{summary.producao}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Estoque</div>
                    <div className="font-mono text-lg font-semibold text-amber-500">{summary.estoque}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Admin</div>
                    <div className="font-mono text-lg font-semibold text-purple-500">{summary.administrativo}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Layers className="size-3.5" /> Hierarquia
              </div>
              <div className="mt-4 space-y-2">
                <HierarchyItem name="Fábrica Matriz" level={0} count={12} />
                <HierarchyItem name="Galpão A" level={1} count={5} />
                <HierarchyItem name="Galpão B" level={1} count={4} />
                <HierarchyItem name="Escritório" level={1} count={3} />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <AlertTriangle className="size-3.5" /> Pontos de Atenção
              </div>
              <div className="mt-4 space-y-2">
                <AlertItem sector="Galpão A - Corte" issue="Capacidade próxima do limite" severity="high" />
                <AlertItem sector="Estoque Principal" issue="Espaço insuficiente" severity="medium" />
                <AlertItem sector="Galpão B" issue="Ocupação elevada" severity="low" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="size-3.5" /> Ocupação por Setor
              </div>
              <div className="mt-4 space-y-2">
                <OccupationBar sector="Corte" value={92} />
                <OccupationBar sector="Montagem" value={78} />
                <OccupationBar sector="Acabamento" value={65} />
                <OccupationBar sector="Estoque" value={85} />
              </div>
            </div>
          </aside>
        </div>
      )}
      <SetorForm open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function HierarchyItem({ name, level, count }: { name: string; level: number; count: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5" style={{ marginLeft: `${level * 12}px` }}>
      <div className="flex items-center gap-2">
        <ChevronRight className="size-3 text-muted-foreground" />
        <span className="text-xs font-medium">{name}</span>
      </div>
      <Badge variant="outline" className="text-[10px]">{count} setores</Badge>
    </div>
  );
}

function AlertItem({ sector, issue, severity }: { sector: string; issue: string; severity: "high" | "medium" | "low" }) {
  const config = {
    high: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
    medium: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    low: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  };
  const c = config[severity];
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border p-2.5", c.border, c.bg)}>
      <div className={cn("grid size-5 shrink-0 place-items-center rounded-md", c.bg, c.color)}>
        <AlertTriangle className="size-3" />
      </div>
      <div className="flex-1">
        <div className="text-xs font-medium">{sector}</div>
        <div className="text-[10px] text-muted-foreground">{issue}</div>
      </div>
    </div>
  );
}

function OccupationBar({ sector, value }: { sector: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-[10px] text-muted-foreground">{sector}</div>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", value > 85 ? "bg-red-500" : value > 70 ? "bg-amber-500" : "bg-green-500")} style={{ width: `${value}%` }} />
      </div>
      <div className="w-10 text-right font-mono text-xs">{value}%</div>
    </div>
  );
}

function SetorForm({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: ModuleRecord | null }) {
  const { data, setField, canSave, submit, reset, setData } = useModuleForm<Draft>({
    moduleKey: "setores",
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

  // Reset form when opening/closing or changing edit mode
  useEffect(() => {
    if (open) {
      if (editing) {
        const meta = editing.meta || {};
        setData({
          name: editing.name,
          tipo: meta.tipo || "",
          unidade: meta.unidade || "",
          responsavel: meta.responsavel || "",
          capacidade: meta.capacidade || "",
          ocupacao: meta.ocupacao || "",
          equipamentos: meta.equipamentos || "",
          funcionarios: meta.funcionarios || "",
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
          <SheetTitle>{editing ? "Editar setor" : "Novo setor"}</SheetTitle>
          <SheetDescription>Defina a estrutura física e hierárquica da fábrica.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome do setor *</Label>
            <Input autoFocus value={data.name} onChange={(e) => setField("name", e.target.value)} placeholder="Ex.: Galpão A - Corte" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={data.tipo} onChange={(e) => setField("tipo", e.target.value)}>
                <option value="">Selecione...</option>
                <option>Produção</option>
                <option>Estoque</option>
                <option>Administrativo</option>
                <option>Manutenção</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Unidade</Label>
              <Input value={data.unidade} onChange={(e) => setField("unidade", e.target.value)} placeholder="Matriz / Filial" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Responsável</Label>
              <Input value={data.responsavel} onChange={(e) => setField("responsavel", e.target.value)} placeholder="Gerente do setor" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Capacidade</Label>
              <Input value={data.capacidade} onChange={(e) => setField("capacidade", e.target.value)} placeholder="Ex.: 500 m²" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Ocupação (%)</Label>
              <Input type="number" value={data.ocupacao} onChange={(e) => setField("ocupacao", e.target.value)} placeholder="0-100" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Funcionários</Label>
              <Input value={data.funcionarios} onChange={(e) => setField("funcionarios", e.target.value)} placeholder="Quantidade" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Equipamentos</Label>
            <Input value={data.equipamentos} onChange={(e) => setField("equipamentos", e.target.value)} placeholder="Lista de equipamentos principais" />
          </div>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!canSave} className="gap-1.5"><Check className="size-4" /> {editing ? "Salvar" : "Criar setor"}</Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
