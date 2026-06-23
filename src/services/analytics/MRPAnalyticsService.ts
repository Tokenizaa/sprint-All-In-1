/**
 * MRPAnalyticsService - MRP and purchasing analytics
 */

import { supabase } from '@/lib/supabase';

export class MRPAnalyticsService {
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
      case 'pending_purchases_count':
        return this.getPendingPurchasesCount(tenantId, timestamp);
      case 'materials_below_coverage':
        return this.getMaterialsBelowCoverage(tenantId, timestamp);
      case 'average_lead_time':
        return this.getAverageLeadTime(tenantId, timestamp);
      case 'purchase_orders_delayed':
        return this.getPurchaseOrdersDelayed(tenantId, timestamp);
      default:
        throw new Error(`Unknown KPI: ${kpiName}`);
    }
  }

  async analyze(
    query: string,
    filters?: Record<string, any>,
    tenantId?: string
  ): Promise<{ data: any; insights: string[]; recommendations: string[] }> {
    const lowerQuery = query.toLowerCase();
    let data: any = {};
    const insights: string[] = [];
    const recommendations: string[] = [];

    if (lowerQuery.includes('comprar') || lowerQuery.includes('compra')) {
      data = await this.getPurchaseRequirements(tenantId);
      insights.push(`Materiais que precisam ser comprados: ${data.count}`);
      if (data.count > 0) {
        recommendations.push('Gerar pedidos de compra automaticamente');
        recommendations.push('Priorizar fornecedores com menor lead time');
      }
    } else if (lowerQuery.includes('lead time')) {
      data = await this.getLeadTimeAnalysis(tenantId);
      insights.push(`Lead time médio: ${data.averageLeadTime} dias`);
    } else {
      data = await this.getMRPOverview(tenantId);
    }

    return { data, insights, recommendations };
  }

  private async getPendingPurchasesCount(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('id')
        .eq('status', 'pending')
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      return {
        kpiName: 'pending_purchases_count',
        value: data?.length || 0,
        unit: 'pedidos',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting pending purchases count:', error);
      return {
        kpiName: 'pending_purchases_count',
        value: 0,
        unit: 'pedidos',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getMaterialsBelowCoverage(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('id')
        .lt('coverage_days', 7)
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      return {
        kpiName: 'materials_below_coverage',
        value: data?.length || 0,
        unit: 'materiais',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting materials below coverage:', error);
      return {
        kpiName: 'materials_below_coverage',
        value: 0,
        unit: 'materiais',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getAverageLeadTime(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('lead_time_days');

      if (error) throw error;

      const leadTimes = data?.map(s => s.lead_time_days).filter(lt => lt != null) || [];
      const avgLeadTime = leadTimes.length > 0
        ? leadTimes.reduce((sum, lt) => sum + lt, 0) / leadTimes.length
        : 0;

      return {
        kpiName: 'average_lead_time',
        value: Math.round(avgLeadTime),
        unit: 'dias',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting average lead time:', error);
      return {
        kpiName: 'average_lead_time',
        value: 0,
        unit: 'dias',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getPurchaseOrdersDelayed(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('id')
        .eq('status', 'pending')
        .lt('expected_delivery_date', new Date().toISOString())
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      return {
        kpiName: 'purchase_orders_delayed',
        value: data?.length || 0,
        unit: 'pedidos',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting purchase orders delayed:', error);
      return {
        kpiName: 'purchase_orders_delayed',
        value: 0,
        unit: 'pedidos',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getPurchaseRequirements(tenantId?: string) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('id, name, current_stock, minimum_stock, coverage_days')
        .lt('coverage_days', 7)
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      return {
        count: data?.length || 0,
        materials: data || [],
      };
    } catch (error) {
      console.error('Error getting purchase requirements:', error);
      return { count: 0, materials: [] };
    }
  }

  private async getLeadTimeAnalysis(tenantId?: string) {
    const kpi = await this.getAverageLeadTime(tenantId);
    return {
      averageLeadTime: kpi.value,
    };
  }

  private async getMRPOverview(tenantId?: string) {
    const [pending, belowCoverage] = await Promise.all([
      this.getPendingPurchasesCount(tenantId),
      this.getMaterialsBelowCoverage(tenantId),
    ]);

    return {
      pendingPurchases: pending.value,
      materialsBelowCoverage: belowCoverage.value,
    };
  }
}
