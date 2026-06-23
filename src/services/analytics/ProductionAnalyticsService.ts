/**
 * ProductionAnalyticsService - Production KPIs and analytics
 * 
 * Calculates production-related metrics without AI dependency
 */

import { supabase } from '@/lib/supabase';

export interface ProductionKPIs {
  openOrdersCount: number;
  delayedOrdersCount: number;
  completedOrdersCount: number;
  productionEfficiency: number;
  capacityUtilization: number;
  bottleneckOperations: string[];
  averageCycleTime: number;
}

export interface ProductionAnalysis {
  data: any;
  insights: string[];
  recommendations: string[];
}

export class ProductionAnalyticsService {
  /**
   * Calculate a specific KPI
   */
  async calculateKPI(
    kpiName: string,
    filters?: Record<string, any>,
    tenantId?: string
  ): Promise<{
    kpiName: string;
    value: number | string | boolean;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: number;
    timestamp: string;
    metadata?: Record<string, any>;
  }> {
    const timestamp = new Date().toISOString();

    switch (kpiName) {
      case 'open_orders_count':
        return this.getOpenOrdersCount(tenantId, timestamp);
      case 'delayed_orders_count':
        return this.getDelayedOrdersCount(tenantId, timestamp);
      case 'completed_orders_count':
        return this.getCompletedOrdersCount(tenantId, timestamp);
      case 'production_efficiency':
        return this.getProductionEfficiency(tenantId, timestamp);
      case 'capacity_utilization':
        return this.getCapacityUtilization(tenantId, timestamp);
      case 'bottleneck_operations':
        return this.getBottleneckOperations(tenantId, timestamp);
      case 'average_cycle_time':
        return this.getAverageCycleTime(tenantId, timestamp);
      default:
        throw new Error(`Unknown KPI: ${kpiName}`);
    }
  }

  /**
   * Analyze production data
   */
  async analyze(
    query: string,
    filters?: Record<string, any>,
    tenantId?: string
  ): Promise<ProductionAnalysis> {
    const lowerQuery = query.toLowerCase();
    let data: any = {};
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Determine what to analyze based on query
    if (lowerQuery.includes('atrasad') || lowerQuery.includes('delay')) {
      data = await this.getDelayedOrdersDetails(tenantId);
      insights.push(`Existem ${data.count} ordens de produção atrasadas`);
      if (data.count > 0) {
        recommendations.push('Priorizar ordens com atraso superior a 5 dias');
        recommendations.push('Revisar capacidade do setor de montagem');
      }
    } else if (lowerQuery.includes('eficiência') || lowerQuery.includes('efficiency')) {
      data = await this.getEfficiencyDetails(tenantId);
      insights.push(`Eficiência produtiva atual: ${data.efficiency}%`);
      if (data.efficiency < 80) {
        recommendations.push('Investigar paradas não planejadas');
        recommendations.push('Revisar treinamento de operadores');
      }
    } else if (lowerQuery.includes('capacidade') || lowerQuery.includes('capacity')) {
      data = await this.getCapacityDetails(tenantId);
      insights.push(`Utilização de capacidade: ${data.utilization}%`);
      if (data.utilization > 90) {
        recommendations.push('Considerar turno adicional');
        recommendations.push('Avaliar terceirização de operações');
      }
    } else {
      // General production status
      data = await this.getGeneralProductionStatus(tenantId);
      insights.push(`OPs abertas: ${data.openOrders}`);
      insights.push(`OPs atrasadas: ${data.delayedOrders}`);
      insights.push(`Eficiência: ${data.efficiency}%`);
    }

    return { data, insights, recommendations };
  }

  private async getOpenOrdersCount(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('production_orders')
        .select('id')
        .eq('status', 'open')
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      return {
        kpiName: 'open_orders_count',
        value: data?.length || 0,
        unit: 'OPs',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting open orders count:', error);
      return {
        kpiName: 'open_orders_count',
        value: 0,
        unit: 'OPs',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getDelayedOrdersCount(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('production_orders')
        .select('id, due_date')
        .eq('status', 'open')
        .eq('tenant_id', tenantId || null)
        .lt('due_date', new Date().toISOString());

      if (error) throw error;

      return {
        kpiName: 'delayed_orders_count',
        value: data?.length || 0,
        unit: 'OPs',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting delayed orders count:', error);
      return {
        kpiName: 'delayed_orders_count',
        value: 0,
        unit: 'OPs',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getCompletedOrdersCount(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('production_orders')
        .select('id')
        .eq('status', 'completed')
        .eq('tenant_id', tenantId || null)
        .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      return {
        kpiName: 'completed_orders_count',
        value: data?.length || 0,
        unit: 'OPs',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting completed orders count:', error);
      return {
        kpiName: 'completed_orders_count',
        value: 0,
        unit: 'OPs',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getProductionEfficiency(tenantId?: string, timestamp?: string) {
    try {
      // Calculate efficiency as (actual_output / planned_output) * 100
      const { data, error } = await supabase
        .from('production_orders')
        .select('planned_quantity, actual_quantity')
        .eq('status', 'completed')
        .eq('tenant_id', tenantId || null)
        .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          kpiName: 'production_efficiency',
          value: 0,
          unit: '%',
          timestamp: timestamp || new Date().toISOString(),
        };
      }

      const totalPlanned = data.reduce((sum, order) => sum + (order.planned_quantity || 0), 0);
      const totalActual = data.reduce((sum, order) => sum + (order.actual_quantity || 0), 0);
      const efficiency = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

      return {
        kpiName: 'production_efficiency',
        value: Math.round(efficiency * 10) / 10,
        unit: '%',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting production efficiency:', error);
      return {
        kpiName: 'production_efficiency',
        value: 0,
        unit: '%',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getCapacityUtilization(tenantId?: string, timestamp?: string) {
    try {
      // Simplified capacity calculation
      const { data, error } = await supabase
        .from('production_orders')
        .select('planned_hours')
        .eq('status', 'in_progress')
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      const totalPlannedHours = data?.reduce((sum, order) => sum + (order.planned_hours || 0), 0) || 0;
      const availableHours = 8 * 20; // 8 hours/day * 20 working days (simplified)
      const utilization = (totalPlannedHours / availableHours) * 100;

      return {
        kpiName: 'capacity_utilization',
        value: Math.min(Math.round(utilization), 100),
        unit: '%',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting capacity utilization:', error);
      return {
        kpiName: 'capacity_utilization',
        value: 0,
        unit: '%',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getBottleneckOperations(tenantId?: string, timestamp?: string) {
    try {
      // Simplified bottleneck detection
      const { data, error } = await supabase
        .from('production_orders')
        .select('current_operation')
        .eq('status', 'delayed')
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      const operations = data?.map(order => order.current_operation) || [];
      const operationCounts = operations.reduce((acc, op) => {
        acc[op] = (acc[op] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const bottlenecks = (Object.entries(operationCounts) as Array<[string, number]>)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([op]) => op);

      return {
        kpiName: 'bottleneck_operations',
        value: bottlenecks.join(', ') || 'Nenhuma',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting bottleneck operations:', error);
      return {
        kpiName: 'bottleneck_operations',
        value: 'Nenhuma',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getAverageCycleTime(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('production_orders')
        .select('started_at, completed_at')
        .eq('status', 'completed')
        .eq('tenant_id', tenantId || null)
        .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          kpiName: 'average_cycle_time',
          value: 0,
          unit: 'horas',
          timestamp: timestamp || new Date().toISOString(),
        };
      }

      const cycleTimes = data
        .filter(order => order.started_at && order.completed_at)
        .map(order => {
          const start = new Date(order.started_at).getTime();
          const end = new Date(order.completed_at).getTime();
          return (end - start) / (1000 * 60 * 60); // Convert to hours
        });

      const avgCycleTime = cycleTimes.length > 0
        ? cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length
        : 0;

      return {
        kpiName: 'average_cycle_time',
        value: Math.round(avgCycleTime * 10) / 10,
        unit: 'horas',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting average cycle time:', error);
      return {
        kpiName: 'average_cycle_time',
        value: 0,
        unit: 'horas',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getDelayedOrdersDetails(tenantId?: string) {
    try {
      const { data, error } = await supabase
        .from('production_orders')
        .select('id, due_date, current_operation, delay_days')
        .eq('status', 'open')
        .eq('tenant_id', tenantId || null)
        .lt('due_date', new Date().toISOString());

      if (error) throw error;

      const criticalDelays = data?.filter(order => (order.delay_days || 0) > 5).length || 0;

      return {
        count: data?.length || 0,
        criticalDelays,
        orders: data || [],
      };
    } catch (error) {
      console.error('Error getting delayed orders details:', error);
      return { count: 0, criticalDelays: 0, orders: [] };
    }
  }

  private async getEfficiencyDetails(tenantId?: string) {
    const kpi = await this.getProductionEfficiency(tenantId);
    return {
      efficiency: kpi.value as number,
    };
  }

  private async getCapacityDetails(tenantId?: string) {
    const kpi = await this.getCapacityUtilization(tenantId);
    return {
      utilization: kpi.value as number,
    };
  }

  private async getGeneralProductionStatus(tenantId?: string) {
    const [openOrders, delayedOrders, efficiency] = await Promise.all([
      this.getOpenOrdersCount(tenantId),
      this.getDelayedOrdersCount(tenantId),
      this.getProductionEfficiency(tenantId),
    ]);

    return {
      openOrders: openOrders.value as number,
      delayedOrders: delayedOrders.value as number,
      efficiency: efficiency.value as number,
    };
  }
}
