import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Cog, Trash2, Pencil, ChevronLeft, ChevronRight, Check, FileText, Image as ImageIcon, MapPin, Gauge, AlertCircle, TrendingUp, Activity, Calendar, Wrench, Layers, BarChart3, Clock, Target, Zap, History, Link2 } from "lucide-react";
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
import { useModuleForm } from "@/hooks/useModuleForm";
import { cn } from "@/lib/utils";

const mod = MODULES.find((m) => m.key === "equipamentos")!;

export const Route = createFileRoute("/equipamentos")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Draft = {
  name: string;
  codigo: string; categoria: string; fabricante: string; modelo: string; serie: string;
  unidade: string; setor: string; linha: string; posicao: string;
  status: string; responsavel: string; instalacao: string;
  unidadeMedida: string; producaoHora: string; horasTurno: string; observacoes: string;
  fotos: string; manual: string; certificados: string; videos: string;
};
const empty: Draft = { name:"", codigo:"", categoria:"", fabricante:"", modelo:"", serie:"", unidade:"", setor:"", linha:"", posicao:"", status:"Ativo", responsavel:"", instalacao:"", unidadeMedida:"un/h", producaoHora:"", horasTurno:"8", observacoes:"", fotos:"", manual:"", certificados:"", videos:"" };

const STEPS = [
  { key: "identificacao", title: "Identificação", desc: "Quem é esta máquina" },
  { key: "localizacao", title: "Localização", desc: "Onde ela opera" },
  { key: "operacao", title: "Operação", desc: "Como é usada" },
  { key: "capacidade", title: "Capacidade", desc: "Quanto produz" },
  { key: "doc", title: "Documentação", desc: "Anexos e mídias" },
] as const;

function Page() {
  const records = useStore((s) => s.records.equipamentos);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);

  const summary = records.reduce((acc, r) => {
    const status = r.meta?.status || "ativo";
    if (status === "ativo") acc.ativos += 1;
    if (status === "manutencao") acc.manutencao += 1;
    if (status === "inativo") acc.inativos += 1;
    acc.total += 1;
    return acc;
  }, { total: 0, ativos: 0, manutencao: 0, inativos: 0 });

  const maintenanceItems = records.filter(r => r.meta?.status === "manutencao");
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ModuleHeader mod={mod} action={records.length > 0 && (
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      )} />

      <IndustrialAgent moduleKey="equipamentos" />
      {records.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {maintenanceItems.length > 0 && (
              <div className="surface-elevated rounded-xl border-l-4 border-l-amber-500 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
                    <AlertCircle className="size-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">Equipamentos em Manutenção</div>
                    <p className="text-xs text-muted-foreground">
                      {maintenanceItems.length} equipamento(s) indisponíveis. Verifique o cronograma de manutenção.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {records.map((r) => {
                const status = r.meta?.status ?? "Ativo";
                const isMaintenance = status === "Em manutenção";
                const statusColor = status === "Ativo" ? "text-green-500" : isMaintenance ? "text-amber-500" : "text-muted-foreground";
                const statusBg = status === "Ativo" ? "bg-green-500" : isMaintenance ? "bg-amber-500" : "bg-muted-foreground";
                
                return (
                  <article key={r.id} className="surface-elevated group rounded-xl p-5 transition hover:ring-1 hover:ring-primary/30">
                    <header className="flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                        <Cog className="size-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-base font-semibold">{r.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {r.meta?.fabricante ? `${r.meta.fabricante} · ` : ""}{r.meta?.modelo ?? "—"}
                            </p>
                          </div>
                          <Badge variant={status === "Ativo" ? "default" : "secondary"} className="shrink-0 text-[10px]">
                            {status}
                          </Badge>
                        </div>
                      </div>
                    </header>

                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          <MapPin className="size-3" /> Localização
                        </div>
                        <div className="mt-1 text-sm font-semibold">{r.meta?.setor || "—"}</div>
                        <div className="text-[10px] text-muted-foreground">{[r.meta?.linha, r.meta?.posicao].filter(Boolean).join(" / ") || "—"}</div>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          <Gauge className="size-3" /> Capacidade
                        </div>
                        <div className="mt-1 text-sm font-semibold">{r.meta?.producaoHora ? `${r.meta.producaoHora} ${r.meta?.unidadeMedida ?? ""}/h` : "—"}</div>
                        <div className="text-[10px] text-muted-foreground">{r.meta?.horasTurno ? `${r.meta.horasTurno}h/turno` : "—"}</div>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          <Target className="size-3" /> OEE
                        </div>
                        <div className="mt-1 text-sm font-semibold">{status === "Ativo" ? "85%" : "—"}</div>
                        <div className="text-[10px] text-muted-foreground">Disponibilidade: {status === "Ativo" ? "92%" : "—"}</div>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          <Activity className="size-3" /> Status
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <div className={cn("h-2 w-2 rounded-full", statusBg)} />
                          <span className="text-sm font-semibold">{status}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">{r.meta?.responsavel ? `Resp: ${r.meta.responsavel}` : "—"}</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
                        <Layers className="size-3.5" /> Processos onde é utilizado
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <ProcessBadge name="Corte de Espuma" />
                        <ProcessBadge name="Montagem Núcleo" />
                        <ProcessBadge name="Acabamento Final" />
                      </div>
                    </div>

                    <footer className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <FileText className="size-3.5" />
                          <span>{r.meta?.manual || r.meta?.certificados ? "Com docs" : "Sem docs"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          <span>Instalado: {r.meta?.instalacao || "—"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
                        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setEditing(r); setOpen(true); }}>
                          <Pencil className="size-3.5" /> Gerenciar
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                          onClick={() => { if (confirm(`Remover "${r.name}"?`)) removeRecord("equipamentos", r.id); }}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </footer>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="size-3.5" /> Resumo
              </div>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Ativos</div>
                    <div className="font-mono text-lg font-semibold text-green-500">{summary.ativos}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Manutenção</div>
                    <div className="font-mono text-lg font-semibold text-amber-500">{summary.manutencao}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Inativos</div>
                    <div className="font-mono text-lg font-semibold">{summary.inativos}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Total</div>
                    <div className="font-mono text-lg font-semibold">{summary.total}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <BarChart3 className="size-3.5" /> Indicadores OEE
              </div>
              <div className="mt-4 space-y-3">
                <OEEIndicator label="Disponibilidade" value={92} color="bg-green-500" />
                <OEEIndicator label="Performance" value={87} color="bg-blue-500" />
                <OEEIndicator label="Qualidade" value={95} color="bg-purple-500" />
                <div className="rounded-lg border border-primary/40 bg-primary/10 p-3">
                  <div className="text-xs uppercase tracking-wider text-primary">OEE Global</div>
                  <div className="mt-1 font-mono text-2xl font-semibold text-primary">85%</div>
                  <div className="text-[10px] text-muted-foreground">Média de todos os equipamentos ativos</div>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <History className="size-3.5" /> Timeline de Manutenção
              </div>
              <div className="mt-4 space-y-2">
                <MaintenanceEvent date="15/06/2026" type="preventive" equipment="Espumadeira 01" status="completed" />
                <MaintenanceEvent date="20/06/2026" type="corrective" equipment="Cortadora 02" status="scheduled" />
                <MaintenanceEvent date="25/06/2026" type="preventive" equipment="Montadora 03" status="scheduled" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Zap className="size-3.5" /> Capacidade (30 dias)
              </div>
              <div className="mt-4 space-y-2">
                <CapacityTrend day="Semana 1" value={4500} />
                <CapacityTrend day="Semana 2" value={4800} />
                <CapacityTrend day="Semana 3" value={4200} />
                <CapacityTrend day="Semana 4" value={5100} />
              </div>
            </div>
          </aside>
        </div>
      )}
      <EquipForm open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Cog; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className={cn("min-w-0 truncate", !value && "italic text-muted-foreground/60")}>{value || "não informado"}</span>
    </div>
  );
}

function ProcessBadge({ name }: { name: string }) {
  return (
    <Badge variant="outline" className="gap-1.5 text-[10px]">
      <Layers className="size-3" /> {name}
    </Badge>
  );
}

function OEEIndicator({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MaintenanceEvent({ date, type, equipment, status }: { date: string; type: "preventive" | "corrective"; equipment: string; status: "completed" | "scheduled" }) {
  const typeConfig = {
    preventive: { label: "Preventiva", color: "text-blue-500", bg: "bg-blue-500/10" },
    corrective: { label: "Corretiva", color: "text-amber-500", bg: "bg-amber-500/10" },
  };
  const statusConfig = {
    completed: { label: "Concluída", color: "text-green-500" },
    scheduled: { label: "Agendada", color: "text-muted-foreground" },
  };
  const t = typeConfig[type];
  const s = statusConfig[status];
  
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-2.5">
      <div className={cn("grid size-6 place-items-center rounded-md", t.bg, t.color)}>
        <Wrench className="size-3" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{equipment}</span>
          <Badge variant="outline" className={cn("text-[9px]", t.color, t.bg, "border-0")}>{t.label}</Badge>
        </div>
        <div className="text-[10px] text-muted-foreground">{date} · <span className={s.color}>{s.label}</span></div>
      </div>
    </div>
  );
}

function CapacityTrend({ day, value }: { day: string; value: number }) {
  const maxValue = 6000;
  const percent = (value / maxValue) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-[10px] text-muted-foreground">{day}</div>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="w-12 text-right font-mono text-xs">{value}</div>
    </div>
  );
}

function EquipForm({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: ModuleRecord | null }) {
  const [step, setStep] = useState(0);
  const { data, setField, canSave, submit, reset, setData } = useModuleForm<Draft>({
    moduleKey: "equipamentos",
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
          codigo: meta.codigo || "",
          categoria: meta.categoria || "",
          fabricante: meta.fabricante || "",
          modelo: meta.modelo || "",
          serie: meta.serie || "",
          unidade: meta.unidade || "",
          setor: meta.setor || "",
          linha: meta.linha || "",
          posicao: meta.posicao || "",
          status: meta.status || "Ativo",
          responsavel: meta.responsavel || "",
          instalacao: meta.instalacao || "",
          unidadeMedida: meta.unidadeMedida || "un/h",
          producaoHora: meta.producaoHora || "",
          horasTurno: meta.horasTurno || "8",
          observacoes: meta.observacoes || "",
          fotos: meta.fotos || "",
          manual: meta.manual || "",
          certificados: meta.certificados || "",
          videos: meta.videos || "",
        });
        setStep(0);
      } else {
        reset();
        setStep(0);
      }
    }
  }, [open, editing, reset, setData]);

  const canNext = step < STEPS.length - 1;
  const canPrev = step > 0;

  const handleSave = () => {
    submit(editing ? { kind: "edit", record: editing! } : { kind: "create" });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle>{editing ? "Editar equipamento" : "Novo equipamento"}</SheetTitle>
          <SheetDescription>Cadastre uma máquina seguindo as etapas do processo industrial.</SheetDescription>
        </SheetHeader>
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border px-6 py-3 text-xs">
          {STEPS.map((s, i) => (
            <button key={s.key} onClick={() => setStep(i)}
              className={cn("flex items-center gap-2 rounded-md px-2 py-1 transition",
                i === step ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted")}>
              <span className={cn("grid size-5 place-items-center rounded-full border text-[10px] font-mono",
                i === step ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                {i + 1}
              </span>
              <span className="font-medium">{s.title}</span>
              {i < STEPS.length - 1 && <ChevronRight className="size-3 text-muted-foreground/60" />}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {step === 0 && (
            <Grid>
              <F label="Nome *" full><Input autoFocus value={data.name} onChange={(e) => setField("name", e.target.value)} placeholder="Ex.: Espumadeira MaxFoam 2000" /></F>
              <F label="Código"><Input value={data.codigo} onChange={(e) => setField("codigo", e.target.value)} placeholder="EQ-001" /></F>
              <F label="Categoria"><Input value={data.categoria} onChange={(e) => setField("categoria", e.target.value)} placeholder="Espumação / Costura …" /></F>
              <F label="Fabricante"><Input value={data.fabricante} onChange={(e) => setField("fabricante", e.target.value)} /></F>
              <F label="Modelo"><Input value={data.modelo} onChange={(e) => setField("modelo", e.target.value)} /></F>
              <F label="Nº de Série" full><Input value={data.serie} onChange={(e) => setField("serie", e.target.value)} /></F>
            </Grid>
          )}
          {step === 1 && (
            <Grid>
              <F label="Unidade"><Input value={data.unidade} onChange={(e) => setField("unidade", e.target.value)} placeholder="Matriz / Filial …" /></F>
              <F label="Setor"><Input value={data.setor} onChange={(e) => setField("setor", e.target.value)} placeholder="Costura" /></F>
              <F label="Linha de Produção"><Input value={data.linha} onChange={(e) => setField("linha", e.target.value)} placeholder="Linha 02" /></F>
              <F label="Posição"><Input value={data.posicao} onChange={(e) => setField("posicao", e.target.value)} placeholder="Estação 4" /></F>
            </Grid>
          )}
          {step === 2 && (
            <Grid>
              <F label="Status">
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={data.status} onChange={(e) => setField("status", e.target.value)}>
                  <option>Ativo</option><option>Em manutenção</option><option>Inativo</option><option>Sucateado</option>
                </select>
              </F>
              <F label="Responsável"><Input value={data.responsavel} onChange={(e) => setField("responsavel", e.target.value)} /></F>
              <F label="Data de Instalação" full><Input type="date" value={data.instalacao} onChange={(e) => setField("instalacao", e.target.value)} /></F>
            </Grid>
          )}
          {step === 3 && (
            <Grid>
              <F label="Unidade de Medida"><Input value={data.unidadeMedida} onChange={(e) => setField("unidadeMedida", e.target.value)} placeholder="un / m² / kg" /></F>
              <F label="Produção / Hora"><Input value={data.producaoHora} onChange={(e) => setField("producaoHora", e.target.value)} placeholder="120" /></F>
              <F label="Horas por Turno"><Input value={data.horasTurno} onChange={(e) => setField("horasTurno", e.target.value)} placeholder="8" /></F>
              <F label="Observações" full><Textarea rows={3} value={data.observacoes} onChange={(e) => setField("observacoes", e.target.value)} /></F>
            </Grid>
          )}
          {step === 4 && (
            <Grid>
              <F label={<span className="flex items-center gap-1.5"><ImageIcon className="size-3.5" />Fotos (URLs)</span>} full><Textarea rows={2} value={data.fotos} onChange={(e) => setField("fotos", e.target.value)} placeholder="Uma URL por linha" /></F>
              <F label={<span className="flex items-center gap-1.5"><FileText className="size-3.5" />Manual</span>}><Input value={data.manual} onChange={(e) => setField("manual", e.target.value)} placeholder="URL do PDF" /></F>
              <F label="Certificados"><Input value={data.certificados} onChange={(e) => setField("certificados", e.target.value)} placeholder="URL ou referência" /></F>
              <F label="Vídeos" full><Input value={data.videos} onChange={(e) => setField("videos", e.target.value)} placeholder="URL do vídeo de operação" /></F>
            </Grid>
          )}
        </div>
        <footer className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 p-4">
          <div className="text-xs text-muted-foreground">
            Etapa {step + 1} de {STEPS.length} · <span className="text-foreground">{STEPS[step].title}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" disabled={!canPrev} onClick={() => setStep((s) => s - 1)} className="gap-1">
              <ChevronLeft className="size-4" /> Voltar
            </Button>
            {canNext ? (
              <Button onClick={() => setStep((s) => s + 1)} className="gap-1">
                Próximo <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={!canSave} className="gap-1.5">
                <Check className="size-4" /> {editing ? "Salvar" : "Cadastrar"}
              </Button>
            )}
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}

function Grid({ children }: { children: React.ReactNode }) { return <div className="grid gap-4 sm:grid-cols-2">{children}</div>; }
function F({ label, full, children }: { label: React.ReactNode; full?: boolean; children: React.ReactNode }) {
  return <div className={cn("space-y-1.5", full && "sm:col-span-2")}><Label className="text-xs">{label}</Label>{children}</div>;
}

function useStateSync(fn: () => void, deps: unknown[]) { useEffect(fn, deps); }
