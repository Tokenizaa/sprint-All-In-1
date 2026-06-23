import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, ClipboardList, Pencil, Trash2, Calendar, User, AlertCircle, CheckCircle2, Clock, PauseCircle, XCircle, FileText, Check, Loader2, Play, StopCircle, CheckSquare } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useProductionOrderList, useProductionOrderCreate, useProductionOrderUpdate, useProductionOrderDelete, useProductionOrderRelease, useProductionOrderStart, useProductionOrderComplete } from "@/hooks/useProductionOrderService";
import { useProductionWorkflow, useStartProduction, useCompleteProduction, useWorkflowStatus } from "@/hooks/useProductionWorkflowService";
import type { ProductionOrder } from "@/services/ProductionOrderService";

const mod = MODULES.find((m) => m.key === "ordens-producao")!;

export const Route = createFileRoute("/ordens-producao")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

const STATUS_OPTIONS = [
  { value: "planejada", label: "Planejada", icon: Clock, color: "bg-blue-500/10 text-blue-500" },
  { value: "liberada", label: "Liberada", icon: CheckCircle2, color: "bg-green-500/10 text-green-500" },
  { value: "em_producao", label: "Em Produção", icon: AlertCircle, color: "bg-yellow-500/10 text-yellow-500" },
  { value: "pausada", label: "Pausada", icon: PauseCircle, color: "bg-orange-500/10 text-orange-500" },
  { value: "finalizada", label: "Finalizada", icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-500" },
  { value: "cancelada", label: "Cancelada", icon: XCircle, color: "bg-red-500/10 text-red-500" },
] as const;

const PRIORIDADE_OPTIONS = [
  { value: "baixa", label: "Baixa" },
  { value: "normal", label: "Normal" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
] as const;

function getStatusInfo(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
}

function getPrioridadeColor(prioridade: string) {
  switch (prioridade) {
    case "urgente": return "bg-red-500/10 text-red-500 border-red-500/20";
    case "alta": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "normal": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "baixa": return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
}

function Page() {
  const { loading, data: orders, execute: listOrders } = useProductionOrderList();
  const { execute: deleteOrder } = useProductionOrderDelete();
  const { execute: releaseOrder } = useProductionOrderRelease();
  const { execute: startOrder } = useProductionOrderStart();
  const { execute: completeOrder } = useProductionOrderComplete();
  
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductionOrder | null>(null);

  useEffect(() => {
    listOrders({});
  }, [listOrders]);

  const handleDelete = async (id: string, orderNumber: string) => {
    if (confirm(`Remover OP "${orderNumber}"?`)) {
      await deleteOrder(id);
      listOrders({});
    }
  };

  const handleRelease = async (id: string) => {
    await releaseOrder(id);
    listOrders({});
  };

  const handleStart = async (id: string) => {
    await startOrder(id);
    listOrders({});
  };

  const handleComplete = async (id: string) => {
    await completeOrder(id);
    listOrders({});
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ModuleHeader mod={mod} action={orders && orders.length > 0 && (
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      )} />

      <IndustrialAgent moduleKey="ordens-producao" />
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : !orders || orders.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-4">
            {orders.map((r) => {
              const statusInfo = getStatusInfo(r.status);
              const StatusIcon = statusInfo.icon;
              return (
                <article key={r.id} className="surface-elevated group flex flex-col rounded-xl p-5 transition hover:ring-1 hover:ring-primary/30">
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={cn("grid size-11 shrink-0 place-items-center rounded-lg ring-1 ring-primary/20", statusInfo.color)}>
                        <StatusIcon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold">{r.numero}</h3>
                        <p className="text-xs text-muted-foreground">{r.produto || "Produto não definido"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("border", getPrioridadeColor(r.prioridade))}>
                      {r.prioridade}
                    </Badge>
                  </header>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <Mini label="Quantidade" value={String(r.quantidade)} />
                    <Mini label="Início" value={r.data_inicio ? new Date(r.data_inicio).toLocaleDateString('pt-BR') : "—"} />
                    <Mini label="Previsão" value={r.data_previsao ? new Date(r.data_previsao).toLocaleDateString('pt-BR') : "—"} />
                    <Mini label="Conclusão" value={r.data_conclusao ? new Date(r.data_conclusao).toLocaleDateString('pt-BR') : "—"} />
                  </dl>

                  {r.observacoes && (
                    <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="size-3" />
                        <span className="line-clamp-2">{r.observacoes}</span>
                      </div>
                    </div>
                  )}

                  <footer className="mt-4 flex items-center justify-end gap-1 border-t border-border pt-3 opacity-60 transition group-hover:opacity-100">
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { setEditing(r); setOpen(true); }}>
                      <Pencil className="size-3.5" /> Editar
                    </Button>
                    {r.status === 'planejada' && (
                      <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => handleRelease(r.id)}>
                        <CheckCircle2 className="size-3.5" /> Liberar
                      </Button>
                    )}
                    {r.status === 'liberada' && (
                      <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => handleStart(r.id)}>
                        <Clock className="size-3.5" /> Iniciar
                      </Button>
                    )}
                    {r.status === 'em_producao' && (
                      <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => handleComplete(r.id)}>
                        <Check className="size-3.5" /> Completar
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(r.id, r.numero)}>
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
                <ClipboardList className="size-3.5" /> Resumo de OPs
              </div>
              <div className="mt-4 space-y-3">
                <StatCard label="Total de OPs" value={orders.length} />
                <StatCard label="Em Produção" value={orders.filter(r => r.status === "in_progress").length} color="text-yellow-500" />
                <StatCard label="Finalizadas" value={orders.filter(r => r.status === "completed").length} color="text-emerald-500" />
                <StatCard label="Atrasadas" value={orders.filter(r => {
                  const dueDate = r.due_date;
                  if (!dueDate) return false;
                  const hoje = new Date().toISOString().split('T')[0];
                  return dueDate < hoje && r.status !== "completed" && r.status !== "cancelled";
                }).length} color="text-red-500" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <AlertCircle className="size-3.5" /> Status por OP
              </div>
              <div className="mt-4 space-y-2">
                {STATUS_OPTIONS.map((status) => {
                  const count = orders.filter(r => r.status === status.value).length;
                  if (count === 0) return null;
                  const Icon = status.icon;
                  return (
                    <div key={status.value} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
                      <div className="flex items-center gap-2">
                        <div className={cn("grid size-6 place-items-center rounded-md", status.color)}>
                          <Icon className="size-3" />
                        </div>
                        <span className="text-xs font-medium">{status.label}</span>
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
      <OPWizard open={open} onOpenChange={setOpen} editing={editing} onRefresh={() => listOrders({})} />
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

function OPWizard({ open, onOpenChange, editing, onRefresh }: { open: boolean; onOpenChange: (o: boolean) => void; editing: ProductionOrder | null; onRefresh: () => void }) {
  const { execute: createOrder, loading: creating } = useProductionOrderCreate();
  const { execute: updateOrder, loading: updating } = useProductionOrderUpdate();
  const { execute: executeWorkflow, loading: workflowLoading } = useProductionWorkflow();

  const [d, setD] = useState({
    product_id: editing?.product_id || "",
    quantity: editing?.quantity || 0,
    priority: editing?.priority || "medium",
    start_date: editing?.start_date || "",
    due_date: editing?.due_date || "",
    notes: editing?.notes || "",
    auto_release: false,
    auto_lot: false,
  });

  useEffect(() => {
    if (open) {
      setD({
        product_id: editing?.product_id || "",
        quantity: editing?.quantity || 0,
        priority: editing?.priority || "medium",
        start_date: editing?.start_date || "",
        due_date: editing?.due_date || "",
        notes: editing?.notes || "",
        auto_release: false,
        auto_lot: false,
      });
    }
  }, [open, editing]);

  const set = <K extends keyof typeof d>(k: K, v: typeof d[K]) => setD((s) => ({ ...s, [k]: v }));

  const canSave = d.product_id.trim().length > 0 && d.quantity > 0;
  const save = async () => {
    if (!canSave) return;
    
    if (editing) {
      const result = await updateOrder({ id: editing.id, input: d });
      if (result.success) {
        onRefresh();
        onOpenChange(false);
      }
    } else {
      // Usar workflow se auto_release ou auto_lot estiver ativado
      if (d.auto_release || d.auto_lot) {
        const result = await executeWorkflow(d);
        if (result.success) {
          onRefresh();
          onOpenChange(false);
        }
      } else {
        const result = await createOrder(d);
        if (result.success) {
          onRefresh();
          onOpenChange(false);
        }
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle>{editing ? "Editar Ordem de Produção" : "Nova Ordem de Produção"}</SheetTitle>
          <SheetDescription>Crie e gerencie ordens de produção com status, prioridade e datas.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">ID do Produto *</Label>
              <Input value={d.product_id} onChange={(e) => set("product_id", e.target.value)} placeholder="UUID do produto" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Quantidade *</Label>
              <Input type="number" value={d.quantity} onChange={(e) => set("quantity", parseInt(e.target.value) || 0)} placeholder="100" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Prioridade</Label>
              <Select value={d.priority} onValueChange={(v: any) => set("priority", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADE_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Data de Início</Label>
                <Input type="date" value={d.start_date} onChange={(e) => set("start_date", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Previsão</Label>
                <Input type="date" value={d.due_date} onChange={(e) => set("due_date", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Observações</Label>
              <Textarea value={d.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Observações adicionais..." rows={3} />
            </div>
            {!editing && (
              <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <CheckSquare className="size-4" /> Opções de Workflow
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={d.auto_release}
                      onChange={(e) => set("auto_release", e.target.checked)}
                      className="size-4 rounded border-border"
                    />
                    <span className="text-sm">Liberar automaticamente após criação</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={d.auto_lot}
                      onChange={(e) => set("auto_lot", e.target.checked)}
                      className="size-4 rounded border-border"
                    />
                    <span className="text-sm">Gerar lote automaticamente</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={!canSave || creating || updating || workflowLoading} className="gap-1.5">
            {creating || updating || workflowLoading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {editing ? "Salvar" : "Criar OP"}
          </Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
