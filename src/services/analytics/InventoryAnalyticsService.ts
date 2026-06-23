/**
 * InventoryAnalyticsService - Inventory KPIs and analytics
 */

import { supabase } from '@/lib/supabase';

export class InventoryAnalyticsService {
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
      case 'critical_materials_count':
        return this.getCriticalMaterialsCount(tenantId, timestamp);
      case 'current_inventory_level':
        return this.getCurrentInventoryLevel(tenantId, timestamp);
      case 'inventory_turnover':
        return this.getInventoryTurnover(tenantId, timestamp);
      case 'materials_below_minimum':
        return this.getMaterialsBelowMinimum(tenantId, timestamp);
      case 'reserved_materials':
        return this.getReservedMaterials(tenantId, timestamp);
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

    if (lowerQuery.includes('crític')) {
      data = await this.getCriticalMaterialsDetails(tenantId);
      insights.push(`Foram identificados ${data.count} materiais em situação crítica`);
      if (data.count > 0) {
        recommendations.push('Gerar pedidos de compra urgentes');
        recommendations.push('Priorizar materiais com cobertura < 3 dias');
      }
    } else if (lowerQuery.includes('estoque') || lowerQuery.includes('inventory')) {
      data = await this.getInventoryOverview(tenantId);
      insights.push(`Valor total em estoque: ${data.totalValue}`);
      insights.push(`Materiais críticos: ${data.criticalCount}`);
    } else {
      data = await this.getInventoryOverview(tenantId);
    }

    return { data, insights, recommendations };
  }

  private async getCriticalMaterialsCount(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('id')
        .lte('current_stock', 'minimum_stock')
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      return {
        kpiName: 'critical_materials_count',
        value: data?.length || 0,
        unit: 'materiais',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting critical materials count:', error);
      return {
        kpiName: 'critical_materials_count',
        value: 0,
        unit: 'materiais',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getCurrentInventoryLevel(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('current_stock, unit_cost');

      if (error) throw error;

      const totalQuantity = data?.reduce((sum, m) => sum + (m.current_stock || 0), 0) || 0;
      const totalValue = data?.reduce((sum, m) => sum + ((m.current_stock || 0) * (m.unit_cost || 0)), 0) || 0;

      return {
        kpiName: 'current_inventory_level',
        value: totalQuantity,
        unit: 'unidades',
        timestamp: timestamp || new Date().toISOString(),
        metadata: { totalValue },
      };
    } catch (error) {
      console.error('Error getting current inventory level:', error);
      return {
        kpiName: 'current_inventory_level',
        value: 0,
        unit: 'unidades',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getInventoryTurnover(tenantId?: string, timestamp?: string) {
    try {
      // Simplified turnover calculation
      const { data, error } = await supabase
        .from('materials')
        .select('current_stock, average_monthly_consumption');

      if (error) throw error;

      const totalStock = data?.reduce((sum, m) => sum + (m.current_stock || 0), 0) || 0;
      const totalConsumption = data?.reduce((sum, m) => sum + (m.average_monthly_consumption || 0), 0) || 0;
      const turnover = totalConsumption > 0 ? (totalConsumption / totalStock) * 12 : 0; // Annual turnover

      return {
        kpiName: 'inventory_turnover',
        value: Math.round(turnover * 10) / 10,
        unit: 'vezes/ano',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting inventory turnover:', error);
      return {
        kpiName: 'inventory_turnover',
        value: 0,
        unit: 'vezes/ano',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getMaterialsBelowMinimum(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('id, name, current_stock, minimum_stock')
        .lt('current_stock', 'minimum_stock')
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      return {
        kpiName: 'materials_below_minimum',
        value: data?.length || 0,
        unit: 'materiais',
        timestamp: timestamp || new Date().toISOString(),
        metadata: { materials: data },
      };
    } catch (error) {
      console.error('Error getting materials below minimum:', error);
      return {
        kpiName: 'materials_below_minimum',
        value: 0,
        unit: 'materiais',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getReservedMaterials(tenantId?: string, timestamp?: string) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('id')
        .gt('reserved_quantity', 0)
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      return {
        kpiName: 'reserved_materials',
        value: data?.length || 0,
        unit: 'materiais',
        timestamp: timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting reserved materials:', error);
      return {
        kpiName: 'reserved_materials',
        value: 0,
        unit: 'materiais',
        timestamp: timestamp || new Date().toISOString(),
      };
    }
  }

  private async getCriticalMaterialsDetails(tenantId?: string) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('id, name, current_stock, minimum_stock, coverage_days')
        .lte('coverage_days', 3)
        .eq('tenant_id', tenantId || null);

      if (error) throw error;

      return {
        count: data?.length || 0,
        materials: data || [],
      };
    } catch (error) {
      console.error('Error getting critical materials details:', error);
      return { count: 0, materials: [] };
    }
  }

  private async getInventoryOverview(tenantId?: string) {
    const [level, critical] = await Promise.all([
      this.getCurrentInventoryLevel(tenantId),
      this.getCriticalMaterialsCount(tenantId),
    ]);

    return {
      totalQuantity: level.value,
      totalValue: level.metadata?.totalValue || 0,
      criticalCount: critical.value,
    };
  }
}
