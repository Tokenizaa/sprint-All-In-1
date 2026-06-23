import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Package, Pencil, Trash2, Info, Boxes, ShoppingCart, Check, TrendingUp, AlertTriangle, Truck, BarChart3, Layers, FileText, Beaker, Link2, History, PieChart, ChevronRight } from "lucide-react";
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

const mod = MODULES.find((m) => m.key === "materias-primas")!;

export const Route = createFileRoute("/materias-primas")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Draft = {
  name: string; codigo: string; categoria: string; unidade: string;
  dimensoes: string; densidade: string; cor: string; peso: string;
  estoqueInicial: string; estoqueMinimo: string; localizacao: string;
  fornecedor: string; leadTime: string; ultimaCompra: string;
};
const empty: Draft = { name:"", codigo:"", categoria:"", unidade:"un", dimensoes:"", densidade:"", cor:"", peso:"", estoqueInicial:"0", estoqueMinimo:"0", localizacao:"", fornecedor:"", leadTime:"", ultimaCompra:"" };

function Page() {
  const records = useStore((s) => s.records["materias-primas"]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);

  const summary = records.reduce((acc, r) => {
    const estoque = Number(r.meta?.estoqueInicial) || 0;
    const minimo = Number(r.meta?.estoqueMinimo) || 0;
    if (estoque < minimo) acc.baixo += 1;
    acc.total += estoque;
    acc.itens += 1;
    return acc;
  }, { total: 0, itens: 0, baixo: 0 });

  const lowStockItems = records.filter(r => {
    const estoque = Number(r.meta?.estoqueInicial) || 0;
    const minimo = Number(r.meta?.estoqueMinimo) || 0;
    return estoque < minimo && minimo > 0;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ModuleHeader mod={mod} action={records.length > 0 && (
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      )} />

      <IndustrialAgent moduleKey="materias-primas" />
      {records.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {lowStockItems.length > 0 && (
              <div className="surface-elevated rounded-xl border-l-4 border-l-amber-500 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
                    <AlertTriangle className="size-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">Estoque Baixo</div>
                    <p className="text-xs text-muted-foreground">
                      {lowStockItems.length} insumo(s) abaixo do mínimo. Considere repor estoque.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {records.map((r) => {
                const min = Number(r.meta?.estoqueMinimo ?? 0);
                const cur = Number(r.meta?.estoqueInicial ?? 0);
                const low = cur < min && min > 0;
                const percent = min > 0 ? Math.min((cur / min) * 100, 100) : 100;
                
                return (
                  <article key={r.id} className="surface-elevated group rounded-xl p-5 transition hover:ring-1 hover:ring-primary/30">
                    <header className="flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                        <Package className="size-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-base font-semibold">{r.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {r.meta?.codigo ?? "—"} · {r.meta?.categoria || "sem categoria"}
                            </p>
                          </div>
                          {low && <Badge variant="destructive" className="shrink-0 text-[10px]">Baixo</Badge>}
                        </div>
                      </div>
                    </header>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          <Boxes className="size-3" /> Estoque
                        </div>
                        <div className="mt-1 font-mono text-sm font-semibold">{cur} {r.meta?.unidade ?? ""}</div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                          <div 
                            className={cn("h-full rounded-full transition-all", low ? "bg-red-500" : "bg-green-500")} 
                            style={{ width: `${percent}%` }} 
                          />
                        </div>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          <ShoppingCart className="size-3" /> Lead Time
                        </div>
                        <div className="mt-1 font-mono text-sm font-semibold">{r.meta?.leadTime ? `${r.meta.leadTime} dias` : "—"}</div>
                        <div className="text-[10px] text-muted-foreground">Fornecedor: {r.meta?.fornecedor || "—"}</div>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          <Layers className="size-3" /> Categoria
                        </div>
                        <div className="mt-1 text-sm font-semibold">{r.meta?.categoria || "—"}</div>
                        <div className="text-[10px] text-muted-foreground">{r.meta?.dimensoes || "—"}</div>
                      </div>
                    </div>

                    <footer className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <FileText className="size-3.5" />
                          <span>{r.meta?.densidade || "—"} densidade</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Truck className="size-3.5" />
                          <span>Última compra: {r.meta?.ultimaCompra || "—"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
                        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setEditing(r); setOpen(true); }}>
                          <Pencil className="size-3.5" /> Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                          onClick={() => { if (confirm(`Remover "${r.name}"?`)) removeRecord("materias-primas", r.id); }}>
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
                <BarChart3 className="size-3.5" /> Resumo
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total em estoque</span>
                    <span className="font-semibold">{summary.total.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Itens</div>
                    <div className="font-mono text-lg font-semibold">{summary.itens}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Estoque baixo</div>
                    <div className="font-mono text-lg font-semibold text-red-500">{summary.baixo}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <PieChart className="size-3.5" /> Curva ABC
              </div>
              <div className="mt-4 space-y-2">
                <ABCItem category="A" percentage={20} description="20% dos itens representam 80% do valor" color="bg-red-500" />
                <ABCItem category="B" percentage={30} description="30% dos itens representam 15% do valor" color="bg-amber-500" />
                <ABCItem category="C" percentage={50} description="50% dos itens representam 5% do valor" color="bg-green-500" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <History className="size-3.5" /> Consumo (30 dias)
              </div>
              <div className="mt-4 space-y-2">
                <ConsumptionBar day="Semana 1" value={1200} />
                <ConsumptionBar day="Semana 2" value={1450} />
                <ConsumptionBar day="Semana 3" value={980} />
                <ConsumptionBar day="Semana 4" value={1320} />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Beaker className="size-3.5" /> Especificações Técnicas
              </div>
              <div className="mt-4 space-y-2">
                <SpecItem label="Densidade média" value="28 kg/m³" />
                <SpecItem label="Resiliência" value="Alta" />
                <SpecItem label="Certificação" value="ISO 9001" />
                <SpecItem label="Armazenamento" value="Seco, ventilado" />
              </div>
            </div>
          </aside>
        </div>
      )}
      <MpForm open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="truncate font-mono text-sm">{value}</div>
    </div>
  );
}

function ABCItem({ category, percentage, description, color }: { category: string; percentage: number; description: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("grid size-6 place-items-center rounded-md", color, "text-white")}>
            <span className="text-xs font-bold">{category}</span>
          </div>
          <span className="text-xs font-medium">{percentage}% dos itens</span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">{description}</p>
    </div>
  );
}

function ConsumptionBar({ day, value }: { day: string; value: number }) {
  const maxValue = 1500;
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

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

function MpForm({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: ModuleRecord | null }) {
  const { data, setField, canSave, submit, reset, setData } = useModuleForm<Draft>({
    moduleKey: "materias-primas",
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
          codigo: meta.codigo || "",
          categoria: meta.categoria || "",
          unidade: meta.unidade || "un",
          dimensoes: meta.dimensoes || "",
          densidade: meta.densidade || "",
          cor: meta.cor || "",
          peso: meta.peso || "",
          estoqueInicial: meta.estoqueInicial || "0",
          estoqueMinimo: meta.estoqueMinimo || "0",
          localizacao: meta.localizacao || "",
          fornecedor: meta.fornecedor || "",
          leadTime: meta.leadTime || "",
          ultimaCompra: meta.ultimaCompra || "",
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
          <SheetTitle>{editing ? "Editar matéria-prima" : "Nova matéria-prima"}</SheetTitle>
          <SheetDescription>Organize por grupos: o que é, quanto há e onde vem.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <Section icon={Info} title="Informações gerais" hint="Identificação e especificações técnicas.">
            <Grid>
              <F label="Nome *" full><Input autoFocus value={data.name} onChange={(e) => setField("name", e.target.value)} placeholder="Ex.: Espuma D33 1.40m" /></F>
              <F label="Código"><Input value={data.codigo} onChange={(e) => setField("codigo", e.target.value)} placeholder="MP-001" /></F>
              <F label="Categoria"><Input value={data.categoria} onChange={(e) => setField("categoria", e.target.value)} placeholder="Espuma / Tecido / Mola" /></F>
              <F label="Unidade"><Input value={data.unidade} onChange={(e) => setField("unidade", e.target.value)} placeholder="m / kg / un" /></F>
              <F label="Dimensões"><Input value={data.dimensoes} onChange={(e) => setField("dimensoes", e.target.value)} placeholder="1.40 x 2.00 x 0.30 m" /></F>
              <F label="Densidade"><Input value={data.densidade} onChange={(e) => setField("densidade", e.target.value)} placeholder="33 kg/m³" /></F>
              <F label="Cor"><Input value={data.cor} onChange={(e) => setField("cor", e.target.value)} /></F>
              <F label="Peso"><Input value={data.peso} onChange={(e) => setField("peso", e.target.value)} placeholder="kg" /></F>
            </Grid>
          </Section>
          <Section icon={Boxes} title="Estoque" hint="Controle de inventário inicial e mínimo.">
            <Grid>
              <F label="Estoque inicial"><Input type="number" value={data.estoqueInicial} onChange={(e) => setField("estoqueInicial", e.target.value)} /></F>
              <F label="Estoque mínimo"><Input type="number" value={data.estoqueMinimo} onChange={(e) => setField("estoqueMinimo", e.target.value)} /></F>
              <F label="Localização" full><Input value={data.localizacao} onChange={(e) => setField("localizacao", e.target.value)} placeholder="Galpão A · Rua 3 · Pallet 12" /></F>
            </Grid>
          </Section>
          <Section icon={ShoppingCart} title="Compras" hint="Quem fornece e em quanto tempo.">
            <Grid>
              <F label="Fornecedor principal"><Input value={data.fornecedor} onChange={(e) => setField("fornecedor", e.target.value)} /></F>
              <F label="Lead time (dias)"><Input type="number" value={data.leadTime} onChange={(e) => setField("leadTime", e.target.value)} placeholder="7" /></F>
              <F label="Última compra" full><Input type="date" value={data.ultimaCompra} onChange={(e) => setField("ultimaCompra", e.target.value)} /></F>
            </Grid>
          </Section>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!canSave} className="gap-1.5">
            <Check className="size-4" /> {editing ? "Salvar" : "Cadastrar"}
          </Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}

function Section({ icon: Icon, title, hint, children }: { icon: typeof Info; title: string; hint: string; children: React.ReactNode }) {
  return (
    <section>
      <header className="mb-3 flex items-center gap-2">
        <div className="grid size-7 place-items-center rounded-md bg-primary/10 ring-1 ring-primary/20">
          <Icon className="size-3.5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </header>
      {children}
    </section>
  );
}
function Grid({ children }: { children: React.ReactNode }) { return <div className="grid gap-4 sm:grid-cols-2">{children}</div>; }
function F({ label, full, children }: { label: React.ReactNode; full?: boolean; children: React.ReactNode }) {
  return <div className={cn("space-y-1.5", full && "sm:col-span-2")}><Label className="text-xs">{label}</Label>{children}</div>;
}
