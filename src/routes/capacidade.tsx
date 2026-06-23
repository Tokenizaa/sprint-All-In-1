import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Gauge, Pencil, Trash2, Check, Clock, Zap, BarChart3, TrendingUp, AlertTriangle, Factory, Calendar, ArrowUp, ArrowDown, Layers, Play, RefreshCw, Target, Activity } from "lucide-react";
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

const mod = MODULES.find((m) => m.key === "capacidade")!;

export const Route = createFileRoute("/capacidade")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Draft = { name: string; maquina: string; capacidade: string; unidade: string; turnos: string; eficiencia: string };
const empty: Draft = { name: "", maquina: "", capacidade: "", unidade: "un/h", turnos: "1", eficiencia: "85" };

function fromRecord(r: ModuleRecord): Draft { return { ...empty, ...(r.meta as Partial<Draft>), name: r.name }; }
function toMeta(d: Draft): Record<string,string> {
  const m: Record<string,string> = {};
  for (const [k,v] of Object.entries(d)) if (k !== "name" && v) m[k] = v;
  return m;
}

function Page() {
  const records = useStore((s) => s.records.capacidade);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);

  const summary = records.reduce((acc, r) => {
    const cap = Number(r.meta?.capacidade) || 0;
    const turnos = Number(r.meta?.turnos) || 1;
    const ef = (Number(r.meta?.eficiencia) || 100) / 100;
    const efetiva = cap * 8 * turnos * ef;
    acc.total += efetiva;
    acc.recursos += 1;
    acc.turnos += turnos;
    return acc;
  }, { total: 0, recursos: 0, turnos: 0 });

  const avgTurnos = summary.recursos > 0 ? (summary.turnos / summary.recursos).toFixed(1) : "0";
  const avgEficiencia = records.length > 0 
    ? (records.reduce((a, r) => a + (Number(r.meta?.eficiencia) || 0), 0) / records.length).toFixed(0) 
    : "0";

  const sortedByEfetiva = [...records].sort((a, b) => {
    const capA = Number(a.meta?.capacidade) || 0;
    const turnosA = Number(a.meta?.turnos) || 1;
    const efA = (Number(a.meta?.eficiencia) || 100) / 100;
    const efetivaA = capA * 8 * turnosA * efA;
    
    const capB = Number(b.meta?.capacidade) || 0;
    const turnosB = Number(b.meta?.turnos) || 1;
    const efB = (Number(b.meta?.eficiencia) || 100) / 100;
    const efetivaB = capB * 8 * turnosB * efB;
    
    return efetivaB - efetivaA;
  });

  const bottleneck = sortedByEfetiva.length > 0 ? sortedByEfetiva[sortedByEfetiva.length - 1] : null;

  // Simulate demand data (in a real app, this would come from orders/production planning)
  const [simulatedDemand, setSimulatedDemand] = useState(1200);
  const capacityUtilization = summary.total > 0 ? ((simulatedDemand / summary.total) * 100).toFixed(1) : "0";
  const isOverCapacity = Number(capacityUtilization) > 100;

  // Sector capacity breakdown (simulated based on resources)
  const sectorData = [
    { name: "Corte", capacity: Math.round(summary.total * 0.3), resources: Math.round(summary.recursos * 0.3) },
    { name: "Montagem", capacity: Math.round(summary.total * 0.4), resources: Math.round(summary.recursos * 0.4) },
    { name: "Acabamento", capacity: Math.round(summary.total * 0.2), resources: Math.round(summary.recursos * 0.2) },
    { name: "Embalagem", capacity: Math.round(summary.total * 0.1), resources: Math.round(summary.recursos * 0.1) },
  ];

  const [scenarioMode, setScenarioMode] = useState(false);
  const [scenarioTurnos, setScenarioTurnos] = useState(avgTurnos);
  const [scenarioEficiencia, setScenarioEficiencia] = useState(avgEficiencia);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ModuleHeader mod={mod} action={records.length > 0 && (
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      )} />

      <IndustrialAgent moduleKey="capacidade" />
      {records.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <KpiCard icon={BarChart3} label="Capacidade Total" value={Math.round(summary.total).toLocaleString("pt-BR")} unit="un/dia" trend="up" />
              <KpiCard icon={Factory} label="Recursos" value={summary.recursos.toString()} unit="ativos" trend="stable" />
              <KpiCard icon={Clock} label="Turnos Médios" value={avgTurnos} unit="por recurso" trend="stable" />
              <KpiCard icon={Target} label="Demanda" value={simulatedDemand.toLocaleString("pt-BR")} unit="un/dia" trend={isOverCapacity ? "down" : "up"} />
            </div>

            <div className={cn("surface-elevated rounded-xl p-5 border-l-4", isOverCapacity ? "border-l-red-500" : "border-l-green-500")}>
              <div className="flex items-start gap-3">
                <div className={cn("grid size-8 shrink-0 place-items-center rounded-lg", isOverCapacity ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500")}>
                  {isOverCapacity ? <AlertTriangle className="size-4" /> : <Activity className="size-4" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">Capacidade vs Demanda</div>
                  <p className="text-xs text-muted-foreground">
                    Utilização atual: <span className={cn("font-semibold", isOverCapacity ? "text-red-500" : "text-green-500")}>{capacityUtilization}%</span>
                    {isOverCapacity ? " - Excede capacidade disponível" : " - Dentro da capacidade"}
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", isOverCapacity ? "bg-red-500" : "bg-green-500")} style={{ width: `${Math.min(Number(capacityUtilization), 100)}%` }} />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(summary.total - simulatedDemand) > 0 
                        ? `+${Math.round(summary.total - simulatedDemand).toLocaleString("pt-BR")} disponíveis`
                        : `${Math.round(simulatedDemand - summary.total).toLocaleString("pt-BR")} pendentes`
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Capacidade por Setor</h3>
                  <p className="text-xs text-muted-foreground">Distribuição da capacidade produtiva</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{sectorData.length} setores</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {sectorData.map((sector, i) => {
                  const maxCapacity = Math.max(...sectorData.map(s => s.capacity));
                  const percent = maxCapacity > 0 ? (sector.capacity / maxCapacity) * 100 : 0;
                  return (
                    <div key={i} className="group rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Layers className="size-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{sector.name}</div>
                            <div className="text-[10px] text-muted-foreground">{sector.resources} recurso(s)</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm font-semibold">{sector.capacity.toLocaleString("pt-BR")}</div>
                          <div className="text-[10px] text-muted-foreground">un/dia</div>
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Capacidade por Recurso</h3>
                  <p className="text-xs text-muted-foreground">Ordenado por capacidade efetiva</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{records.length} recursos</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {sortedByEfetiva.map((r, i) => {
                  const cap = Number(r.meta?.capacidade) || 0;
                  const turnos = Number(r.meta?.turnos) || 1;
                  const ef = Number(r.meta?.eficiencia) || 100;
                  const efetiva = Math.round(cap * 8 * turnos * (ef / 100));
                  const maxEfetiva = sortedByEfetiva.length > 0 ? (() => {
                    const max = sortedByEfetiva[0];
                    const maxCap = Number(max.meta?.capacidade) || 0;
                    const maxTurnos = Number(max.meta?.turnos) || 1;
                    const maxEf = (Number(max.meta?.eficiencia) || 100) / 100;
                    return maxCap * 8 * maxTurnos * maxEf;
                  })() : 1;
                  const percent = maxEfetiva > 0 ? (efetiva / maxEfetiva) * 100 : 0;
                  
                  return (
                    <div key={r.id} className="group rounded-lg border border-border bg-muted/20 p-3 transition hover:border-primary/30">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                            <span className="font-mono text-xs font-semibold">#{i + 1}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium">{r.name}</div>
                            <div className="text-[10px] text-muted-foreground">{r.meta?.maquina || "Sem máquina"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-mono text-sm font-semibold">{efetiva.toLocaleString("pt-BR")}</div>
                            <div className="text-[10px] text-muted-foreground">{r.meta?.unidade || "un"}/dia</div>
                          </div>
                          <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                            <Button variant="ghost" size="icon" className="size-7" onClick={() => { setEditing(r); setOpen(true); }}>
                              <Pencil className="size-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => { if (confirm(`Remover "${r.name}"?`)) removeRecord("capacidade", r.id); }}>
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {bottleneck && (
              <div className="surface-elevated rounded-xl border-l-4 border-l-amber-500 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
                    <AlertTriangle className="size-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">Gargalo Identificado</div>
                    <p className="text-xs text-muted-foreground">
                      {bottleneck.name} é o recurso com menor capacidade efetiva. Considere aumentar turnos, eficiência ou adicionar capacidade adicional.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="size-3.5" /> Análise
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Eficiência média</span>
                    <span className="font-semibold">{avgEficiencia}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${avgEficiencia}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Máx. eficiência</div>
                    <div className="font-mono text-sm font-semibold">
                      {Math.max(...records.map(r => Number(r.meta?.eficiencia) || 0))}%
                    </div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Mín. eficiência</div>
                    <div className="font-mono text-sm font-semibold">
                      {Math.min(...records.map(r => Number(r.meta?.eficiencia) || 0))}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Play className="size-3.5" /> Simulador de Cenários
              </div>
              <div className="mt-4 space-y-3">
                {!scenarioMode ? (
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => setScenarioMode(true)}>
                      <BarChart3 className="size-4" /> Simular aumento de turnos
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <TrendingUp className="size-4" /> Projetar demanda futura
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Factory className="size-4" /> Comparar por setor
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Turnos médios (atual: {avgTurnos})</Label>
                      <Input type="number" value={scenarioTurnos} onChange={(e) => setScenarioTurnos(e.target.value)} placeholder={avgTurnos} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Eficiência média (atual: {avgEficiencia}%)</Label>
                      <Input type="number" value={scenarioEficiencia} onChange={(e) => setScenarioEficiencia(e.target.value)} placeholder={avgEficiencia} />
                    </div>
                    <div className="rounded-lg border border-primary/40 bg-primary/10 p-3">
                      <div className="text-xs uppercase tracking-wider text-primary">Nova capacidade projetada</div>
                      <div className="mt-1 font-mono text-2xl font-semibold text-primary">
                        {Math.round(summary.total * (Number(scenarioTurnos) / Number(avgTurnos)) * (Number(scenarioEficiencia) / Number(avgEficiencia))).toLocaleString("pt-BR")}
                      </div>
                      <div className="text-xs text-muted-foreground">un/dia · {scenarioTurnos} turnos · {scenarioEficiencia}% eficiência</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setScenarioMode(false)}>
                        Cancelar
                      </Button>
                      <Button size="sm" className="flex-1 gap-1.5">
                        <Play className="size-3" /> Aplicar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <RefreshCw className="size-3.5" /> Tendência (7 dias)
              </div>
              <div className="mt-4 space-y-2">
                <TrendBar day="Seg" value={85} />
                <TrendBar day="Ter" value={92} />
                <TrendBar day="Qua" value={78} />
                <TrendBar day="Qui" value={95} />
                <TrendBar day="Sex" value={88} />
                <TrendBar day="Sáb" value={45} />
                <TrendBar day="Dom" value={20} />
              </div>
            </div>
          </aside>
        </div>
      )}
      <CapForm open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, unit, trend }: { icon: typeof BarChart3; label: string; value: string; unit: string; trend: "up" | "down" | "stable" }) {
  return (
    <div className="surface-elevated rounded-xl p-5">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" /> {label}
      </div>
      <div className="mt-2">
        <div className="font-mono text-2xl font-semibold">{value}</div>
        <div className="text-xs text-muted-foreground">{unit}</div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px]">
        {trend === "up" && <ArrowUp className="size-3 text-green-500" />}
        {trend === "down" && <ArrowDown className="size-3 text-red-500" />}
        {trend === "stable" && <div className="size-3 rounded-full bg-muted-foreground" />}
        <span className={cn("text-muted-foreground", trend === "up" && "text-green-500", trend === "down" && "text-red-500")}>
          {trend === "up" && "Em crescimento"}
          {trend === "down" && "Em queda"}
          {trend === "stable" && "Estável"}
        </span>
      </div>
    </div>
  );
}

function TrendBar({ day, value }: { day: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 text-[10px] text-muted-foreground">{day}</div>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} />
      </div>
      <div className="w-10 text-right font-mono text-xs">{value}%</div>
    </div>
  );
}

function CapForm({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: ModuleRecord | null }) {
  const [d, setD] = useState<Draft>(empty);
  useEffect(() => { setD(editing ? fromRecord(editing) : empty); }, [open, editing]);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((s) => ({ ...s, [k]: v }));
  const canSave = d.name.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    if (editing) updateRecord("capacidade", editing.id, { name: d.name.trim(), meta: toMeta(d) });
    else addRecord("capacidade", d.name.trim(), toMeta(d));
    onOpenChange(false);
  };

  const cap = Number(d.capacidade) || 0;
  const turnos = Number(d.turnos) || 1;
  const ef = Number(d.eficiencia) || 100;
  const efetiva = Math.round(cap * 8 * turnos * (ef / 100));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle>{editing ? "Editar capacidade" : "Nova capacidade"}</SheetTitle>
          <SheetDescription>Defina capacidade nominal por recurso. Veja o impacto em tempo real.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome do cenário *</Label>
            <Input autoFocus value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex.: Linha 02 - Turno A" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Máquina / Recurso</Label>
            <Input value={d.maquina} onChange={(e) => set("maquina", e.target.value)} placeholder="Selecione ou descreva" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs">Capacidade nominal</Label>
              <Input type="number" value={d.capacidade} onChange={(e) => set("capacidade", e.target.value)} placeholder="120" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Unidade</Label>
              <Input value={d.unidade} onChange={(e) => set("unidade", e.target.value)} placeholder="un/h" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Turnos</Label>
              <Input type="number" value={d.turnos} onChange={(e) => set("turnos", e.target.value)} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Eficiência (%)</Label>
              <Input type="number" value={d.eficiencia} onChange={(e) => set("eficiencia", e.target.value)} /></div>
          </div>
          <div className="rounded-lg border border-primary/40 bg-primary/10 p-4">
            <div className="text-xs uppercase tracking-wider text-primary">Produção efetiva projetada</div>
            <div className="mt-1 font-mono text-3xl font-semibold text-primary">{efetiva.toLocaleString("pt-BR")}</div>
            <div className="text-xs text-muted-foreground">{d.unidade || "un"} por dia · {turnos} turno(s) × 8h × {ef}%</div>
          </div>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={!canSave} className="gap-1.5"><Check className="size-4" /> {editing ? "Salvar" : "Cadastrar"}</Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
