/**
 * SupplierAnalyticsService - Supplier performance analytics
 */

import { supabase } from '@/lib/supabase';

export class SupplierAnalyticsService {
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
      case 'delayed_deliveries_count':
        return this.getDelayedDeliveriesCount(tenantId, timestamp);
      case 'average_lead_time':
        return this.getAverageLeadTime(tenantId, timestamp);
      case 'supplier_performance':
        return this.getSupplierPerformance(tenantId, timestamp);
      case 'critical_suppliers':
        return this.getCriticalSuppliers(tenantId, timestamp);
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

    if (lowerQuery.includes('atraso') || lowerQuery.includes('delay')) {
      data = await this.getDelayAnalysis(tenantId);
      insights.push(`Fornecedores com atrasos: ${data.delayedCount}`);
      if (data.delayedCount > 0) {
        recommendations.push('Contactar fornecedores com atrasos recorrentes');
        recommendations.push('Avaliar fornecedores alternativos');
      }
    } else if (lowerQuery.includes('performance') || lowerQuery.includes('avaliação')) {
      data = await this.getPerformanceAnalysis(tenantId);
      insights.push(`Performance média dos fornecedores: ${data.averagePerformance}%`);
    } else if (lowerQuery.includes('fornecedor')) {
      data = await this.getSupplierOverview(tenantId);
    }

    return { data, insights, recommendations };
  }

  private async getDelayedDeliveriesCount(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('id, supplier_id')
        .eq('status', 'pending')
        .lt('expected_delivery_date', new Date().toISOString())
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      return {
        kpiName: 'delayed_deliveries_count',
        value: data?.length || 0,
        unit: 'entregas',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting delayed deliveries count:', error);
      return {
        kpiName: 'delayed_deliveries_count',
        value: 0,
        unit: 'entregas',
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

  private async getSupplierPerformance(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('performance_score');

      if (error) throw error;

      const scores = data?.map(s => s.performance_score).filter(s => s != null) || [];
      const avgScore = scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : 0;

      return {
        kpiName: 'supplier_performance',
        value: Math.round(avgScore),
        unit: '%',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting supplier performance:', error);
      return {
        kpiName: 'supplier_performance',
        value: 0,
        unit: '%',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getCriticalSuppliers(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id')
        .lt('performance_score', 70)
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      return {
        kpiName: 'critical_suppliers',
        value: data?.length || 0,
        unit: 'fornecedores',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting critical suppliers:', error);
      return {
        kpiName: 'critical_suppliers',
        value: 0,
        unit: 'fornecedores',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getDelayAnalysis(tenantId?: string) {
    const kpi = await this.getDelayedDeliveriesCount(tenantId);
    return {
      delayedCount: kpi.value as number,
    };
  }

  private async getPerformanceAnalysis(tenantId?: string) {
    const kpi = await this.getSupplierPerformance(tenantId);
    return {
      averagePerformance: kpi.value as number,
    };
  }

  private async getSupplierOverview(tenantId?: string) {
    const [delayed, performance, critical] = await Promise.all([
      this.getDelayedDeliveriesCount(tenantId),
      this.getSupplierPerformance(tenantId),
      this.getCriticalSuppliers(tenantId),
    ]);

    return {
      delayedDeliveries: delayed.value,
      averagePerformance: performance.value,
      criticalSuppliers: critical.value,
    };
  }
}
