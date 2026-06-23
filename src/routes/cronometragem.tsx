import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Timer, Trash2, Pencil, Clock, TrendingUp, AlertTriangle, BarChart3, Activity, Target, Zap, Check } from "lucide-react";
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
import { addRecord, removeRecord, updateRecord, useStore, type ModuleRecord } from "@/lib/store";
import { cn } from "@/lib/utils";

const mod = MODULES.find((m) => m.key === "cronometragem")!;

export const Route = createFileRoute("/cronometragem")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Draft = {
  name: string; operacao: string; processo: string; tempopadrao: string;
  tempomedio: string; eficiencia: string; observacoes: string; data: string;
};
const empty: Draft = { name:"", operacao:"", processo:"", tempopadrao:"", tempomedio:"", eficiencia:"", observacoes:"", data:"" };

function toMeta(d: Draft): Record<string,string> {
  const m: Record<string,string> = {};
  for (const [k,v] of Object.entries(d)) if (k !== "name" && v) m[k] = v;
  return m;
}
function fromRecord(r: ModuleRecord): Draft {
  return { ...empty, ...(r.meta as Partial<Draft>), name: r.name };
}

function Page() {
  const records = useStore((s) => s.records.cronometragem);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);

  const summary = records.reduce((acc, r) => {
    acc.total += 1;
    if (r.meta?.operacao === "Corte") acc.corte += 1;
    if (r.meta?.operacao === "Montagem") acc.montagem += 1;
    if (r.meta?.operacao === "Acabamento") acc.acabamento += 1;
    return acc;
  }, { total: 0, corte: 0, montagem: 0, acabamento: 0 });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ModuleHeader mod={mod} action={records.length > 0 && (
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      )} />

      <IndustrialAgent moduleKey="cronometragem" />
      {records.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {records.map((r) => {
              const eficiencia = Number(r.meta?.eficiencia) || 0;
              const isLowEfficiency = eficiencia < 70;
              return (
                <article key={r.id} className="surface-elevated group rounded-xl p-5 transition hover:ring-1 hover:ring-primary/30">
                  <header className="flex items-start gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <Timer className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-semibold">{r.name}</h3>
                          <p className="text-xs text-muted-foreground">{r.meta?.operacao ?? "—"} · {r.meta?.processo ?? "—"}</p>
                        </div>
                        <Badge variant={isLowEfficiency ? "destructive" : "secondary"} className="shrink-0 text-[10px]">
                          {isLowEfficiency ? "Baixa eficiência" : "Normal"}
                        </Badge>
                      </div>
                    </div>
                  </header>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Target className="size-3" /> Tempo Padrão
                      </div>
                      <div className="mt-1 text-sm font-semibold">{r.meta?.tempopadrao || "—"}</div>
                      <div className="text-[10px] text-muted-foreground">Data: {r.meta?.data || "—"}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Clock className="size-3" /> Tempo Médio
                      </div>
                      <div className="mt-1 text-sm font-semibold">{r.meta?.tempomedio || "—"}</div>
                      <div className="text-[10px] text-muted-foreground">Observações: {r.meta?.observacoes || "—"}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Zap className="size-3" /> Eficiência
                      </div>
                      <div className="mt-1 text-sm font-semibold">{eficiencia}%</div>
                      <div className="h-1.5 w-full rounded-full bg-muted mt-1">
                        <div className={cn("h-full rounded-full transition-all", isLowEfficiency ? "bg-red-500" : eficiencia >= 85 ? "bg-green-500" : "bg-amber-500")} style={{ width: `${eficiencia}%` }} />
                      </div>
                    </div>
                  </div>

                  <footer className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Activity className="size-3.5" />
                        <span>{r.meta?.processo || "Sem processo"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
                      <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setEditing(r); setOpen(true); }}>
                        <Pencil className="size-3.5" /> Gerenciar
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => { if (confirm(`Remover "${r.name}"?`)) removeRecord("cronometragem", r.id); }}>
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
                    <div className="text-muted-foreground">Corte</div>
                    <div className="font-mono text-lg font-semibold text-blue-500">{summary.corte}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Montagem</div>
                    <div className="font-mono text-lg font-semibold text-amber-500">{summary.montagem}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Acabamento</div>
                    <div className="font-mono text-lg font-semibold text-purple-500">{summary.acabamento}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <AlertTriangle className="size-3.5" /> Operações Críticas
              </div>
              <div className="mt-4 space-y-2">
                <CriticalOperation name="Corte Espuma D28" issue="Eficiência abaixo do padrão" severity="high" />
                <CriticalOperation name="Montagem Pocket" issue="Variação alta de tempo" severity="medium" />
                <CriticalOperation name="Acabamento Costura" issue="Tempo médio excedido" severity="low" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="size-3.5" /> Eficiência por Operação
              </div>
              <div className="mt-4 space-y-2">
                <EfficiencyBar operation="Corte" value={92} />
                <EfficiencyBar operation="Montagem" value={78} />
                <EfficiencyBar operation="Acabamento" value={85} />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Activity className="size-3.5" /> Tempo Médio por Operação
              </div>
              <div className="mt-4 space-y-2">
                <TimeBar operation="Corte" value={12} unit="min" />
                <TimeBar operation="Montagem" value={25} unit="min" />
                <TimeBar operation="Acabamento" value={18} unit="min" />
              </div>
            </div>
          </aside>
        </div>
      )}
      <CronometragemForm open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function CriticalOperation({ name, issue, severity }: { name: string; issue: string; severity: "high" | "medium" | "low" }) {
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

function EfficiencyBar({ operation, value }: { operation: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-[10px] text-muted-foreground">{operation}</div>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", value < 70 ? "bg-red-500" : value >= 85 ? "bg-green-500" : "bg-amber-500")} style={{ width: `${value}%` }} />
      </div>
      <div className="w-10 text-right font-mono text-xs">{value}%</div>
    </div>
  );
}

function TimeBar({ operation, value, unit }: { operation: string; value: number; unit: string }) {
  const maxValue = 30;
  const percent = (value / maxValue) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-[10px] text-muted-foreground">{operation}</div>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="w-10 text-right font-mono text-xs">{value}{unit}</div>
    </div>
  );
}

function CronometragemForm({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: ModuleRecord | null }) {
  const [d, setD] = useState<Draft>(empty);
  useEffect(() => { setD(editing ? fromRecord(editing) : empty); }, [open, editing]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((s) => ({ ...s, [k]: v }));
  const canSave = d.name.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    const meta = toMeta(d);
    if (editing) updateRecord("cronometragem", editing.id, { name: d.name.trim(), meta });
    else addRecord("cronometragem", d.name.trim(), meta);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle>{editing ? "Editar cronometragem" : "Nova cronometragem"}</SheetTitle>
          <SheetDescription>Registre estudos de tempos e tempos padrões por operação.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome do estudo *</Label>
            <Input autoFocus value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex.: Corte Espuma D28" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Operação</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={d.operacao} onChange={(e) => set("operacao", e.target.value)}>
                <option value="">Selecione...</option>
                <option>Corte</option>
                <option>Montagem</option>
                <option>Acabamento</option>
                <option>Embalagem</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Processo</Label>
              <Input value={d.processo} onChange={(e) => set("processo", e.target.value)} placeholder="Ex.: Fabricação Pocket" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Tempo padrão (min)</Label>
              <Input type="number" step="0.1" value={d.tempopadrao} onChange={(e) => set("tempopadrao", e.target.value)} placeholder="Ex.: 10.5" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tempo médio (min)</Label>
              <Input type="number" step="0.1" value={d.tempomedio} onChange={(e) => set("tempomedio", e.target.value)} placeholder="Ex.: 11.2" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Eficiência (%)</Label>
              <Input type="number" value={d.eficiencia} onChange={(e) => set("eficiencia", e.target.value)} placeholder="Ex.: 85" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data do estudo</Label>
              <Input type="date" value={d.data} onChange={(e) => set("data", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Observações</Label>
            <Input value={d.observacoes} onChange={(e) => set("observacoes", e.target.value)} placeholder="Ex.: Condições normais de operação" />
          </div>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={!canSave} className="gap-1.5"><Check className="size-4" /> {editing ? "Salvar" : "Criar cronometragem"}</Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
