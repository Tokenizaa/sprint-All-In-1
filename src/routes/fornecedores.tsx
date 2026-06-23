import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Truck, Trash2, Pencil, Clock, DollarSign, TrendingUp, Star, AlertTriangle, CheckCircle, XCircle, Package, Globe, Check } from "lucide-react";
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

const mod = MODULES.find((m) => m.key === "fornecedores")!;

export const Route = createFileRoute("/fornecedores")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Draft = {
  name: string; cnpj: string; contato: string; email: string;
  leadtime: string; condicao: string; avaliacao: string; categoria: string;
};
const empty: Draft = { name:"", cnpj:"", contato:"", email:"", leadtime:"", condicao:"", avaliacao:"", categoria:"" };

function Page() {
  const records = useStore((s) => s.records.fornecedores);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);

  const summary = records.reduce((acc, r) => {
    acc.total += 1;
    if (r.meta?.categoria === "Matéria-prima") acc.materiaPrima += 1;
    if (r.meta?.categoria === "Embalagem") acc.embalagem += 1;
    if (r.meta?.categoria === "Serviço") acc.servico += 1;
    return acc;
  }, { total: 0, materiaPrima: 0, embalagem: 0, servico: 0 });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ModuleHeader mod={mod} action={records.length > 0 && (
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      )} />

      <IndustrialAgent moduleKey="fornecedores" />
      {records.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {records.map((r) => {
              const avaliacao = Number(r.meta?.avaliacao) || 0;
              const isTopRated = avaliacao >= 4;
              return (
                <article key={r.id} className="surface-elevated group rounded-xl p-5 transition hover:ring-1 hover:ring-primary/30">
                  <header className="flex items-start gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <Truck className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-semibold">{r.name}</h3>
                          <p className="text-xs text-muted-foreground">{r.meta?.categoria ?? "—"} · CNPJ: {r.meta?.cnpj ?? "—"}</p>
                        </div>
                        <Badge variant={isTopRated ? "default" : "secondary"} className="shrink-0 text-[10px]">
                          {isTopRated ? "Top rated" : "Normal"}
                        </Badge>
                      </div>
                    </div>
                  </header>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Clock className="size-3" /> Lead Time
                      </div>
                      <div className="mt-1 text-sm font-semibold">{r.meta?.leadtime || "—"}</div>
                      <div className="text-[10px] text-muted-foreground">Contato: {r.meta?.contato || "—"}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <DollarSign className="size-3" /> Condição
                      </div>
                      <div className="mt-1 text-sm font-semibold">{r.meta?.condicao || "—"}</div>
                      <div className="text-[10px] text-muted-foreground">Email: {r.meta?.email || "—"}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Star className="size-3" /> Avaliação
                      </div>
                      <div className="mt-1 text-sm font-semibold">{avaliacao}/5</div>
                      <div className="flex gap-0.5 mt-1">
                        {[1,2,3,4,5].map((i) => (
                          <Star key={i} className={cn("size-3", i <= avaliacao ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <footer className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Package className="size-3.5" />
                        <span>{r.meta?.categoria || "Sem categoria"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
                      <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setEditing(r); setOpen(true); }}>
                        <Pencil className="size-3.5" /> Gerenciar
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => { if (confirm(`Remover "${r.name}"?`)) removeRecord("fornecedores", r.id); }}>
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
                <TrendingUp className="size-3.5" /> Resumo
              </div>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Total</div>
                    <div className="font-mono text-lg font-semibold">{summary.total}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Matéria-prima</div>
                    <div className="font-mono text-lg font-semibold text-blue-500">{summary.materiaPrima}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Embalagem</div>
                    <div className="font-mono text-lg font-semibold text-amber-500">{summary.embalagem}</div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/30 p-2">
                    <div className="text-muted-foreground">Serviço</div>
                    <div className="font-mono text-lg font-semibold text-purple-500">{summary.servico}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <AlertTriangle className="size-3.5" /> Fornecedores Críticos
              </div>
              <div className="mt-4 space-y-2">
                <CriticalSupplier name="Espumas Brasil" issue="Lead time acima do esperado" severity="high" />
                <CriticalSupplier name="Tecidos Sul" issue="Qualidade inconsistente" severity="medium" />
                <CriticalSupplier name="Molas Nacionais" issue="Atrasos frequentes" severity="low" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Star className="size-3.5" /> Top Fornecedores
              </div>
              <div className="mt-4 space-y-2">
                <TopSupplier name="Espumas Premium" rating={5} category="Matéria-prima" />
                <TopSupplier name="Tecidos Premium" rating={4.8} category="Matéria-prima" />
                <TopSupplier name="Logística Express" rating={4.5} category="Serviço" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Globe className="size-3.5" /> Lead Time Médio
              </div>
              <div className="mt-4 space-y-2">
                <LeadTimeBar category="Espumas" days={7} />
                <LeadTimeBar category="Tecidos" days={5} />
                <LeadTimeBar category="Molas" days={10} />
                <LeadTimeBar category="Embalagens" days={3} />
              </div>
            </div>
          </aside>
        </div>
      )}
      <FornecedorForm open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function CriticalSupplier({ name, issue, severity }: { name: string; issue: string; severity: "high" | "medium" | "low" }) {
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

function TopSupplier({ name, rating, category }: { name: string; rating: number; category: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 p-2.5">
      <div className="flex items-center gap-2">
        <div className="grid size-5 place-items-center rounded-md bg-primary/20 text-primary">
          <Star className="size-3 fill-yellow-400 text-yellow-400" />
        </div>
        <div>
          <div className="text-xs font-medium">{name}</div>
          <div className="text-[10px] text-muted-foreground">{category}</div>
        </div>
      </div>
      <div className="font-mono text-xs font-semibold text-primary">{rating}/5</div>
    </div>
  );
}

function LeadTimeBar({ category, days }: { category: string; days: number }) {
  const maxDays = 15;
  const percent = (days / maxDays) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-[10px] text-muted-foreground">{category}</div>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", days > 10 ? "bg-red-500" : days > 7 ? "bg-amber-500" : "bg-green-500")} style={{ width: `${percent}%` }} />
      </div>
      <div className="w-10 text-right font-mono text-xs">{days}d</div>
    </div>
  );
}

function FornecedorForm({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: ModuleRecord | null }) {
  const { data, setField, canSave, submit, reset, setData } = useModuleForm<Draft>({
    moduleKey: "fornecedores",
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
          cnpj: meta.cnpj || "",
          contato: meta.contato || "",
          email: meta.email || "",
          leadtime: meta.leadtime || "",
          condicao: meta.condicao || "",
          avaliacao: meta.avaliacao || "",
          categoria: meta.categoria || "",
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
          <SheetTitle>{editing ? "Editar fornecedor" : "Novo fornecedor"}</SheetTitle>
          <SheetDescription>Cadastre fornecedores, lead times, condições comerciais e avaliações.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome da empresa *</Label>
            <Input autoFocus value={data.name} onChange={(e) => setField("name", e.target.value)} placeholder="Ex.: Espumas Brasil Ltda" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">CNPJ</Label>
              <Input value={data.cnpj} onChange={(e) => setField("cnpj", e.target.value)} placeholder="00.000.000/0000-00" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Categoria</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={data.categoria} onChange={(e) => setField("categoria", e.target.value)}>
                <option value="">Selecione...</option>
                <option>Matéria-prima</option>
                <option>Embalagem</option>
                <option>Serviço</option>
                <option>Equipamentos</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Contato</Label>
              <Input value={data.contato} onChange={(e) => setField("contato", e.target.value)} placeholder="Nome do contato" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={data.email} onChange={(e) => setField("email", e.target.value)} placeholder="contato@empresa.com" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Lead Time (dias)</Label>
              <Input type="number" value={data.leadtime} onChange={(e) => setField("leadtime", e.target.value)} placeholder="Ex.: 7" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Condição de pagamento</Label>
              <Input value={data.condicao} onChange={(e) => setField("condicao", e.target.value)} placeholder="Ex.: 30/60/90" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Avaliação (1-5)</Label>
            <Input type="number" min="1" max="5" step="0.1" value={data.avaliacao} onChange={(e) => setField("avaliacao", e.target.value)} placeholder="Ex.: 4.5" />
          </div>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!canSave} className="gap-1.5"><Check className="size-4" /> {editing ? "Salvar" : "Criar fornecedor"}</Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
