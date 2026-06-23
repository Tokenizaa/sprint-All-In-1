import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ArrowUpDown, Pencil, Trash2, ArrowDown, ArrowUp, TrendingUp, Package, Factory, Clock, FileText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ModuleHeader } from "@/components/module-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IndustrialAgent } from "@/components/industrial-copilot";
import { MODULES } from "@/lib/modules";
import { addRecord, removeRecord, updateRecord, useStore, type ModuleRecord } from "@/lib/store";
import { cn } from "@/lib/utils";

const mod = MODULES.find((m) => m.key === "movimentacoes")!;

export const Route = createFileRoute("/movimentacoes")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Draft = {
  codigo: string;
  tipo: string;
  item: string;
  quantidade: string;
  unidade: string;
  data: string;
  origem: string;
  destino: string;
  documento: string;
  observacoes: string;
};

const empty: Draft = {
  codigo: "",
  tipo: "",
  item: "",
  quantidade: "",
  unidade: "",
  data: "",
  origem: "",
  destino: "",
  documento: "",
  observacoes: "",
};

const TIPOS_MOVIMENTACAO = [
  { value: "entrada", label: "Entrada", icon: ArrowDown, color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { value: "saida", label: "Saída", icon: ArrowUp, color: "bg-red-500/10 text-red-500 border-red-500/20" },
  { value: "consumo", label: "Consumo", icon: TrendingUp, color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { value: "producao", label: "Produção", icon: Factory, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "transferencia", label: "Transferência", icon: ArrowUpDown, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { value: "ajuste", label: "Ajuste", icon: Package, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { value: "perda", label: "Perda", icon: ArrowUp, color: "bg-red-500/10 text-red-500 border-red-500/20" },
  { value: "devolucao", label: "Devolução", icon: ArrowDown, color: "bg-green-500/10 text-green-500 border-green-500/20" },
] as const;

function toMeta(d: Draft): Record<string, string> {
  const m: Record<string, string> = {};
  for (const [k, v] of Object.entries(d)) {
    if (k === "codigo") continue;
    if (typeof v === "string" && v) m[k] = v;
  }
  return m;
}

function fromRecord(r: ModuleRecord): Draft {
  return { ...empty, ...(r.meta as Partial<Draft>), codigo: r.name };
}

function getTipoInfo(tipo: string) {
  return TIPOS_MOVIMENTACAO.find((t) => t.value === tipo) || TIPOS_MOVIMENTACAO[0];
}

function Page() {
  const records = useStore((s) => s.records.movimentacoes);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ModuleHeader mod={mod} action={records.length > 0 && (
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      )} />

      <IndustrialAgent moduleKey="movimentacoes" />
      {records.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {records.map((r) => {
              const tipoInfo = getTipoInfo(r.meta?.tipo ?? "entrada");
              const TipoIcon = tipoInfo.icon;
              return (
                <article key={r.id} className="surface-elevated group flex flex-col rounded-xl p-5 transition hover:ring-1 hover:ring-primary/30">
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={cn("grid size-11 shrink-0 place-items-center rounded-lg ring-1 ring-primary/20", tipoInfo.color)}>
                        <TipoIcon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold">{r.name}</h3>
                          <Badge variant="outline" className={cn("border", tipoInfo.color)}>
                            {tipoInfo.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{r.meta?.item ?? "Item não definido"}</p>
                      </div>
                    </div>
                  </header>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <Mini label="Quantidade" value={`${r.meta?.quantidade} ${r.meta?.unidade}`} />
                    <Mini label="Data" value={r.meta?.data} />
                    <Mini label="Origem" value={r.meta?.origem} />
                    <Mini label="Destino" value={r.meta?.destino} />
                    <Mini label="Documento" value={r.meta?.documento} />
                  </dl>

                  {r.meta?.observacoes && (
                    <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="size-3" />
                        <span className="line-clamp-2">{r.meta.observacoes}</span>
                      </div>
                    </div>
                  )}

                  <footer className="mt-4 flex items-center justify-end gap-1 border-t border-border pt-3 opacity-60 transition group-hover:opacity-100">
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setEditing(r); setOpen(true); }}>
                      <Pencil className="size-3.5" /> Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => { if (confirm(`Remover movimentação "${r.name}"?`)) removeRecord("movimentacoes", r.id); }}>
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
                <ArrowUpDown className="size-3.5" /> Resumo de Movimentações
              </div>
              <div className="mt-4 space-y-3">
                <StatCard label="Total de Movimentações" value={records.length} />
                <StatCard label="Entradas" value={records.filter(r => r.meta?.tipo === "entrada").length} color="text-green-500" />
                <StatCard label="Saídas" value={records.filter(r => r.meta?.tipo === "saida").length} color="text-red-500" />
                <StatCard label="Produções" value={records.filter(r => r.meta?.tipo === "producao").length} color="text-blue-500" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Clock className="size-3.5" /> Por Tipo
              </div>
              <div className="mt-4 space-y-2">
                {TIPOS_MOVIMENTACAO.map((tipo) => {
                  const count = records.filter(r => r.meta?.tipo === tipo.value).length;
                  if (count === 0) return null;
                  const Icon = tipo.icon;
                  return (
                    <div key={tipo.value} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
                      <div className="flex items-center gap-2">
                        <div className={cn("grid size-6 place-items-center rounded-md", tipo.color)}>
                          <Icon className="size-3" />
                        </div>
                        <span className="text-xs font-medium">{tipo.label}</span>
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
      <MovimentacaoWizard open={open} onOpenChange={setOpen} editing={editing} />
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

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("font-mono text-lg font-semibold", color)}>{value}</div>
    </div>
  );
}

function MovimentacaoWizard({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: ModuleRecord | null }) {
  const [d, setD] = useState<Draft>(empty);
  
  useState(() => {
    if (open) {
      setD(editing ? fromRecord(editing) : { ...empty, codigo: `MOV-${Date.now()}`, data: new Date().toISOString().split('T')[0] });
    }
  });

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((s) => ({ ...s, [k]: v }));

  const canSave = d.codigo.trim().length > 0 && d.tipo.trim().length > 0 && d.item.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    const meta = toMeta(d);
    if (editing) updateRecord("movimentacoes", editing.id, { name: d.codigo.trim(), meta });
    else addRecord("movimentacoes", d.codigo.trim(), meta);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle>{editing ? "Editar Movimentação" : "Nova Movimentação"}</SheetTitle>
          <SheetDescription>Registre entradas, saídas, consumos, produções e transferências de estoque.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Código *</Label>
                <Input value={d.codigo} onChange={(e) => set("codigo", e.target.value)} placeholder="MOV-001" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo *</Label>
                <Select value={d.tipo} onValueChange={(v) => set("tipo", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_MOVIMENTACAO.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Item *</Label>
              <Input value={d.item} onChange={(e) => set("item", e.target.value)} placeholder="Espuma D33" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Quantidade</Label>
                <Input type="number" value={d.quantidade} onChange={(e) => set("quantidade", e.target.value)} placeholder="100" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Unidade</Label>
                <Input value={d.unidade} onChange={(e) => set("unidade", e.target.value)} placeholder="kg, m, un" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data</Label>
              <Input type="date" value={d.data} onChange={(e) => set("data", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Origem</Label>
                <Input value={d.origem} onChange={(e) => set("origem", e.target.value)} placeholder="Fornecedor, Estoque..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Destino</Label>
                <Input value={d.destino} onChange={(e) => set("destino", e.target.value)} placeholder="Linha, Cliente..." />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Documento</Label>
              <Input value={d.documento} onChange={(e) => set("documento", e.target.value)} placeholder="NF-001, OP-0001..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Observações</Label>
              <Textarea value={d.observacoes} onChange={(e) => set("observacoes", e.target.value)} placeholder="Observações adicionais..." rows={2} />
            </div>
          </div>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={!canSave} className="gap-1.5">
            <Plus className="size-4" /> {editing ? "Salvar" : "Registrar"}
          </Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
