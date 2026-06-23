import { useState, useEffect } from "react";
import { useProductionOrderList } from "@/hooks/useProductionOrderService";
import { ProductionTimer } from "@/components/production-timer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Play, Pause, AlertTriangle, CheckCircle2, Clock, Factory, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductionFloor() {
  const { data: orders, execute: listOrders } = useProductionOrderList();
  const { data: activeAppointments, execute: listAppointments } = useActiveAppointments();
  const { data: activeDowntimes, execute: listDowntimes } = useActiveDowntimes();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    listOrders({ status: 'in_progress' });
    listAppointments();
    listDowntimes();
  }, [listOrders, listAppointments, listDowntimes]);

  const activeOrders = orders?.filter(o => o.status === 'in_progress') || [];
  const hasActiveProduction = activeOrders.length > 0 || (activeAppointments && activeAppointments.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <Factory className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Chão de Fábrica</h1>
            <p className="text-sm text-muted-foreground">Monitoramento de produção em tempo real</p>
          </div>
        </div>
        {hasActiveProduction && (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <div className="size-2 rounded-full bg-green-500 animate-pulse" />
            Produção ativa
          </div>
        )}
      </div>

      {!hasActiveProduction ? (
        <Card className="p-12 text-center">
          <Factory className="size-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma produção ativa</h3>
          <p className="text-muted-foreground mb-6">
            Não há ordens de produção em andamento no momento.
          </p>
          <Button onClick={() => window.location.href = '/ordens-producao'}>
            <Play className="size-4 mr-2" /> Iniciar Produção
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Active Orders */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <Clock className="size-4" /> Ordens Ativas
            </div>
            {activeOrders.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                Nenhuma ordem em andamento
              </Card>
            ) : (
              activeOrders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{order.order_number}</h3>
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          Em Produção
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {(order as any).products?.name || 'Produto não definido'}
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Quantidade</div>
                          <div className="font-semibold">{order.quantity}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Início</div>
                          <div className="font-semibold">
                            {order.start_date ? new Date(order.start_date).toLocaleDateString('pt-BR') : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Previsão</div>
                          <div className="font-semibold">
                            {order.due_date ? new Date(order.due_date).toLocaleDateString('pt-BR') : '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order.id)}
                      className={cn(selectedOrder === order.id && "bg-primary text-primary-foreground")}
                    >
                      {selectedOrder === order.id ? <Pause className="size-4" /> : <Play className="size-4" />}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Active Downtimes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <AlertTriangle className="size-4" /> Paradas Ativas
            </div>
            {!activeDowntimes || activeDowntimes.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                Nenhuma parada ativa
              </Card>
            ) : (
              <div className="space-y-3">
                {activeDowntimes.map((downtime: any) => (
                  <Card key={downtime.id} className="p-4 border-red-500/20 bg-red-500/5">
                    <div className="flex items-start gap-3">
                      <div className="grid size-8 place-items-center rounded-lg bg-red-500/10 ring-1 ring-red-500/20">
                        <AlertTriangle className="size-4 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-red-500">
                          {downtime.downtime_type}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {(downtime as any).equipment?.name || 'Equipamento não definido'}
                        </div>
                        {downtime.reason && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {downtime.reason}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(downtime.start_time).toLocaleTimeString('pt-BR')}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                <Settings className="size-4" /> Ações Rápidas
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <AlertTriangle className="size-4 mr-2" /> Registrar Parada
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <CheckCircle2 className="size-4 mr-2" /> Registrar Qualidade
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Factory className="size-4 mr-2" /> Ver Ordens
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Timer Panel */}
      {selectedOrder && (
        <div className="fixed bottom-0 right-0 left-0 p-4 bg-background border-t border-border lg:static lg:p-0 lg:border-0 lg:bg-transparent">
          <Card className="max-w-md mx-auto lg:max-w-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="size-4" />
                <span className="font-semibold">Timer de Produção</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                Fechar
              </Button>
            </div>
            <div className="p-4">
              <ProductionTimer
                orderId={selectedOrder}
                onStart={() => console.log('Iniciado')}
                onPause={() => console.log('Pausado')}
                onStop={(data) => console.log('Finalizado:', data)}
                onReset={() => console.log('Reiniciado')}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Hooks auxiliares
function useActiveAppointments() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const { appointmentService } = await import('@/services');
      const result = await appointmentService.getActiveAppointments();
      if (result.success) {
        setData(result.data || []);
      } else {
        setError(result.error || 'Erro ao buscar apontamentos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
}

function useActiveDowntimes() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const { downtimeService } = await import('@/services');
      const result = await downtimeService.getActiveDowntimes();
      if (result.success) {
        setData(result.data || []);
      } else {
        setError(result.error || 'Erro ao buscar paradas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
}
