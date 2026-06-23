/**
 * QualityAnalyticsService - Quality KPIs and analytics
 */

import { supabase } from '@/lib/supabase';

export class QualityAnalyticsService {
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
      case 'scrap_rate':
        return this.getScrapRate(tenantId, timestamp);
      case 'rework_rate':
        return this.getReworkRate(tenantId, timestamp);
      case 'non_conformity_count':
        return this.getNonConformityCount(tenantId, timestamp);
      case 'first_pass_yield':
        return this.getFirstPassYield(tenantId, timestamp);
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

    if (lowerQuery.includes('refugo')) {
      data = await this.getScrapDetails(tenantId);
      insights.push(`Taxa de refugo: ${data.rate}%`);
      if (data.rate > 2) {
        recommendations.push('Investigar causas principais de refugo');
        recommendations.push('Revisar parâmetros de processo');
      }
    } else if (lowerQuery.includes('retrabalho')) {
      data = await this.getReworkDetails(tenantId);
      insights.push(`Taxa de retrabalho: ${data.rate}%`);
      if (data.rate > 3) {
        recommendations.push('Treinar operadores em pontos críticos');
        recommendations.push('Revisar instruções de trabalho');
      }
    } else if (lowerQuery.includes('não conformidade') || lowerQuery.includes('defeito')) {
      data = await this.getNonConformityDetails(tenantId);
      insights.push(`Não conformidades abertas: ${data.count}`);
    } else {
      data = await this.getQualityOverview(tenantId);
    }

    return { data, insights, recommendations };
  }

  private async getScrapRate(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('quality_records')
        .select('produced_quantity, scrap_quantity')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      const totalProduced = data?.reduce((sum, r) => sum + (r.produced_quantity || 0), 0) || 0;
      const totalScrap = data?.reduce((sum, r) => sum + (r.scrap_quantity || 0), 0) || 0;
      const scrapRate = totalProduced > 0 ? (totalScrap / totalProduced) * 100 : 0;

      return {
        kpiName: 'scrap_rate',
        value: Math.round(scrapRate * 100) / 100,
        unit: '%',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting scrap rate:', error);
      return {
        kpiName: 'scrap_rate',
        value: 0,
        unit: '%',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getReworkRate(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('quality_records')
        .select('produced_quantity, rework_quantity')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      const totalProduced = data?.reduce((sum, r) => sum + (r.produced_quantity || 0), 0) || 0;
      const totalRework = data?.reduce((sum, r) => sum + (r.rework_quantity || 0), 0) || 0;
      const reworkRate = totalProduced > 0 ? (totalRework / totalProduced) * 100 : 0;

      return {
        kpiName: 'rework_rate',
        value: Math.round(reworkRate * 100) / 100,
        unit: '%',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting rework rate:', error);
      return {
        kpiName: 'rework_rate',
        value: 0,
        unit: '%',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getNonConformityCount(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('non_conformities')
        .select('id')
        .eq('status', 'open')
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      return {
        kpiName: 'non_conformity_count',
        value: data?.length || 0,
        unit: 'NCs',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting non conformity count:', error);
      return {
        kpiName: 'non_conformity_count',
        value: 0,
        unit: 'NCs',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getFirstPassYield(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('quality_records')
        .select('produced_quantity, scrap_quantity, rework_quantity')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      const totalProduced = data?.reduce((sum, r) => sum + (r.produced_quantity || 0), 0) || 0;
      const totalDefects = data?.reduce((sum, r) => sum + (r.scrap_quantity || 0) + (r.rework_quantity || 0), 0) || 0;
      const fpy = totalProduced > 0 ? ((totalProduced - totalDefects) / totalProduced) * 100 : 0;

      return {
        kpiName: 'first_pass_yield',
        value: Math.round(fpy * 10) / 10,
        unit: '%',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting first pass yield:', error);
      return {
        kpiName: 'first_pass_yield',
        value: 0,
        unit: '%',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getScrapDetails(tenantId?: string) {
    const kpi = await this.getScrapRate(tenantId);
    return {
      rate: kpi.value as number,
    };
  }

  private async getReworkDetails(tenantId?: string) {
    const kpi = await this.getReworkRate(tenantId);
    return {
      rate: kpi.value as number,
    };
  }

  private async getNonConformityDetails(tenantId?: string) {
    try {
      const { data, error } = await supabase
        .from('non_conformities')
        .select('id, type, severity, created_at')
        .eq('status', 'open')
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      return {
        count: data?.length || 0,
        nonConformities: data || [],
      };
    } catch (error) {
      console.error('Error getting non conformity details:', error);
      return { count: 0, nonConformities: [] };
    }
  }

  private async getQualityOverview(tenantId?: string) {
    const [scrap, rework, nc] = await Promise.all([
      this.getScrapRate(tenantId),
      this.getReworkRate(tenantId),
      this.getNonConformityCount(tenantId),
    ]);

    return {
      scrapRate: scrap.value,
      reworkRate: rework.value,
      nonConformityCount: nc.value,
    };
  }
}
