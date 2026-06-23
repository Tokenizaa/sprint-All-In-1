import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Layers, Trash2, Pencil, DollarSign, Package, TrendingUp, AlertTriangle, BarChart3, Activity, Box, GitBranch, Check } from "lucide-react";
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

const mod = MODULES.find((m) => m.key === "componentes")!;

export const Route = createFileRoute("/componentes")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Draft = {
  name: string; tipo: string; categoria: string; custo: string;
  fornecedor: string; estoque: string; leadtime: string; bom: string;
};
const empty: Draft = { name:"", tipo:"", categoria:"", custo:"", fornecedor:"", estoque:"", leadtime:"", bom:"" };

function Page() {
  const records = useStore((s) => s.records.componentes);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);

  const summary = records.reduce((acc, r) => {
    acc.total += 1;
    if (r.meta?.tipo === "Semi-acabado") acc.semiAcabado += 1;
    if (r.meta?.tipo === "Capa") acc.capa += 1;
    if (r.meta?.tipo === "Núcleo") acc.nucleo += 1;
    return acc;
  }, { total: 0, semiAcabado: 0, capa: 0, nucleo: 0 });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ModuleHeader mod={mod} action={records.length > 0 && (
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      )} />

      <IndustrialAgent moduleKey="componentes" />
      {records.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {records.map((r) => {
              const custo = Number(r.meta?.custo) || 0;
              const estoque = Number(r.meta?.estoque) || 0;
              const isLowStock = estoque < 10;
              return (
                <article key={r.id} className="surface-elevated group rounded-xl p-5 transition hover:ring-1 hover:ring-primary/30">
                  <header className="flex items-start gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <Layers className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-semibold">{r.name}</h3>
                          <p className="text-xs text-muted-foreground">{r.meta?.tipo ?? "—"} · {r.meta?.categoria ?? "—"}</p>
                        </div>
                        <Badge variant={isLowStock ? "destructive" : "secondary"} className="shrink-0 text-[10px]">
                          {isLowStock ? "Estoque baixo" : "Normal"}
                        </Badge>
                      </div>
                    </div>
                  </header>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <DollarSign className="size-3" /> Custo
                      </div>
                      <div className="mt-1 text-sm font-semibold">R$ {custo.toFixed(2)}</div>
                      <div className="text-[10px] text-muted-foreground">Fornecedor: {r.meta?.fornecedor || "—"}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Package className="size-3" /> Estoque
                      </div>
                      <div className="mt-1 text-sm font-semibold">{estoque} un</div>
                      <div className="text-[10px] text-muted-foreground">Lead time: {r.meta?.leadtime || "—"} dias</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <GitBranch className="size-3" /> BOM
                      </div>
                      <div className="mt-1 text-sm font-semibold">{r.meta?.bom || "—"}</div>
                      <div className="text-[10px] text-muted-foreground">Produtos vinculados</div>
                    </div>
                  </div>

                  <footer className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Box className="size-3.5" />
                        <span>{r.meta?.categoria || "Sem categoria"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
                      <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setEditing(r); setOpen(true); }}>
                        <Pencil className="size-3.5" /> Gerenciar
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => { if (confirm(`Remover "${r.name}"?`)) removeRecord("componentes", r.id); }}>
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
                    <div className="text-muted-foreground">Semi-acabado</div>
                    <div className="font-mono text-lg font-semibold text-blue-500">{summary.semiAcabado}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Capas</div>
                    <div className="font-mono text-lg font-semibold text-amber-500">{summary.capa}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Núcleos</div>
                    <div className="font-mono text-lg font-semibold text-purple-500">{summary.nucleo}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <AlertTriangle className="size-3.5" /> Componentes Críticos
              </div>
              <div className="mt-4 space-y-2">
                <CriticalComponent name="Capa Pocket Casal" issue="Estoque abaixo do mínimo" severity="high" />
                <CriticalComponent name="Núcleo D28" issue="Lead time elevado" severity="medium" />
                <CriticalComponent name="Tecido Forro" issue="Custo acima do esperado" severity="low" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="size-3.5" /> Custo por Categoria
              </div>
              <div className="mt-4 space-y-2">
                <CostBar category="Capas" value={45} />
                <CostBar category="Núcleos" value={35} />
                <CostBar category="Acessórios" value={20} />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Activity className="size-3.5" /> Estoque por Tipo
              </div>
              <div className="mt-4 space-y-2">
                <StockBar type="Semi-acabado" value={85} />
                <StockBar type="Capa" value={60} />
                <StockBar type="Núcleo" value={40} />
              </div>
            </div>
          </aside>
        </div>
      )}
      <ComponenteForm open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function CriticalComponent({ name, issue, severity }: { name: string; issue: string; severity: "high" | "medium" | "low" }) {
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
        <div className="text-xs font-medium">{name}</div>
        <div className="text-[10px] text-muted-foreground">{issue}</div>
      </div>
    </div>
  );
}

function CostBar({ category, value }: { category: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-[10px] text-muted-foreground">{category}</div>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} />
      </div>
      <div className="w-10 text-right font-mono text-xs">{value}%</div>
    </div>
  );
}

function StockBar({ type, value }: { type: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-[10px] text-muted-foreground">{type}</div>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", value < 50 ? "bg-red-500" : value < 70 ? "bg-amber-500" : "bg-green-500")} style={{ width: `${value}%` }} />
      </div>
      <div className="w-10 text-right font-mono text-xs">{value}%</div>
    </div>
  );
}

function ComponenteForm({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: ModuleRecord | null }) {
  const { data, setField, canSave, submit, reset, setData } = useModuleForm<Draft>({
    moduleKey: "componentes",
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
          categoria: meta.categoria || "",
          custo: meta.custo || "",
          fornecedor: meta.fornecedor || "",
          estoque: meta.estoque || "",
          leadtime: meta.leadtime || "",
          bom: meta.bom || "",
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
          <SheetTitle>{editing ? "Editar componente" : "Novo componente"}</SheetTitle>
          <SheetDescription>Cadastre componentes semi-acabados, capas e núcleos.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome do componente *</Label>
            <Input autoFocus value={data.name} onChange={(e) => setField("name", e.target.value)} placeholder="Ex.: Capa Colchão Pocket" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={data.tipo} onChange={(e) => setField("tipo", e.target.value)}>
                <option value="">Selecione...</option>
                <option>Semi-acabado</option>
                <option>Capa</option>
                <option>Núcleo</option>
                <option>Acessório</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Categoria</Label>
              <Input value={data.categoria} onChange={(e) => setField("categoria", e.target.value)} placeholder="Ex.: Premium" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Custo unitário (R$)</Label>
              <Input type="number" step="0.01" value={data.custo} onChange={(e) => setField("custo", e.target.value)} placeholder="Ex.: 150.00" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Estoque atual</Label>
              <Input type="number" value={data.estoque} onChange={(e) => setField("estoque", e.target.value)} placeholder="Ex.: 50" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Fornecedor</Label>
              <Input value={data.fornecedor} onChange={(e) => setField("fornecedor", e.target.value)} placeholder="Ex.: Tecidos Brasil" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Lead time (dias)</Label>
              <Input type="number" value={data.leadtime} onChange={(e) => setField("leadtime", e.target.value)} placeholder="Ex.: 7" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">BOMs vinculadas</Label>
            <Input value={data.bom} onChange={(e) => setField("bom", e.target.value)} placeholder="Ex.: BOM Pocket Casal, BOM King" />
          </div>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!canSave} className="gap-1.5"><Check className="size-4" /> {editing ? "Salvar" : "Criar componente"}</Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
