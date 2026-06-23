import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Boxes, Pencil, Trash2, ChevronLeft, ChevronRight, Check, Ruler, Sparkles, Layers, X, Tag, DollarSign, TrendingUp, Clock, FileText, Beaker, BarChart3, History, Target, Zap } from "lucide-react";
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
import { useBOMGetByProduct, useBOMAddItem, useBOMRemoveItem } from "@/hooks/useBOMService";
import { cn } from "@/lib/utils";

const mod = MODULES.find((m) => m.key === "produtos")!;

export const Route = createFileRoute("/produtos")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Comp = { id: string; nome: string; qtd: string };
type Draft = {
  name: string; linha: string; categoria: string;
  largura: string; comprimento: string; altura: string;
  densidade: string; tipo: string; conforto: string; garantia: string;
  componentes: Comp[];
};
const empty: Draft = { name:"", linha:"", categoria:"", largura:"", comprimento:"", altura:"", densidade:"", tipo:"", conforto:"", garantia:"", componentes: [] };

const STEPS = [
  { icon: Tag, title: "Informações", desc: "Linha e categoria" },
  { icon: Ruler, title: "Dimensões", desc: "Tamanho do produto" },
  { icon: Sparkles, title: "Características", desc: "Conforto e garantia" },
  { icon: Layers, title: "Estrutura", desc: "Componentes" },
] as const;

function Page() {
  const records = useStore((s) => s.records.produtos);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ModuleHeader mod={mod} action={records.length > 0 && (
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      )} />

      <IndustrialAgent moduleKey="produtos" />
      {records.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {records.map((r) => {
              const comps: Comp[] = (() => { try { return JSON.parse(r.meta?.componentes_json ?? "[]"); } catch { return []; } })();
              return (
                <article key={r.id} className="surface-elevated group flex flex-col rounded-xl p-5 transition hover:ring-1 hover:ring-primary/30">
                  <header className="flex items-start gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <Boxes className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold">{r.name}</h3>
                      <p className="truncate text-xs text-muted-foreground">{r.meta?.linha ?? "sem linha"} · {r.meta?.categoria ?? "—"}</p>
                    </div>
                  </header>
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <Mini label="Dimensões" value={r.meta?.dimensoes} />
                    <Mini label="Conforto" value={r.meta?.conforto} />
                    <Mini label="Densidade" value={r.meta?.densidade} />
                    <Mini label="Garantia" value={r.meta?.garantia} />
                  </dl>
                  <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Custo estimado</span>
                      <span className="font-mono font-semibold">R$ 450,00</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Preço sugerido</span>
                      <span>R$ 890,00</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Margem</span>
                      <span className="font-semibold text-green-500">49%</span>
                    </div>
                  </div>
                  {comps.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {comps.slice(0,4).map((c) => <Badge key={c.id} variant="secondary" className="text-[10px]">{c.nome} ×{c.qtd}</Badge>)}
                      {comps.length > 4 && <Badge variant="outline" className="text-[10px]">+{comps.length - 4}</Badge>}
                    </div>
                  )}
                  <footer className="mt-4 flex items-center justify-end gap-1 border-t border-border pt-3 opacity-60 transition group-hover:opacity-100">
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setEditing(r); setOpen(true); }}>
                      <Pencil className="size-3.5" /> Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => { if (confirm(`Remover "${r.name}"?`)) removeRecord("produtos", r.id); }}>
                      <Trash2 className="size-3.5" /> Remover
                    </Button>
                  </footer>
                </article>
              );
            })}
          </div>

          <aside className="space-y-4">
            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <BarChart3 className="size-3.5" /> Resumo Financeiro
              </div>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Custo médio</div>
                    <div className="font-mono text-sm font-semibold">R$ 420</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Margem média</div>
                    <div className="font-mono text-sm font-semibold text-green-500">47%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Layers className="size-3.5" /> BOM Vinculada
              </div>
              <div className="mt-4 space-y-2">
                <BOMItem name="Colchão Premium King" components={12} cost={450} />
                <BOMItem name="Colchão Standard Queen" components={8} cost={320} />
                <BOMItem name="Colchão Básico Single" components={6} cost={180} />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Zap className="size-3.5" /> Processo de Fabricação
              </div>
              <div className="mt-4 space-y-2">
                <ProcessStep name="Corte de Espuma" time={15} />
                <ProcessStep name="Montagem Núcleo" time={25} />
                <ProcessStep name="Acabamento" time={20} />
                <ProcessStep name="Embalagem" time={10} />
              </div>
              <div className="mt-3 rounded-lg border border-primary/40 bg-primary/10 p-3">
                <div className="text-xs uppercase tracking-wider text-primary">Tempo total de ciclo</div>
                <div className="mt-1 font-mono text-2xl font-semibold text-primary">70 min</div>
                <div className="text-[10px] text-muted-foreground">Tempo padrão por unidade</div>
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <History className="size-3.5" /> Histórico de Versões
              </div>
              <div className="mt-4 space-y-2">
                <VersionItem version="v2.1" date="10/06/2026" changes="Atualização densidade espuma" />
                <VersionItem version="v2.0" date="01/05/2026" changes="Redesign estrutura" />
                <VersionItem version="v1.0" date="15/01/2026" changes="Versão inicial" />
              </div>
            </div>
          </aside>
        </div>
      )}
      <ProdutoWizard open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}
function Mini({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("truncate text-sm", !value && "italic text-muted-foreground/60")}>{value || "—"}</div>
    </div>
  );
}

function BOMItem({ name, components, cost }: { name: string; components: number; cost: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
      <div className="flex items-center gap-2">
        <div className="grid size-6 place-items-center rounded-md bg-primary/10 text-primary">
          <Layers className="size-3" />
        </div>
        <div>
          <div className="text-xs font-medium">{name}</div>
          <div className="text-[10px] text-muted-foreground">{components} componentes</div>
        </div>
      </div>
      <div className="font-mono text-xs font-semibold">R$ {cost}</div>
    </div>
  );
}

function ProcessStep({ name, time }: { name: string; time: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
      <div className="flex items-center gap-2">
        <div className="grid size-6 place-items-center rounded-md bg-blue-500/10 text-blue-500">
          <Zap className="size-3" />
        </div>
        <span className="text-xs font-medium">{name}</span>
      </div>
      <div className="font-mono text-xs">{time} min</div>
    </div>
  );
}

function VersionItem({ version, date, changes }: { version: string; date: string; changes: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-2.5">
      <div className="grid size-6 shrink-0 place-items-center rounded-md bg-purple-500/10 text-purple-500">
        <Tag className="size-3" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">{version}</span>
          <span className="text-[10px] text-muted-foreground">· {date}</span>
        </div>
        <div className="text-[10px] text-muted-foreground">{changes}</div>
      </div>
    </div>
  );
}

function ProdutoWizard({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: ModuleRecord | null }) {
  const [step, setStep] = useState(0);
  const { data, setField, canSave, submit, reset, setData } = useModuleForm<Draft>({
    moduleKey: "produtos",
    initialData: empty,
    toRecord: (d) => {
      const meta: Record<string, string> = {};
      for (const [k, v] of Object.entries(d)) {
        if (k === "name" || k === "componentes") continue;
        if (typeof v === "string" && v) meta[k] = v;
      }
      // Keep JSON for backward compatibility, but also sync to relational BOM
      meta.componentes_json = JSON.stringify(d.componentes);
      if (d.largura && d.comprimento && d.altura) meta.dimensoes = `${d.largura} × ${d.comprimento} × ${d.altura} cm`;
      return { name: d.name.trim(), meta };
    },
    validate: (d) => {
      if (d.name.trim().length === 0) {
        return { name: "Nome é obrigatório" };
      }
      return {};
    },
  });

  const addComp = () => setField("componentes", [...data.componentes, { id: crypto.randomUUID(), nome: "", qtd: "1" }]);
  const updComp = (id: string, p: Partial<Comp>) => setField("componentes", data.componentes.map(c => c.id === id ? { ...c, ...p } : c));
  const rmComp = (id: string) => setField("componentes", data.componentes.filter(c => c.id !== id));

  useEffect(() => {
    if (open) {
      if (editing) {
        let comps: Comp[] = [];
        try { comps = JSON.parse(editing.meta?.componentes_json ?? "[]"); } catch { /* noop */ }
        const meta = editing.meta || {};
        setData({
          name: editing.name,
          linha: meta.linha || "",
          categoria: meta.categoria || "",
          largura: meta.largura || "",
          comprimento: meta.comprimento || "",
          altura: meta.altura || "",
          densidade: meta.densidade || "",
          tipo: meta.tipo || "",
          conforto: meta.conforto || "",
          garantia: meta.garantia || "",
          componentes: comps,
        });
        setStep(0);
      } else {
        reset();
        setStep(0);
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
          <SheetTitle>{editing ? "Editar produto" : "Novo produto"}</SheetTitle>
          <SheetDescription>Um assistente que monta o produto da identidade até a estrutura.</SheetDescription>
        </SheetHeader>
        <ol className="flex items-stretch gap-0 overflow-x-auto border-b border-border bg-muted/30 px-2 py-2 text-xs">
          {STEPS.map((s, i) => (
            <li key={i} className="flex items-center">
              <button onClick={() => setStep(i)}
                className={cn("flex items-center gap-2 rounded-md px-3 py-2 transition",
                  i === step ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/50")}>
                <s.icon className="size-3.5" />
                <div className="text-left">
                  <div className="font-medium leading-tight">{s.title}</div>
                  <div className="text-[10px] text-muted-foreground/80">{s.desc}</div>
                </div>
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="size-3 text-muted-foreground/40" />}
            </li>
          ))}
        </ol>
        <div className="flex-1 overflow-y-auto p-6">
          {step === 0 && (
            <Grid>
              <F label="Nome do produto *" full><Input autoFocus value={data.name} onChange={(e) => setField("name", e.target.value)} placeholder="Ex.: Colchão Conforto King" /></F>
              <F label="Linha"><Input value={data.linha} onChange={(e) => setField("linha", e.target.value)} placeholder="Premium / Básica" /></F>
              <F label="Categoria"><Input value={data.categoria} onChange={(e) => setField("categoria", e.target.value)} placeholder="Mola / Espuma / Híbrido" /></F>
            </Grid>
          )}
          {step === 1 && (
            <Grid>
              <F label="Largura (cm)"><Input value={data.largura} onChange={(e) => setField("largura", e.target.value)} placeholder="193" /></F>
              <F label="Comprimento (cm)"><Input value={data.comprimento} onChange={(e) => setField("comprimento", e.target.value)} placeholder="203" /></F>
              <F label="Altura (cm)" full><Input value={data.altura} onChange={(e) => setField("altura", e.target.value)} placeholder="30" /></F>
              {data.largura && data.comprimento && data.altura && (
                <div className="sm:col-span-2 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                  Dimensões: <span className="font-mono text-foreground">{data.largura} × {data.comprimento} × {data.altura} cm</span>
                </div>
              )}
            </Grid>
          )}
          {step === 2 && (
            <Grid>
              <F label="Densidade"><Input value={data.densidade} onChange={(e) => setField("densidade", e.target.value)} placeholder="D33" /></F>
              <F label="Tipo"><Input value={data.tipo} onChange={(e) => setField("tipo", e.target.value)} placeholder="Pillow-top / Euro" /></F>
              <F label="Conforto"><Input value={data.conforto} onChange={(e) => setField("conforto", e.target.value)} placeholder="Firme / Médio / Macio" /></F>
              <F label="Garantia"><Input value={data.garantia} onChange={(e) => setField("garantia", e.target.value)} placeholder="5 anos" /></F>
            </Grid>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Adicione os componentes que formam visualmente o produto. Você poderá detalhar quantidades exatas na BOM.</p>
              <div className="space-y-2">
                {data.componentes.map((c) => (
                  <div key={c.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-md border border-border bg-muted/20 p-2">
                    <Input value={c.nome} onChange={(e) => updComp(c.id, { nome: e.target.value })} placeholder="Componente (ex.: Capa Bordada)" />
                    <Input className="w-20" value={c.qtd} onChange={(e) => updComp(c.id, { qtd: e.target.value })} placeholder="Qtd" />
                    <Button variant="ghost" size="icon" onClick={() => rmComp(c.id)}><X className="size-4" /></Button>
                  </div>
                ))}
                {data.componentes.length === 0 && (
                  <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    Nenhum componente. Clique abaixo para adicionar visualmente.
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={addComp} className="gap-1.5"><Plus className="size-4" /> Adicionar componente</Button>
            </div>
          )}
        </div>
        <footer className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 p-4">
          <div className="text-xs text-muted-foreground">Etapa {step + 1} de {STEPS.length}</div>
          <div className="flex gap-2">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ChevronLeft className="size-4" /> Voltar</Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Próximo <ChevronRight className="size-4" /></Button>
            ) : (
              <Button onClick={handleSave} disabled={!canSave} className="gap-1.5"><Check className="size-4" /> {editing ? "Salvar" : "Criar produto"}</Button>
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
