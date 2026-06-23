import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Package, 
  ShoppingCart,
  RefreshCw,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  totalPurchaseOrders: number;
  pendingPurchaseOrders: number;
  capacityUtilization: number;
  bottlenecks: number;
}

interface PlanningDashboardProps {
  className?: string;
}

export function PlanningDashboard({ className }: PlanningDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    totalPurchaseOrders: 0,
    pendingPurchaseOrders: 0,
    capacityUtilization: 0,
    bottlenecks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string>("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    // Simular carregamento de dados
    setTimeout(() => {
      setStats({
        totalOrders: 45,
        pendingOrders: 12,
        inProgressOrders: 18,
        completedOrders: 15,
        totalPurchaseOrders: 23,
        pendingPurchaseOrders: 8,
        capacityUtilization: 78,
        bottlenecks: 3,
      });
      setLastSync(new Date().toLocaleTimeString('pt-BR'));
      setLoading(false);
    }, 500);
  };

  const handleSync = async () => {
    setLoading(true);
    // Simular sincronização
    setTimeout(() => {
      setLastSync(new Date().toLocaleTimeString('pt-BR'));
      setLoading(false);
    }, 1000);
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    color 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    trend?: string; 
    color?: string;
  }) => (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="size-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={cn("p-2 rounded-lg", color || "bg-primary/10")}>
          <Icon className="size-5 text-primary" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Planejamento</h2>
          <p className="text-muted-foreground">
            Visão geral de PCP, MRP e integrações
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadStats} disabled={loading}>
            <RefreshCw className={cn("size-4 mr-2", loading && "animate-spin")} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleSync} disabled={loading}>
            <RefreshCw className={cn("size-4 mr-2", loading && "animate-spin")} />
            Sincronizar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="size-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Last Sync */}
      <div className="text-sm text-muted-foreground">
        Última sincronização: {lastSync || "Nunca"}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de OPs"
          value={stats.totalOrders}
          icon={Package}
          trend="+5% vs mês anterior"
          color="bg-blue-500/10"
        />
        <StatCard
          title="OPs em Andamento"
          value={stats.inProgressOrders}
          icon={Clock}
          color="bg-orange-500/10"
        />
        <StatCard
          title="OPs Concluídas"
          value={stats.completedOrders}
          icon={CheckCircle2}
          trend="+12% vs mês anterior"
          color="bg-green-500/10"
        />
        <StatCard
          title="Pedidos de Compra"
          value={stats.totalPurchaseOrders}
          icon={ShoppingCart}
          color="bg-purple-500/10"
        />
      </div>

      {/* Capacity & Bottlenecks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Utilização de Capacidade</h3>
            <Badge variant="outline">
              {stats.capacityUtilization}%
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Capacidade Utilizada</span>
              <span className="font-medium">{stats.capacityUtilization}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  stats.capacityUtilization > 90 ? "bg-red-500" :
                  stats.capacityUtilization > 75 ? "bg-yellow-500" :
                  "bg-green-500"
                )}
                style={{ width: `${stats.capacityUtilization}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Capacidade Disponível</span>
              <span className="font-medium">{100 - stats.capacityUtilization}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Gargalos Identificados</h3>
            <Badge variant={stats.bottlenecks > 0 ? "destructive" : "default"}>
              {stats.bottlenecks}
            </Badge>
          </div>
          <div className="space-y-2">
            {stats.bottlenecks > 0 ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="size-4 text-destructive" />
                  <span>3 OPs com atraso crítico</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="size-4 text-yellow-500" />
                  <span>2 conflitos de recursos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="size-4 text-orange-500" />
                  <span>1 falta de material</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-green-500" />
                <span>Nenhum gargalo identificado</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Orders Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Status das Ordens de Produção</h3>
          <BarChart3 className="size-5 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-sm">Pendentes</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-48 bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gray-500"
                  style={{ width: `${(stats.pendingOrders / stats.totalOrders) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">{stats.pendingOrders}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">Em Andamento</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-48 bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${(stats.inProgressOrders / stats.totalOrders) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">{stats.inProgressOrders}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">Concluídas</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-48 bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${(stats.completedOrders / stats.totalOrders) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">{stats.completedOrders}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Purchase Orders Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Status dos Pedidos de Compra</h3>
          <ShoppingCart className="size-5 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm">Pendentes</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-48 bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-yellow-500"
                  style={{ width: `${(stats.pendingPurchaseOrders / stats.totalPurchaseOrders) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">{stats.pendingPurchaseOrders}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">Confirmados</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-48 bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${((stats.totalPurchaseOrders - stats.pendingPurchaseOrders) / stats.totalPurchaseOrders) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">{stats.totalPurchaseOrders - stats.pendingPurchaseOrders}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
