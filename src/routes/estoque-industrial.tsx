import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Factory, Pencil, Trash2, Package, Layers, Box, Wrench, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ModuleHeader } from "@/components/module-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndustrialAgent } from "@/components/industrial-copilot";
import { MODULES } from "@/lib/modules";
import { addRecord, removeRecord, updateRecord, useStore, type ModuleRecord } from "@/lib/store";
import { cn } from "@/lib/utils";

const mod = MODULES.find((m) => m.key === "estoque-industrial")!;

export const Route = createFileRoute("/estoque-industrial")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Draft = {
  codigo: string;
  nome: string;
  categoria: string;
  unidade: string;
  saldo: string;
  saldoMinimo: string;
  localizacao: string;
  fornecedor: string;
  classificacao: string;
  observacoes: string;
};

const empty: Draft = {
  codigo: "",
  nome: "",
  categoria: "",
  unidade: "",
  saldo: "0",
  saldoMinimo: "0",
  localizacao: "",
  fornecedor: "",
  classificacao: "c",
  observacoes: "",
};

const CATEGORIAS = [
  { value: "materia-prima", label: "Matéria-Prima", icon: Package },
  { value: "semiacabado", label: "Semi-Acabado", icon: Layers },
  { value: "produto-acabado", label: "Produto Acabado", icon: Box },
  { value: "materiais-auxiliares", label: "Materiais Auxiliares", icon: Wrench },
  { value: "insumos", label: "Insumos", icon: Package },
  { value: "embalagens", label: "Embalagens", icon: Box },
] as const;

const CLASSIFICACOES = [
  { value: "a", label: "Classe A (Alto valor)", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  { value: "b", label: "Classe B (Médio valor)", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { value: "c", label: "Classe C (Baixo valor)", color: "bg-green-500/10 text-green-500 border-green-500/20" },
] as const;

function toMeta(d: Draft): Record<string, string> {
  const m: Record<string, string> = {};
  for (const [k, v] of Object.entries(d)) {
    if (k === "codigo" || k === "nome") continue;
    if (typeof v === "string" && v) m[k] = v;
  }
  return m;
}

function fromRecord(r: ModuleRecord): Draft {
  return { ...empty, ...(r.meta as Partial<Draft>), codigo: r.name, nome: r.meta?.nome ?? "" };
}

function getCategoriaInfo(categoria: string) {
  return CATEGORIAS.find((c) => c.value === categoria) || CATEGORIAS[0];
}

function getClassificacaoInfo(classificacao: string) {
  return CLASSIFICACOES.find((c) => c.value === classificacao) || CLASSIFICACOES[2];
}

function Page() {
  const records = useStore((s) => s.records["estoque-industrial"]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ModuleHeader mod={mod} action={records.length > 0 && (
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      )} />

      <IndustrialAgent moduleKey="estoque-industrial" />
      {records.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-4">
            {records.map((r) => {
              const categoriaInfo = getCategoriaInfo(r.meta?.categoria ?? "materia-prima");
              const classificacaoInfo = getClassificacaoInfo(r.meta?.classificacao ?? "c");
              const saldo = parseFloat(r.meta?.saldo ?? "0");
              const saldoMinimo = parseFloat(r.meta?.saldoMinimo ?? "0");
              const estoqueBaixo = saldo <= saldoMinimo && saldoMinimo > 0;
              const CategoriaIcon = categoriaInfo.icon;

              return (
                <article key={r.id} className={cn("surface-elevated group flex flex-col rounded-xl p-5 transition hover:ring-1 hover:ring-primary/30", estoqueBaixo && "ring-1 ring-red-500/30")}>
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                        <CategoriaIcon className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-base font-semibold">{r.name}</h3>
                          {estoqueBaixo && <AlertTriangle className="size-4 text-red-500" />}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{r.meta?.nome ?? "Nome não definido"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("border", classificacaoInfo.color)}>
                      {classificacaoInfo.label}
                    </Badge>
                  </header>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <Mini label="Categoria" value={categoriaInfo.label} />
                    <Mini label="Unidade" value={r.meta?.unidade} />
                    <Mini label="Saldo Atual" value={`${r.meta?.saldo} ${r.meta?.unidade}`} color={estoqueBaixo ? "text-red-500" : undefined} />
                    <Mini label="Saldo Mínimo" value={`${r.meta?.saldoMinimo} ${r.meta?.unidade}`} />
                    <Mini label="Localização" value={r.meta?.localizacao} />
                    <Mini label="Fornecedor" value={r.meta?.fornecedor} />
                  </dl>

                  <footer className="mt-4 flex items-center justify-end gap-1 border-t border-border pt-3 opacity-60 transition group-hover:opacity-100">
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setEditing(r); setOpen(true); }}>
                      <Pencil className="size-3.5" /> Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => { if (confirm(`Remover "${r.name}"?`)) removeRecord("estoque-industrial", r.id); }}>
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
                <Factory className="size-3.5" /> Resumo de Estoque
              </div>
              <div className="mt-4 space-y-3">
                <StatCard label="Total de Itens" value={records.length} />
                <StatCard label="Estoque Baixo" value={records.filter(r => {
                  const saldo = parseFloat(r.meta?.saldo ?? "0");
                  const saldoMinimo = parseFloat(r.meta?.saldoMinimo ?? "0");
                  return saldo <= saldoMinimo && saldoMinimo > 0;
                }).length} color="text-red-500" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Package className="size-3.5" /> Por Categoria
              </div>
              <div className="mt-4 space-y-2">
                {CATEGORIAS.map((cat) => {
                  const count = records.filter(r => r.meta?.categoria === cat.value).length;
                  if (count === 0) return null;
                  const Icon = cat.icon;
                  return (
                    <div key={cat.value} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
                      <div className="flex items-center gap-2">
                        <div className="grid size-6 place-items-center rounded-md bg-primary/10 text-primary">
                          <Icon className="size-3" />
                        </div>
                        <span className="text-xs font-medium">{cat.label}</span>
                      </div>
                      <span className="font-mono text-xs font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="size-3.5" /> Classificação ABC
              </div>
              <div className="mt-4 space-y-2">
                {CLASSIFICACOES.map((cls) => {
                  const count = records.filter(r => r.meta?.classificacao === cls.value).length;
                  if (count === 0) return null;
                  return (
                    <div key={cls.value} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
                      <div className="flex items-center gap-2">
                        <div className={cn("size-3 rounded-full", cls.color.replace("/10", "").replace("border-", "bg-"))} />
                        <span className="text-xs font-medium">{cls.label}</span>
                      </div>
                      <span className="font-mono text-xs font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      )}
      <EstoqueWizard open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function Mini({ label, value, color }: { label: string; value?: string; color?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("truncate text-sm", !value && "italic text-muted-foreground/60", color)}>{value || "—"}</div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("font-mono text-lg font-semibold", color)}>{value}</div>
    </div>
  );
}

function EstoqueWizard({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: ModuleRecord | null }) {
  const [d, setD] = useState<Draft>(empty);
  
  useState(() => {
    if (open) {
      setD(editing ? fromRecord(editing) : empty);
    }
  });

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((s) => ({ ...s, [k]: v }));

  const canSave = d.codigo.trim().length > 0 && d.nome.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    const meta = toMeta(d);
    if (editing) updateRecord("estoque-industrial", editing.id, { name: d.codigo.trim(), meta });
    else addRecord("estoque-industrial", d.codigo.trim(), meta);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle>{editing ? "Editar Item de Estoque" : "Novo Item de Estoque"}</SheetTitle>
          <SheetDescription>Controle estoque de matéria-prima, semi-acabado, produto acabado e materiais auxiliares.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Código *</Label>
                <Input value={d.codigo} onChange={(e) => set("codigo", e.target.value)} placeholder="EST-001" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nome *</Label>
                <Input value={d.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Espuma D33" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Categoria</Label>
                <Select value={d.categoria} onValueChange={(v) => set("categoria", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Unidade</Label>
                <Input value={d.unidade} onChange={(e) => set("unidade", e.target.value)} placeholder="kg, m, un" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Saldo Atual</Label>
                <Input type="number" value={d.saldo} onChange={(e) => set("saldo", e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Saldo Mínimo</Label>
                <Input type="number" value={d.saldoMinimo} onChange={(e) => set("saldoMinimo", e.target.value)} placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Localização</Label>
                <Input value={d.localizacao} onChange={(e) => set("localizacao", e.target.value)} placeholder="Corredor A, Prateleira 1" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Fornecedor</Label>
                <Input value={d.fornecedor} onChange={(e) => set("fornecedor", e.target.value)} placeholder="Fornecedor ABC" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Classificação ABC</Label>
              <Select value={d.classificacao} onValueChange={(v) => set("classificacao", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSIFICACOES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Observações</Label>
              <Input value={d.observacoes} onChange={(e) => set("observacoes", e.target.value)} placeholder="Observações adicionais" />
            </div>
          </div>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={!canSave} className="gap-1.5">
            <Plus className="size-4" /> {editing ? "Salvar" : "Criar Item"}
          </Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
