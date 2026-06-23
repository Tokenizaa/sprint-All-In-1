import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ShoppingCart, Package, AlertTriangle, TrendingUp, CheckCircle2, Clock, DollarSign, Truck, FileText, BarChart3 } from "lucide-react";
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
import { useMRPListPurchaseOrders, useMRPCalculateRequirements, useMRPGeneratePurchaseOrders, useMRPUpdatePurchaseOrderStatus, useMRPOptimizeCosts } from "@/hooks/useMRPService";
import { useProductionOrderList } from "@/hooks/useProductionOrderService";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mrp")({
  head: () => ({ meta: [{ title: "MRP — Industrial OS" }, { name: "description", content: "Material Requirements Planning" }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type PurchaseOrderDraft = {
  supplierId: string;
  expectedDate: string;
  notes: string;
};

const emptyOrder: PurchaseOrderDraft = {
  supplierId: "",
  expectedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  notes: "",
};

function getStatusBadge(status: string) {
  switch (status) {
    case 'draft': return <Badge variant="secondary">Rascunho</Badge>;
    case 'submitted': return <Badge variant="default" className="bg-blue-500">Enviado</Badge>;
    case 'confirmed': return <Badge variant="default" className="bg-green-500">Confirmado</Badge>;
    case 'partial': return <Badge variant="default" className="bg-yellow-500">Parcial</Badge>;
    case 'received': return <Badge variant="default" className="bg-purple-500">Recebido</Badge>;
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

function Page() {
  const { loading, data: orders, execute: listOrders } = useMRPListPurchaseOrders();
  const { execute: calculateRequirements } = useMRPCalculateRequirements();
  const { execute: generatePurchaseOrders } = useMRPGeneratePurchaseOrders();
  const { execute: updateStatus } = useMRPUpdatePurchaseOrderStatus();
  const { execute: optimizeCosts } = useMRPOptimizeCosts();
  const { data: productionOrders } = useProductionOrderList();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PurchaseOrderDraft>(emptyOrder);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [optimization, setOptimization] = useState<any>(null);
  const [showRequirements, setShowRequirements] = useState(false);

  useState(() => {
    listOrders({});
  });

  const handleCalculateRequirements = async () => {
    if (!productionOrders || productionOrders.length === 0) {
      alert("Não há ordens de produção para calcular requisitos");
      return;
    }

    const orderIds = productionOrders.map((o: any) => o.id);
    const result = await calculateRequirements(orderIds);
    if (result.success) {
      setRequirements(result.data || []);
      setShowRequirements(true);
    }
  };

  const handleGeneratePurchaseOrders = async () => {
    if (requirements.length === 0) {
      alert("Calcule os requisitos primeiro");
      return;
    }

    const result = await generatePurchaseOrders(requirements);
    if (result.success) {
      alert(`${result.data.length} pedidos de compra gerados com sucesso`);
      setRequirements([]);
      setShowRequirements(false);
      listOrders({});
    }
  };

  const handleOptimizeCosts = async () => {
    if (requirements.length === 0) {
      alert("Calcule os requisitos primeiro");
      return;
    }

    const result = await optimizeCosts(requirements);
    if (result.success) {
      setOptimization(result.data);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateStatus({ id, status });
    listOrders({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">MRP - Material Requirements Planning</h1>
          <p className="text-muted-foreground">Calcule necessidades de materiais e gerencie pedidos de compra</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCalculateRequirements} className="gap-2">
            <Package className="w-4 h-4" /> Calcular Requisitos
          </Button>
          <Button variant="outline" onClick={handleGeneratePurchaseOrders} disabled={requirements.length === 0} className="gap-2">
            <ShoppingCart className="w-4 h-4" /> Gerar Pedidos
          </Button>
        </div>
      </div>

      {showRequirements && requirements.length > 0 && (
        <div className="surface-elevated rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Package className="size-3.5" /> Requisitos de Materiais
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleOptimizeCosts} className="gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Otimizar Custos
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowRequirements(false)} className="gap-1">
                Fechar
              </Button>
            </div>
          </div>

          {optimization && (
            <div className="mb-4 p-3 rounded-lg border border-border bg-green-500/10">
              <div className="flex items-center gap-2 text-sm font-medium text-green-500">
                <DollarSign className="w-4 h-4" />
                Economia Potencial: R$ {optimization.savings.toFixed(2)}
              </div>
              <ul className="mt-2 text-xs text-muted-foreground space-y-1">
                {optimization.recommendations.map((rec: string, i: number) => (
                  <li key={i}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            {requirements.map((req) => (
              <div key={req.materialId} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-md bg-primary/10">
                    <Package className="size-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{req.materialName}</div>
                    <div className="text-xs text-muted-foreground">SKU: {req.materialSku}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground">Estoque</div>
                    <div className="font-mono">{req.currentStock}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground">Necessário</div>
                    <div className="font-mono">{req.requiredQuantity}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground">Líquido</div>
                    <div className="font-mono text-red-500">{req.netRequirement}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground">Lead Time</div>
                    <div className="font-mono">{req.leadTime}d</div>
                  </div>
                  {getPriorityBadge(req.priority)}
                  {req.totalCost && (
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground">Custo</div>
                      <div className="font-mono">R$ {req.totalCost.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!orders || orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Nenhum pedido de compra"
          description="Calcule os requisitos de materiais baseados nas ordens de produção e gere pedidos de compra automaticamente."
          benefit="Evita paradas por falta de material, otimiza custos e garante que os insumos cheguem na hora certa."
          checklist={["Requisitos calculados", "Pedidos gerados", "Fornecedores selecionados", "Lead times considerados"]}
          primaryCta="Calcular Requisitos"
          onPrimary={() => { handleCalculateRequirements(); }}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="surface-elevated rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <ShoppingCart className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{order.orderNumber}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{order.supplierName}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Pedido: {new Date(order.orderDate).toLocaleDateString('pt-BR')}</span>
                      <span>Entrega: {new Date(order.expectedDate).toLocaleDateString('pt-BR')}</span>
                      <span className="font-mono font-semibold text-foreground">Total: R$ {order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {order.status === 'draft' && (
                    <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(order.id, 'submitted')} className="gap-1">
                      Enviar
                    </Button>
                  )}
                  {order.status === 'submitted' && (
                    <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(order.id, 'confirmed')} className="gap-1">
                      Confirmar
                    </Button>
                  )}
                  {order.status === 'confirmed' && (
                    <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(order.id, 'received')} className="gap-1">
                      Receber
                    </Button>
                  )}
                  {order.status !== 'received' && order.status !== 'cancelled' && (
                    <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(order.id, 'cancelled')} className="gap-1 text-destructive">
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Itens do Pedido</div>
                  <div className="space-y-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{item.material_name}</span>
                          <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono">{item.quantity} un</span>
                          <span className="font-mono">R$ {item.unit_cost.toFixed(2)}/un</span>
                          <span className="font-mono font-semibold">R$ {item.total_cost.toFixed(2)}</span>
                          {item.received_quantity > 0 && (
                            <span className="text-xs text-green-500">Recebido: {item.received_quantity}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <IndustrialAgent moduleKey="mrp" />
    </div>
  );
}
