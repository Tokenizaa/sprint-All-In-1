import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Users, Trash2, Pencil, Calendar, Clock, Award, TrendingUp, AlertTriangle, CheckCircle, XCircle, Briefcase, GraduationCap, Activity, Check } from "lucide-react";
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

const mod = MODULES.find((m) => m.key === "funcionarios")!;

export const Route = createFileRoute("/funcionarios")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Draft = {
  name: string; cargo: string; setor: string; turno: string;
  admissao: string; habilidades: string; certificacoes: string; desempenho: string;
};
const empty: Draft = { name:"", cargo:"", setor:"", turno:"", admissao:"", habilidades:"", certificacoes:"", desempenho:"" };

function Page() {
  const records = useStore((s) => s.records.funcionarios);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);

  const summary = records.reduce((acc, r) => {
    acc.total += 1;
    if (r.meta?.turno === "Manhã") acc.manha += 1;
    if (r.meta?.turno === "Tarde") acc.tarde += 1;
    if (r.meta?.turno === "Noite") acc.noite += 1;
    return acc;
  }, { total: 0, manha: 0, tarde: 0, noite: 0 });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ModuleHeader mod={mod} action={records.length > 0 && (
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      )} />

      <IndustrialAgent moduleKey="funcionarios" />
      {records.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {records.map((r) => {
              const desempenho = Number(r.meta?.desempenho) || 0;
              const isHighPerformer = desempenho >= 90;
              return (
                <article key={r.id} className="surface-elevated group rounded-xl p-5 transition hover:ring-1 hover:ring-primary/30">
                  <header className="flex items-start gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <Users className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-semibold">{r.name}</h3>
                          <p className="text-xs text-muted-foreground">{r.meta?.cargo ?? "—"} · {r.meta?.setor ?? "—"}</p>
                        </div>
                        <Badge variant={isHighPerformer ? "default" : "secondary"} className="shrink-0 text-[10px]">
                          {isHighPerformer ? "Alto desempenho" : "Normal"}
                        </Badge>
                      </div>
                    </div>
                  </header>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Clock className="size-3" /> Turno
                      </div>
                      <div className="mt-1 text-sm font-semibold">{r.meta?.turno || "—"}</div>
                      <div className="text-[10px] text-muted-foreground">Admissão: {r.meta?.admissao || "—"}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Award className="size-3" /> Certificações
                      </div>
                      <div className="mt-1 text-sm font-semibold">{r.meta?.certificacoes || "—"}</div>
                      <div className="text-[10px] text-muted-foreground">Habilidades: {r.meta?.habilidades || "—"}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Activity className="size-3" /> Desempenho
                      </div>
                      <div className="mt-1 text-sm font-semibold">{desempenho}%</div>
                      <div className="h-1.5 w-full rounded-full bg-muted mt-1">
                        <div className={cn("h-full rounded-full transition-all", isHighPerformer ? "bg-green-500" : desempenho >= 70 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${desempenho}%` }} />
                      </div>
                    </div>
                  </div>

                  <footer className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="size-3.5" />
                        <span>{r.meta?.setor || "Sem setor"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
                      <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setEditing(r); setOpen(true); }}>
                        <Pencil className="size-3.5" /> Gerenciar
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => { if (confirm(`Remover "${r.name}"?`)) removeRecord("funcionarios", r.id); }}>
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
                <TrendingUp className="size-3.5" /> Resumo da Equipe
              </div>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Total</div>
                    <div className="font-mono text-lg font-semibold">{summary.total}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Manhã</div>
                    <div className="font-mono text-lg font-semibold text-amber-500">{summary.manha}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Tarde</div>
                    <div className="font-mono text-lg font-semibold text-blue-500">{summary.tarde}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Noite</div>
                    <div className="font-mono text-lg font-semibold text-purple-500">{summary.noite}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <GraduationCap className="size-3.5" /> Lacunas de Habilidades
              </div>
              <div className="mt-4 space-y-2">
                <SkillGap skill="Operação CNC" gap={3} urgency="high" />
                <SkillGap skill="Soldagem" gap={2} urgency="medium" />
                <SkillGap skill="Controle de qualidade" gap={1} urgency="low" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Calendar className="size-3.5" /> Frequência (7 dias)
              </div>
              <div className="mt-4 space-y-2">
                <AttendanceItem name="João Silva" days={7} status="present" />
                <AttendanceItem name="Maria Santos" days={6} status="late" />
                <AttendanceItem name="Pedro Costa" days={5} status="absent" />
                <AttendanceItem name="Ana Lima" days={7} status="present" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Award className="size-3.5" /> Top Performers
              </div>
              <div className="mt-4 space-y-2">
                <PerformerItem name="João Silva" score={95} role="Operador CNC" />
                <PerformerItem name="Maria Santos" score={92} role="Costureira" />
                <PerformerItem name="Ana Lima" score={90} role="Inspetora QC" />
              </div>
            </div>
          </aside>
        </div>
      )}
      <FuncionarioForm open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function SkillGap({ skill, gap, urgency }: { skill: string; gap: number; urgency: "high" | "medium" | "low" }) {
  const config = {
    high: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
    medium: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    low: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  };
  const c = config[urgency];
  return (
    <div className={cn("flex items-center justify-between rounded-lg border p-2.5", c.border, c.bg)}>
      <div className="flex items-center gap-2">
        <div className={cn("grid size-5 place-items-center rounded-md", c.bg, c.color)}>
          <AlertTriangle className="size-3" />
        </div>
        <span className="text-xs font-medium">{skill}</span>
      </div>
      <Badge variant="outline" className="text-[10px]">{gap} vagas</Badge>
    </div>
  );
}

function AttendanceItem({ name, days, status }: { name: string; days: number; status: "present" | "late" | "absent" }) {
  const config = {
    present: { icon: CheckCircle, color: "text-green-500" },
    late: { icon: Clock, color: "text-amber-500" },
    absent: { icon: XCircle, color: "text-red-500" },
  };
  const { icon: Icon, color } = config[status];
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
      <div className="flex items-center gap-2">
        <Icon className={cn("size-4", color)} />
        <span className="text-xs font-medium">{name}</span>
      </div>
      <div className="font-mono text-xs">{days}/7 dias</div>
    </div>
  );
}

function PerformerItem({ name, score, role }: { name: string; score: number; role: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 p-2.5">
      <div className="flex items-center gap-2">
        <div className="grid size-5 place-items-center rounded-md bg-primary/20 text-primary">
          <Award className="size-3" />
        </div>
        <div>
          <div className="text-xs font-medium">{name}</div>
          <div className="text-[10px] text-muted-foreground">{role}</div>
        </div>
      </div>
      <div className="font-mono text-xs font-semibold text-primary">{score}%</div>
    </div>
  );
}

function FuncionarioForm({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: ModuleRecord | null }) {
  const { data, setField, canSave, submit, reset, setData } = useModuleForm<Draft>({
    moduleKey: "funcionarios",
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
          cargo: meta.cargo || "",
          setor: meta.setor || "",
          turno: meta.turno || "",
          admissao: meta.admissao || "",
          habilidades: meta.habilidades || "",
          certificacoes: meta.certificacoes || "",
          desempenho: meta.desempenho || "",
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
          <SheetTitle>{editing ? "Editar funcionário" : "Novo funcionário"}</SheetTitle>
          <SheetDescription>Cadastre colaboradores, turnos, habilidades e certificações.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome completo *</Label>
            <Input autoFocus value={data.name} onChange={(e) => setField("name", e.target.value)} placeholder="Ex.: João Silva" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Cargo</Label>
              <Input value={data.cargo} onChange={(e) => setField("cargo", e.target.value)} placeholder="Ex.: Operador CNC" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Setor</Label>
              <Input value={data.setor} onChange={(e) => setField("setor", e.target.value)} placeholder="Ex.: Galpão A" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Turno</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={data.turno} onChange={(e) => setField("turno", e.target.value)}>
                <option value="">Selecione...</option>
                <option>Manhã</option>
                <option>Tarde</option>
                <option>Noite</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data de admissão</Label>
              <Input type="date" value={data.admissao} onChange={(e) => setField("admissao", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Habilidades</Label>
              <Input value={data.habilidades} onChange={(e) => setField("habilidades", e.target.value)} placeholder="Ex.: CNC, Soldagem" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Certificações</Label>
              <Input value={data.certificacoes} onChange={(e) => setField("certificacoes", e.target.value)} placeholder="Ex.: NR-10, NR-35" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Desempenho (%)</Label>
            <Input type="number" value={data.desempenho} onChange={(e) => setField("desempenho", e.target.value)} placeholder="0-100" />
          </div>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!canSave} className="gap-1.5"><Check className="size-4" /> {editing ? "Salvar" : "Criar funcionário"}</Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
