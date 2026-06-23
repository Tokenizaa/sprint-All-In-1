import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, PackageSearch, Pencil, Trash2, Calendar, Users, Wrench, Link2, QrCode } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ModuleHeader } from "@/components/module-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { IndustrialAgent } from "@/components/industrial-copilot";
import { MODULES } from "@/lib/modules";
import { addRecord, removeRecord, updateRecord, useStore, type ModuleRecord } from "@/lib/store";
import { cn } from "@/lib/utils";

const mod = MODULES.find((m) => m.key === "lotes")!;

export const Route = createFileRoute("/lotes")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Draft = {
  codigo: string;
  produto: string;
  quantidade: string;
  dataFabricacao: string;
  dataValidade: string;
  opOrigem: string;
  operadores: string;
  equipamentos: string;
  materiasPrimas: string;
  observacoes: string;
};

const empty: Draft = {
  codigo: "",
  produto: "",
  quantidade: "",
  dataFabricacao: "",
  dataValidade: "",
  opOrigem: "",
  operadores: "",
  equipamentos: "",
  materiasPrimas: "",
  observacoes: "",
};

function toMeta(d: Draft): Record<string, string> {
  const m: Record<string, string> = {};
  for (const [k, v] of Object.entries(d)) {
    if (k === "codigo" || k === "produto") continue;
    if (typeof v === "string" && v) m[k] = v;
  }
  return m;
}

function fromRecord(r: ModuleRecord): Draft {
  return { ...empty, ...(r.meta as Partial<Draft>), codigo: r.name, produto: r.meta?.produto ?? "" };
}

function Page() {
  const records = useStore((s) => s.records.lotes);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ModuleHeader mod={mod} action={records.length > 0 && (
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      )} />

      <IndustrialAgent moduleKey="lotes" />
      {records.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {records.map((r) => (
              <article key={r.id} className="surface-elevated group flex flex-col rounded-xl p-5 transition hover:ring-1 hover:ring-primary/30">
                <header className="flex items-start gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <PackageSearch className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold">{r.name}</h3>
                    <p className="truncate text-xs text-muted-foreground">{r.meta?.produto ?? "Produto não definido"}</p>
                  </div>
                </header>

                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <Mini label="Quantidade" value={r.meta?.quantidade} />
                  <Mini label="OP Origem" value={r.meta?.opOrigem} />
                  <Mini label="Fabricação" value={r.meta?.dataFabricacao} />
                  <Mini label="Validade" value={r.meta?.dataValidade} />
                </dl>

                {(r.meta?.operadores || r.meta?.equipamentos) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.meta?.operadores && (
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <Users className="size-3" /> {r.meta.operadores}
                      </Badge>
                    )}
                    {r.meta?.equipamentos && (
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <Wrench className="size-3" /> {r.meta.equipamentos}
                      </Badge>
                    )}
                  </div>
                )}

                <footer className="mt-4 flex items-center justify-end gap-1 border-t border-border pt-3 opacity-60 transition group-hover:opacity-100">
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setEditing(r); setOpen(true); }}>
                    <Pencil className="size-3.5" /> Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                    onClick={() => { if (confirm(`Remover lote "${r.name}"?`)) removeRecord("lotes", r.id); }}>
                    <Trash2 className="size-3.5" /> Remover
                  </Button>
                </footer>
              </article>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <PackageSearch className="size-3.5" /> Resumo de Lotes
              </div>
              <div className="mt-4 space-y-3">
                <StatCard label="Total de Lotes" value={records.length} />
                <StatCard label="Com OP Vinculada" value={records.filter(r => r.meta?.opOrigem).length} color="text-blue-500" />
                <StatCard label="Com Validade" value={records.filter(r => r.meta?.dataValidade).length} color="text-emerald-500" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <QrCode className="size-3.5" /> Rastreabilidade
              </div>
              <div className="mt-4 space-y-2">
                <TraceItem label="Produto" icon={PackageSearch} count={records.filter(r => r.meta?.produto).length} />
                <TraceItem label="OP de Origem" icon={Link2} count={records.filter(r => r.meta?.opOrigem).length} />
                <TraceItem label="Operadores" icon={Users} count={records.filter(r => r.meta?.operadores).length} />
                <TraceItem label="Equipamentos" icon={Wrench} count={records.filter(r => r.meta?.equipamentos).length} />
                <TraceItem label="Matérias-Primas" icon={PackageSearch} count={records.filter(r => r.meta?.materiasPrimas).length} />
              </div>
            </div>
          </aside>
        </div>
      )}
      <LoteWizard open={open} onOpenChange={setOpen} editing={editing} />
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

function TraceItem({ label, icon: Icon, count }: { label: string; icon: any; count: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
      <div className="flex items-center gap-2">
        <div className="grid size-6 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-3" />
        </div>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="font-mono text-xs font-semibold">{count}</span>
    </div>
  );
}

function LoteWizard({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: ModuleRecord | null }) {
  const [d, setD] = useState<Draft>(empty);
  
  useState(() => {
    if (open) {
      setD(editing ? fromRecord(editing) : empty);
    }
  });

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((s) => ({ ...s, [k]: v }));

  const canSave = d.codigo.trim().length > 0 && d.produto.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    const meta = toMeta(d);
    if (editing) updateRecord("lotes", editing.id, { name: d.codigo.trim(), meta });
    else addRecord("lotes", d.codigo.trim(), meta);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle>{editing ? "Editar Lote" : "Novo Lote"}</SheetTitle>
          <SheetDescription>Rastreie lotes de produção com matérias-primas, operadores e equipamentos.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Código do Lote *</Label>
              <Input value={d.codigo} onChange={(e) => set("codigo", e.target.value)} placeholder="L-2024-001" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Produto *</Label>
              <Input value={d.produto} onChange={(e) => set("produto", e.target.value)} placeholder="Colchão Premium King" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Quantidade</Label>
                <Input type="number" value={d.quantidade} onChange={(e) => set("quantidade", e.target.value)} placeholder="100" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">OP de Origem</Label>
                <Input value={d.opOrigem} onChange={(e) => set("opOrigem", e.target.value)} placeholder="OP-0001" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Data de Fabricação</Label>
                <Input type="date" value={d.dataFabricacao} onChange={(e) => set("dataFabricacao", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Data de Validade</Label>
                <Input type="date" value={d.dataValidade} onChange={(e) => set("dataValidade", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Operadores</Label>
              <Input value={d.operadores} onChange={(e) => set("operadores", e.target.value)} placeholder="João Silva, Maria Santos" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Equipamentos Utilizados</Label>
              <Input value={d.equipamentos} onChange={(e) => set("equipamentos", e.target.value)} placeholder="Corte-01, Montagem-02" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Matérias-Primas Utilizadas</Label>
              <Textarea value={d.materiasPrimas} onChange={(e) => set("materiasPrimas", e.target.value)} placeholder="Espuma D33, Tecido Algodão, Cola PU..." rows={2} />
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
            <Plus className="size-4" /> {editing ? "Salvar" : "Criar Lote"}
          </Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
