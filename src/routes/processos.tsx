import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Workflow, Trash2, GripVertical, ChevronDown, ChevronUp, Check, X, ArrowRight, Pencil, AlertTriangle, GitBranch, Clock, BarChart3, Activity, Zap, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ModuleHeader } from "@/components/module-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { IndustrialAgent } from "@/components/industrial-copilot";
import { MODULES } from "@/lib/modules";
import { removeRecord, useStore, type ModuleRecord } from "@/lib/store";
import { cn } from "@/lib/utils";

const mod = MODULES.find((m) => m.key === "processos")!;

export const Route = createFileRoute("/processos")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Step = {
  id: string; nome: string; descricao: string;
  equipamentos: string; funcionarios: string;
  entradas: string; saidas: string; tempo: string;
  isBottleneck: boolean; branchType: "linear" | "parallel" | "conditional";
};
const emptyStep = (): Step => ({ id: crypto.randomUUID(), nome: "", descricao: "", equipamentos: "", funcionarios: "", entradas: "", saidas: "", tempo: "", isBottleneck: false, branchType: "linear" });

function Page() {
  const records = useStore((s) => s.records.processos);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ModuleHeader mod={mod} action={records.length > 0 && (
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      )} />

      <IndustrialAgent moduleKey="processos" />
      {records.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {records.map((r) => {
              const steps: Step[] = (() => { try { return JSON.parse(r.meta?.steps_json ?? "[]"); } catch { return []; } })();
              const total = steps.reduce((acc, s) => acc + (Number(s.tempo) || 0), 0);
              const bottlenecks = steps.filter(s => s.isBottleneck).length;
              return (
                <article key={r.id} className="surface-elevated rounded-xl p-5">
                  <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold">{r.name}</h3>
                      <p className="truncate text-xs text-muted-foreground">{steps.length} etapas · {total > 0 ? `${total} min total` : "tempo não informado"}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setOpen(true); }} className="gap-1.5"><Pencil className="size-3.5" />Editar</Button>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => { if (confirm(`Remover "${r.name}"?`)) removeRecord("processos", r.id); }}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </header>
                  {bottlenecks > 0 && (
                    <div className="mt-3 rounded-lg border-l-4 border-l-amber-500 bg-amber-500/10 p-3">
                      <div className="flex items-center gap-2 text-xs">
                        <AlertTriangle className="size-4 text-amber-500" />
                        <span className="font-semibold text-amber-500">{bottlenecks} gargalo(s) identificado(s)</span>
                      </div>
                    </div>
                  )}
                  {steps.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
                      {steps.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2">
                          <div className={cn("min-w-[180px] rounded-lg border p-3", s.isBottleneck ? "border-amber-500 bg-amber-500/10" : "border-border bg-muted/30")}>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <span className={cn("grid size-4 place-items-center rounded-full font-mono", s.isBottleneck ? "bg-amber-500 text-white" : "bg-primary/15 text-primary")}>{i + 1}</span>
                              {s.tempo && <span className="font-mono">{s.tempo} min</span>}
                              {s.isBottleneck && <AlertTriangle className="size-3 text-amber-500" />}
                              {s.branchType !== "linear" && <GitBranch className="size-3 text-blue-500" />}
                            </div>
                            <div className="mt-1 truncate text-sm font-medium">{s.nome || "Sem nome"}</div>
                            <div className="truncate text-[10px] text-muted-foreground">{s.equipamentos || "—"}</div>
                          </div>
                          {i < steps.length - 1 && <ArrowRight className="size-4 shrink-0 text-muted-foreground" />}
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <aside className="space-y-4">
            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Activity className="size-3.5" /> Análise de Gargalos
              </div>
              <div className="mt-4 space-y-2">
                <BottleneckItem step="Corte de Espuma" impact={35} reason="Capacidade limitada" />
                <BottleneckItem step="Montagem Núcleo" impact={25} reason="Falta de operadores" />
                <BottleneckItem step="Acabamento" impact={15} reason="Setup demorado" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <GitBranch className="size-3.5" /> Ramificações
              </div>
              <div className="mt-4 space-y-2">
                <BranchItem type="parallel" description="Corte simultâneo em 2 linhas" />
                <BranchItem type="conditional" description="Inspeção de qualidade" />
                <BranchItem type="linear" description="Fluxo sequencial padrão" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Clock className="size-3.5" /> Timeline do Processo
              </div>
              <div className="mt-4 space-y-2">
                <ProcessTimeline step="Preparação" time={5} />
                <ProcessTimeline step="Corte" time={15} />
                <ProcessTimeline step="Montagem" time={25} />
                <ProcessTimeline step="Acabamento" time={20} />
                <ProcessTimeline step="Embalagem" time={10} />
              </div>
              <div className="mt-3 rounded-lg border border-primary/40 bg-primary/10 p-3">
                <div className="text-xs uppercase tracking-wider text-primary">Tempo total de ciclo</div>
                <div className="mt-1 font-mono text-2xl font-semibold text-primary">75 min</div>
                <div className="text-[10px] text-muted-foreground">Tempo padrão por unidade</div>
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="size-3.5" /> Oportunidades de Otimização
              </div>
              <div className="mt-4 space-y-2">
                <OptimizationItem area="Balanceamento de linha" potential={"+20%"} effort="Média" />
                <OptimizationItem area="Automação corte" potential={"+35%"} effort="Alta" />
                <OptimizationItem area="Redução setup" potential={"+15%"} effort="Baixa" />
              </div>
            </div>
          </aside>
        </div>
      )}
      <ProcessoEditor open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function ProcessoEditor({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: ModuleRecord | null }) {
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      try { setSteps(JSON.parse(editing.meta?.steps_json ?? "[]")); } catch { setSteps([]); }
    } else { setName(""); setSteps([]); }
    setExpanded(null);
  }, [open, editing]);

  const add = () => { const s = emptyStep(); setSteps((arr) => [...arr, s]); setExpanded(s.id); };
  const upd = (id: string, p: Partial<Step>) => setSteps((arr) => arr.map(s => s.id === id ? { ...s, ...p } : s));
  const rm = (id: string) => setSteps((arr) => arr.filter(s => s.id !== id));
  const move = (id: string, dir: -1 | 1) => setSteps((arr) => {
    const i = arr.findIndex(s => s.id === id); if (i < 0) return arr;
    const j = i + dir; if (j < 0 || j >= arr.length) return arr;
    const next = [...arr]; [next[i], next[j]] = [next[j], next[i]]; return next;
  });
  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    setSteps((arr) => {
      const from = arr.findIndex(s => s.id === dragId);
      const to = arr.findIndex(s => s.id === targetId);
      if (from < 0 || to < 0) return arr;
      const next = [...arr]; const [moved] = next.splice(from, 1); next.splice(to, 0, moved); return next;
    });
    setDragId(null);
  };

  const canSave = name.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    const meta = { steps_json: JSON.stringify(steps), etapas: String(steps.length) };
    if (editing) {
      import("@/lib/store").then(({ updateRecord }) => {
        updateRecord("processos", editing.id, { name: name.trim(), meta });
      });
    } else {
      import("@/lib/store").then(({ addRecord }) => {
        addRecord("processos", name.trim(), meta);
      });
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle>{editing ? "Editar processo" : "Novo processo"}</SheetTitle>
          <SheetDescription>Construa o roteiro etapa por etapa. Arraste para reordenar.</SheetDescription>
        </SheetHeader>
        <div className="border-b border-border p-6">
          <Label className="text-xs">Nome do processo *</Label>
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Montagem de Colchão Pocket Casal" className="mt-1.5" />
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {steps.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              <Workflow className="mx-auto mb-2 size-6 opacity-50" />
              Nenhuma etapa ainda. Comece adicionando a primeira operação.
            </div>
          )}
          {steps.map((s, i) => (
            <div key={s.id}
              draggable
              onDragStart={() => setDragId(s.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(s.id)}
              className={cn("surface-elevated rounded-lg border border-border transition", dragId === s.id && "opacity-50")}>
              <header className="flex items-center gap-2 p-3">
                <GripVertical className="size-4 cursor-grab text-muted-foreground" />
                <Badge variant="secondary" className="shrink-0 font-mono">{i + 1}</Badge>
                <Input value={s.nome} onChange={(e) => upd(s.id, { nome: e.target.value })} placeholder="Nome da etapa (ex.: Costura do tampo)" className="flex-1" />
                {s.tempo && <Badge variant="outline" className="font-mono text-[10px]">{s.tempo} min</Badge>}
                <Button variant="ghost" size="icon" onClick={() => move(s.id, -1)} disabled={i === 0}><ChevronUp className="size-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => move(s.id, 1)} disabled={i === steps.length - 1}><ChevronDown className="size-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                  {expanded === s.id ? <X className="size-4" /> : <Pencil className="size-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => rm(s.id)}><Trash2 className="size-4" /></Button>
              </header>
              {expanded === s.id && (
                <div className="grid gap-3 border-t border-border bg-muted/20 p-4 sm:grid-cols-2">
                  <F label="Descrição" full><Textarea rows={2} value={s.descricao} onChange={(e) => upd(s.id, { descricao: e.target.value })} /></F>
                  <F label="Equipamentos"><Input value={s.equipamentos} onChange={(e) => upd(s.id, { equipamentos: e.target.value })} placeholder="Máquinas envolvidas" /></F>
                  <F label="Funcionários"><Input value={s.funcionarios} onChange={(e) => upd(s.id, { funcionarios: e.target.value })} placeholder="Operadores / função" /></F>
                  <F label="Entradas"><Input value={s.entradas} onChange={(e) => upd(s.id, { entradas: e.target.value })} placeholder="Insumos consumidos" /></F>
                  <F label="Saídas"><Input value={s.saidas} onChange={(e) => upd(s.id, { saidas: e.target.value })} placeholder="O que é produzido" /></F>
                  <F label="Tempo médio (min)" full><Input type="number" value={s.tempo} onChange={(e) => upd(s.id, { tempo: e.target.value })} /></F>
                </div>
              )}
            </div>
          ))}
          <Button variant="outline" onClick={add} className="w-full gap-1.5"><Plus className="size-4" /> Adicionar etapa</Button>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={!canSave} className="gap-1.5"><Check className="size-4" /> {editing ? "Salvar" : "Criar processo"}</Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}

function F({ label, full, children }: { label: React.ReactNode; full?: boolean; children: React.ReactNode }) {
  return <div className={cn("space-y-1.5", full && "sm:col-span-2")}><Label className="text-xs">{label}</Label>{children}</div>;
}

function BottleneckItem({ step, impact, reason }: { step: string; impact: number; reason: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5">
      <div className="flex items-center gap-2">
        <div className="grid size-6 place-items-center rounded-md bg-amber-500/20 text-amber-500">
          <AlertTriangle className="size-3" />
        </div>
        <div>
          <div className="text-xs font-medium">{step}</div>
          <div className="text-[10px] text-muted-foreground">{reason}</div>
        </div>
      </div>
      <div className="font-mono text-xs font-semibold text-amber-500">-{impact}%</div>
    </div>
  );
}

function BranchItem({ type, description }: { type: "parallel" | "conditional" | "linear"; description: string }) {
  const config = {
    parallel: { label: "Paralelo", color: "text-blue-500", bg: "bg-blue-500/10" },
    conditional: { label: "Condicional", color: "text-purple-500", bg: "bg-purple-500/10" },
    linear: { label: "Linear", color: "text-green-500", bg: "bg-green-500/10" },
  };
  const c = config[type];
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
      <div className="flex items-center gap-2">
        <div className={cn("grid size-6 place-items-center rounded-md", c.bg, c.color)}>
          <GitBranch className="size-3" />
        </div>
        <div>
          <div className="text-xs font-medium">{c.label}</div>
          <div className="text-[10px] text-muted-foreground">{description}</div>
        </div>
      </div>
    </div>
  );
}

function ProcessTimeline({ step, time }: { step: string; time: number }) {
  const maxTime = 30;
  const percent = (time / maxTime) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-[10px] text-muted-foreground">{step}</div>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="w-12 text-right font-mono text-xs">{time} min</div>
    </div>
  );
}

function OptimizationItem({ area, potential, effort }: { area: string; potential: string; effort: string }) {
  const effortColor = effort === "Alta" ? "text-red-500" : effort === "Média" ? "text-amber-500" : "text-green-500";
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
      <div className="flex items-center gap-2">
        <div className="grid size-6 place-items-center rounded-md bg-green-500/10 text-green-500">
          <Zap className="size-3" />
        </div>
        <div>
          <div className="text-xs font-medium">{area}</div>
          <div className="text-[10px] text-muted-foreground">Esforço: <span className={effortColor}>{effort}</span></div>
        </div>
      </div>
      <div className="font-mono text-xs font-semibold text-green-500">{potential}</div>
    </div>
  );
}
