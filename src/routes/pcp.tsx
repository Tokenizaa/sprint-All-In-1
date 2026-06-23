import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Calendar, Clock, AlertTriangle, CheckCircle2, PlayCircle, PauseCircle, XCircle, TrendingUp, BarChart3, Settings, FileText } from "lucide-react";
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
import { usePCPListPlans, usePCPCreatePlan, usePCPUpdatePlan, usePCPDeletePlan, usePCPListPlanItems, usePCPApprovePlan, usePCPActivatePlan, usePCPCompletePlan, usePCPCancelPlan, usePCPGenerateAutoPlan, usePCPCalculateCapacity, usePCPIdentifyBottlenecks } from "@/hooks/usePCPService";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pcp")({
  head: () => ({ meta: [{ title: "PCP — Industrial OS" }, { name: "description", content: "Planejamento e Controle de Produção" }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type PlanDraft = {
  name: string;
  start_date: string;
  end_date: string;
  notes: string;
};

const emptyPlan: PlanDraft = {
  name: "",
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  notes: "",
};

function getStatusBadge(status: string) {
  switch (status) {
    case 'draft': return <Badge variant="secondary">Rascunho</Badge>;
    case 'approved': return <Badge variant="default" className="bg-blue-500">Aprovado</Badge>;
    case 'active': return <Badge variant="default" className="bg-green-500">Ativo</Badge>;
    case 'completed': return <Badge variant="default" className="bg-purple-500">Concluído</Badge>;
    case 'cancelled': return <Badge variant="destructive">Cancelado</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'low': return <Badge variant="outline" className="border-green-500 text-green-500">Baixa</Badge>;
    case 'medium': return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Média</Badge>;
    case 'high': return <Badge variant="outline" className="border-orange-500 text-orange-500">Alta</Badge>;
    case 'urgent': return <Badge variant="destructive">Urgente</Badge>;
    default: return <Badge variant="outline">{priority}</Badge>;
  }
}

function getItemStatusBadge(status: string) {
  switch (status) {
    case 'pending': return <Badge variant="secondary">Pendente</Badge>;
    case 'scheduled': return <Badge variant="default" className="bg-blue-500">Agendado</Badge>;
    case 'in_progress': return <Badge variant="default" className="bg-green-500">Em Andamento</Badge>;
    case 'completed': return <Badge variant="default" className="bg-purple-500">Concluído</Badge>;
    case 'delayed': return <Badge variant="destructive">Atrasado</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

function Page() {
  const { loading, data: plans, execute: listPlans } = usePCPListPlans();
  const { execute: createPlan } = usePCPCreatePlan();
  const { execute: updatePlan } = usePCPUpdatePlan();
  const { execute: deletePlan } = usePCPDeletePlan();
  const { execute: listPlanItems } = usePCPListPlanItems();
  const { execute: approvePlan } = usePCPApprovePlan();
  const { execute: activatePlan } = usePCPActivatePlan();
  const { execute: completePlan } = usePCPCompletePlan();
  const { execute: cancelPlan } = usePCPCancelPlan();
  const { execute: generateAutoPlan } = usePCPGenerateAutoPlan();
  const { execute: calculateCapacity } = usePCPCalculateCapacity();
  const { execute: identifyBottlenecks } = usePCPIdentifyBottlenecks();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [draft, setDraft] = useState<PlanDraft>(emptyPlan);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [planItems, setPlanItems] = useState<any[]>([]);
  const [capacity, setCapacity] = useState<any>(null);
  const [bottlenecks, setBottlenecks] = useState<any[]>([]);

  useState(() => {
    listPlans({});
  });

  const handleSave = async () => {
    if (!draft.name || !draft.start_date || !draft.end_date) return;

    if (editing) {
      await updatePlan({ id: editing.id, input: draft });
    } else {
      await createPlan(draft);
    }

    setOpen(false);
    setEditing(null);
    setDraft(emptyPlan);
    listPlans({});
  };

  const handleEdit = (plan: any) => {
    setDraft({
      name: plan.name,
      start_date: plan.start_date,
      end_date: plan.end_date,
      notes: plan.notes || "",
    });
    setEditing(plan);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este plano?")) {
      await deletePlan(id);
      listPlans({});
    }
  };

  const handleSelectPlan = async (plan: any) => {
    setSelectedPlan(plan);
    const itemsResult = await listPlanItems(plan.id);
    if (itemsResult.success) {
      setPlanItems(itemsResult.data || []);
    }

    const capacityResult = await calculateCapacity({ startDate: plan.start_date, endDate: plan.end_date });
    if (capacityResult.success) {
      setCapacity(capacityResult.data);
    }

    const bottlenecksResult = await identifyBottlenecks(plan.id);
    if (bottlenecksResult.success) {
      setBottlenecks(bottlenecksResult.data || []);
    }
  };

  const handleApprove = async (id: string) => {
    await approvePlan(id);
    listPlans({});
  };

  const handleActivate = async (id: string) => {
    await activatePlan(id);
    listPlans({});
  };

  const handleComplete = async (id: string) => {
    await completePlan(id);
    listPlans({});
  };

  const handleCancel = async (id: string) => {
    await cancelPlan(id);
    listPlans({});
  };

  const handleGenerateAutoPlan = async () => {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await generateAutoPlan({ startDate, endDate, options: { includeBacklog: true } });
    listPlans({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PCP - Planejamento e Controle de Produção</h1>
          <p className="text-muted-foreground">Gerencie planos de produção, capacidade e gargalos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateAutoPlan} className="gap-2">
            <TrendingUp className="w-4 h-4" /> Gerar Plano Automático
          </Button>
          <Button onClick={() => { setEditing(null); setDraft(emptyPlan); setOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Novo Plano
          </Button>
        </div>
      </div>

      {!plans || plans.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Nenhum plano de produção"
          description="Crie planos de produção para organizar e otimizar a fabricação."
          benefit="Melhora a utilização da capacidade, reduz atrasos e identifica gargalos antes que afetem a produção."
          checklist={["Plano de produção criado", "Ordens de produção agendadas", "Capacidade calculada", "Gargalos identificados"]}
          primaryCta="Criar primeiro plano"
          onPrimary={() => { setEditing(null); setDraft(emptyPlan); setOpen(true); }}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "surface-elevated rounded-xl p-5 cursor-pointer transition hover:ring-1 hover:ring-primary/30",
                  selectedPlan?.id === plan.id && "ring-1 ring-primary"
                )}
                onClick={() => handleSelectPlan(plan)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <Calendar className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{plan.name}</h3>
                        {getStatusBadge(plan.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(plan.start_date).toLocaleDateString('pt-BR')} - {new Date(plan.end_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {plan.status === 'draft' && (
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleApprove(plan.id); }} className="gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                      </Button>
                    )}
                    {plan.status === 'approved' && (
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleActivate(plan.id); }} className="gap-1">
                        <PlayCircle className="w-3.5 h-3.5" /> Ativar
                      </Button>
                    )}
                    {plan.status === 'active' && (
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleComplete(plan.id); }} className="gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Concluir
                      </Button>
                    )}
                    {plan.status !== 'completed' && plan.status !== 'cancelled' && (
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleCancel(plan.id); }} className="gap-1 text-destructive">
                        <XCircle className="w-3.5 h-3.5" /> Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedPlan && (
            <div className="space-y-4">
              <div className="surface-elevated rounded-xl p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-4">
                  <BarChart3 className="size-3.5" /> Capacidade
                </div>
                {capacity ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Capacidade Total</span>
                      <span className="font-mono text-sm font-semibold">{capacity.totalCapacity}h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Capacidade Usada</span>
                      <span className="font-mono text-sm font-semibold">{capacity.usedCapacity.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Disponível</span>
                      <span className="font-mono text-sm font-semibold text-green-500">{capacity.availableCapacity.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Utilização</span>
                      <span className="font-mono text-sm font-semibold">{capacity.utilizationRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(capacity.utilizationRate, 100)}%` }} />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Carregando capacidade...</p>
                )}
              </div>

              <div className="surface-elevated rounded-xl p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-4">
                  <AlertTriangle className="size-3.5" /> Gargalos
                </div>
                {bottlenecks.length > 0 ? (
                  <div className="space-y-2">
                    {bottlenecks.map((bottleneck) => (
                      <div key={bottleneck.itemId} className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-2.5">
                        <div className={cn(
                          "size-2 rounded-full mt-1.5",
                          bottleneck.severity === 'high' ? "bg-red-500" : bottleneck.severity === 'medium' ? "bg-yellow-500" : "bg-green-500"
                        )} />
                        <div className="flex-1">
                          <div className="text-xs font-medium">{bottleneck.itemName}</div>
                          <div className="text-[10px] text-muted-foreground">{bottleneck.bottleneckType}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum gargalo identificado</p>
                )}
              </div>

              <div className="surface-elevated rounded-xl p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-4">
                  <FileText className="size-3.5" /> Itens do Plano
                </div>
                {planItems.length > 0 ? (
                  <div className="space-y-2">
                    {planItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">#{item.sequence}</span>
                          <span className="text-xs">{(item as any).production_orders?.order_number || 'OP'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(item.priority)}
                          {getItemStatusBadge(item.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum item no plano</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? "Editar Plano" : "Novo Plano de Produção"}</SheetTitle>
            <SheetDescription>
              Defina o período e observações para o plano de produção.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Ex: Plano Semanal - Semana 25"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Início *</Label>
                <Input
                  type="date"
                  value={draft.start_date}
                  onChange={(e) => setDraft({ ...draft, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Fim *</Label>
                <Input
                  type="date"
                  value={draft.end_date}
                  onChange={(e) => setDraft({ ...draft, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="Detalhes adicionais sobre o plano..."
                rows={3}
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              {editing ? "Atualizar Plano" : "Criar Plano"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <IndustrialAgent moduleKey="pcp" />
    </div>
  );
}
