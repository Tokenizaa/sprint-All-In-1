/**
 * FinancialAnalyticsService - Financial KPIs and analytics
 */

import { supabase } from '@/lib/supabase';

export class FinancialAnalyticsService {
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
      case 'profit_margin':
        return this.getProfitMargin(tenantId, timestamp);
      case 'industrial_cost':
        return this.getIndustrialCost(tenantId, timestamp);
      case 'profitability':
        return this.getProfitability(tenantId, timestamp);
      case 'revenue':
        return this.getRevenue(tenantId, timestamp);
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

    if (lowerQuery.includes('margem')) {
      data = await this.getMarginAnalysis(tenantId);
      insights.push(`Margem de lucro média: ${data.margin}%`);
      if (data.margin < 15) {
        recommendations.push('Revisar estrutura de custos');
        recommendations.push('Avaliar aumento de preços');
      }
    } else if (lowerQuery.includes('custo')) {
      data = await this.getCostAnalysis(tenantId);
      insights.push(`Custo industrial total: ${data.totalCost}`);
    } else if (lowerQuery.includes('lucro') || lowerQuery.includes('rentabilidade')) {
      data = await this.getProfitabilityAnalysis(tenantId);
      insights.push(`Rentabilidade: ${data.profitability}%`);
    } else {
      data = await this.getFinancialOverview(tenantId);
    }

    return { data, insights, recommendations };
  }

  private async getProfitMargin(tenantId?: string, timestamp?: string) {
    try {
      // Simplified margin calculation
      const { data, error } = await supabase
        .from('products')
        .select('selling_price, total_cost');

      if (error) throw error;

      const margins = data
        ?.filter(p => p.selling_price && p.total_cost)
        .map(p => ((p.selling_price - p.total_cost) / p.selling_price) * 100) || [];

      const avgMargin = margins.length > 0
        ? margins.reduce((sum, m) => sum + m, 0) / margins.length
        : 0;

      return {
        kpiName: 'profit_margin',
        value: Math.round(avgMargin * 10) / 10,
        unit: '%',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting profit margin:', error);
      return {
        kpiName: 'profit_margin',
        value: 0,
        unit: '%',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getIndustrialCost(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('production_orders')
        .select('total_cost')
        .eq('status', 'completed')
        .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      const totalCost = data?.reduce((sum, order) => sum + (order.total_cost || 0), 0) || 0;

      return {
        kpiName: 'industrial_cost',
        value: totalCost,
        unit: 'R$',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting industrial cost:', error);
      return {
        kpiName: 'industrial_cost',
        value: 0,
        unit: 'R$',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getProfitability(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('selling_price, total_cost');

      if (error) throw error;

      const profitability = data
        ?.filter(p => p.selling_price && p.total_cost)
        .reduce((sum, p) => sum + (p.selling_price - p.total_cost), 0) || 0;

      const revenue = data?.reduce((sum, p) => sum + (p.selling_price || 0), 0) || 0;
      const profitRate = revenue > 0 ? (profitability / revenue) * 100 : 0;

      return {
        kpiName: 'profitability',
        value: Math.round(profitRate * 10) / 10,
        unit: '%',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting profitability:', error);
      return {
        kpiName: 'profitability',
        value: 0,
        unit: '%',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getRevenue(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('sales_orders')
        .select('total_value')
        .eq('status', 'completed')
        .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      const totalRevenue = data?.reduce((sum, order) => sum + (order.total_value || 0), 0) || 0;

      return {
        kpiName: 'revenue',
        value: totalRevenue,
        unit: 'R$',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting revenue:', error);
      return {
        kpiName: 'revenue',
        value: 0,
        unit: 'R$',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getMarginAnalysis(tenantId?: string) {
    const kpi = await this.getProfitMargin(tenantId);
    return {
      margin: kpi.value as number,
    };
  }

  private async getCostAnalysis(tenantId?: string) {
    const kpi = await this.getIndustrialCost(tenantId);
    return {
      totalCost: kpi.value,
    };
  }

  private async getProfitabilityAnalysis(tenantId?: string) {
    const kpi = await this.getProfitability(tenantId);
    return {
      profitability: kpi.value as number,
    };
  }

  private async getFinancialOverview(tenantId?: string) {
    const [margin, cost, profitability] = await Promise.all([
      this.getProfitMargin(tenantId),
      this.getIndustrialCost(tenantId),
      this.getProfitability(tenantId),
    ]);

    return {
      profitMargin: margin.value,
      industrialCost: cost.value,
      profitability: profitability.value,
    };
  }
}
