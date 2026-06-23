/**
 * IndustrialAnalyticsEngine - Central hub for all industrial calculations
 * 
 * This engine coordinates all analytics services and provides a unified interface
 * for KPI calculations, insights generation, and industrial metrics.
 * 
 * NO AI DEPENDENCY - All calculations are based on real ERP data
 */

import { supabase } from '@/lib/supabase';
import { ProductionAnalyticsService } from './analytics/ProductionAnalyticsService';
import { InventoryAnalyticsService } from './analytics/InventoryAnalyticsService';
import { MRPAnalyticsService } from './analytics/MRPAnalyticsService';
import { QualityAnalyticsService } from './analytics/QualityAnalyticsService';
import { SupplierAnalyticsService } from './analytics/SupplierAnalyticsService';
import { FinancialAnalyticsService } from './analytics/FinancialAnalyticsService';

export type Domain = 
  | 'production' 
  | 'pcp' 
  | 'mrp' 
  | 'inventory' 
  | 'quality' 
  | 'financial' 
  | 'supplier' 
  | 'product' 
  | 'lot' 
  | 'traceability' 
  | 'general';

export interface KPIRequest {
  domain: Domain;
  kpiName: string;
  filters?: Record<string, any>;
  tenantId?: string;
}

export interface KPIResult {
  kpiName: string;
  value: number | string | boolean;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsRequest {
  domain: Domain;
  query: string;
  filters?: Record<string, any>;
  tenantId?: string;
}

export interface AnalyticsResult {
  data: any;
  insights: string[];
  recommendations: string[];
  timestamp: string;
}

export class IndustrialAnalyticsEngine {
  private productionAnalytics: ProductionAnalyticsService;
  private inventoryAnalytics: InventoryAnalyticsService;
  private mrpAnalytics: MRPAnalyticsService;
  private qualityAnalytics: QualityAnalyticsService;
  private supplierAnalytics: SupplierAnalyticsService;
  private financialAnalytics: FinancialAnalyticsService;

  constructor() {
    this.productionAnalytics = new ProductionAnalyticsService();
    this.inventoryAnalytics = new InventoryAnalyticsService();
    this.mrpAnalytics = new MRPAnalyticsService();
    this.qualityAnalytics = new QualityAnalyticsService();
    this.supplierAnalytics = new SupplierAnalyticsService();
    this.financialAnalytics = new FinancialAnalyticsService();
  }

  /**
   * Get a specific KPI value
   * Returns from cache if available, otherwise calculates fresh
   */
  async getKPI(request: KPIRequest): Promise<KPIResult> {
    const { domain, kpiName, filters, tenantId } = request;

    // Try to get from cache first (copilot_kpis table)
    const cached = await this.getKPIFromCache(domain, kpiName, tenantId);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached;
    }

    // Calculate fresh KPI
    const result = await this.calculateKPI(domain, kpiName, filters, tenantId);

    // Cache the result
    await this.cacheKPIResult(domain, kpiName, result, tenantId);

    return result;
  }

  /**
   * Get multiple KPIs at once
   */
  async getKPIs(requests: KPIRequest[]): Promise<KPIResult[]> {
    return Promise.all(requests.map(req => this.getKPI(req)));
  }

  /**
   * Execute an analytics query
   */
  async executeAnalytics(request: AnalyticsRequest): Promise<AnalyticsResult> {
    const { domain, query, filters, tenantId } = request;

    let data: any;
    let insights: string[] = [];
    let recommendations: string[] = [];

    switch (domain) {
      case 'production':
        ({ data, insights, recommendations } = await this.productionAnalytics.analyze(query, filters, tenantId));
        break;
      case 'inventory':
        ({ data, insights, recommendations } = await this.inventoryAnalytics.analyze(query, filters, tenantId));
        break;
      case 'mrp':
        ({ data, insights, recommendations } = await this.mrpAnalytics.analyze(query, filters, tenantId));
        break;
      case 'quality':
        ({ data, insights, recommendations } = await this.qualityAnalytics.analyze(query, filters, tenantId));
        break;
      case 'supplier':
        ({ data, insights, recommendations } = await this.supplierAnalytics.analyze(query, filters, tenantId));
        break;
      case 'financial':
        ({ data, insights, recommendations } = await this.financialAnalytics.analyze(query, filters, tenantId));
        break;
      case 'general':
        const health = await this.getOverallHealth(tenantId);
        data = health;
        insights = [`Saúde geral da fábrica: ${health.score.toFixed(1)}%`];
        recommendations = health.criticalIssues.length > 0 
          ? health.criticalIssues.map(issue => `Atenção: ${issue}`)
          : ['Todos os indicadores operacionais estão dentro da normalidade.'];
        break;
      default:
        throw new Error(`Unknown domain: ${domain}`);
    }

    return {
      data,
      insights,
      recommendations,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get all critical KPIs for a domain
   */
  async getCriticalKPIs(domain: Domain, tenantId?: string): Promise<KPIResult[]> {
    const criticalKPIs = this.getCriticalKPIsForDomain(domain);
    return this.getKPIs(criticalKPIs.map(kpiName => ({
      domain,
      kpiName,
      tenantId,
    })));
  }

  /**
   * Get overall factory health score
   */
  async getOverallHealth(tenantId?: string): Promise<{
    score: number;
    domainScores: Record<Domain, number>;
    criticalIssues: string[];
  }> {
    const domains: Domain[] = ['production', 'inventory', 'quality', 'supplier', 'financial'];
    
    const domainScores: Partial<Record<Domain, number>> = {};
    const criticalIssues: string[] = [];

    for (const domain of domains) {
      const kpis = await this.getCriticalKPIs(domain, tenantId);
      const score = this.calculateDomainScore(kpis);
      domainScores[domain] = score;

      if (score < 60) {
        criticalIssues.push(`${domain}: Score crítico (${score.toFixed(0)}%)`);
      }
    }

    const overallScore = Object.values(domainScores).reduce((a, b) => a + b, 0) / domains.length;

    return {
      score: overallScore,
      domainScores: domainScores as Record<Domain, number>,
      criticalIssues,
    };
  }

  private async calculateKPI(
    domain: Domain,
    kpiName: string,
    filters?: Record<string, any>,
    tenantId?: string
  ): Promise<KPIResult> {
    switch (domain) {
      case 'production':
        return this.productionAnalytics.calculateKPI(kpiName, filters, tenantId);
      case 'inventory':
        return this.inventoryAnalytics.calculateKPI(kpiName, filters, tenantId);
      case 'mrp':
        return this.mrpAnalytics.calculateKPI(kpiName, filters, tenantId);
      case 'quality':
        return this.qualityAnalytics.calculateKPI(kpiName, filters, tenantId);
      case 'supplier':
        return this.supplierAnalytics.calculateKPI(kpiName, filters, tenantId);
      case 'financial':
        return this.financialAnalytics.calculateKPI(kpiName, filters, tenantId);
      case 'general':
        return {
          kpiName,
          value: 0,
          timestamp: new Date().toISOString()
        };
      default:
        throw new Error(`Unknown domain: ${domain}`);
    }
  }

  private async getKPIFromCache(
    domain: Domain,
    kpiName: string,
    tenantId?: string
  ): Promise<KPIResult | null> {
    try {
      const { data, error } = await supabase
        .from('copilot_kpis')
        .select('*')
        .eq('domain', domain)
        .eq('kpi_name', kpiName)
        .eq('tenant_id', tenantId || null)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return {
        kpiName: data.kpi_name,
        value: data.value,
        unit: data.unit,
        trend: data.trend,
        trendValue: data.trend_value,
        timestamp: data.updated_at,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error('Error getting KPI from cache:', error);
      return null;
    }
  }

  private isCacheValid(timestamp: string): boolean {
    const cacheTime = new Date(timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - cacheTime.getTime()) / (1000 * 60);
    return diffMinutes < 15; // Cache valid for 15 minutes
  }

  private async cacheKPIResult(
    domain: Domain,
    kpiName: string,
    result: KPIResult,
    tenantId?: string
  ): Promise<void> {
    try {
      await supabase
        .from('copilot_kpis')
        .upsert({
          domain,
          kpi_name: kpiName,
          value: result.value,
          unit: result.unit,
          trend: result.trend,
          trend_value: result.trendValue,
          metadata: result.metadata,
          tenant_id: tenantId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'domain,kpi_name,tenant_id'
        });
    } catch (error) {
      console.error('Error caching KPI result:', error);
    }
  }

  private getCriticalKPIsForDomain(domain: Domain): string[] {
    const criticalKPIs: Partial<Record<Domain, string[]>> = {
      production: [
        'open_orders_count',
        'delayed_orders_count',
        'production_efficiency',
        'capacity_utilization',
      ],
      inventory: [
        'critical_materials_count',
        'current_inventory_level',
        'inventory_turnover',
      ],
      mrp: [
        'pending_purchases_count',
        'materials_below_coverage',
        'average_lead_time',
      ],
      quality: [
        'scrap_rate',
        'rework_rate',
        'non_conformity_count',
      ],
      supplier: [
        'delayed_deliveries_count',
        'average_lead_time',
        'supplier_performance',
      ],
      financial: [
        'profit_margin',
        'industrial_cost',
        'profitability',
      ],
      general: [],
    };

    return criticalKPIs[domain] || [];
  }

  private calculateDomainScore(kpis: KPIResult[]): number {
    if (kpis.length === 0) return 100;

    let totalScore = 0;
    let scoredKPIs = 0;

    for (const kpi of kpis) {
      const score = this.scoreKPI(kpi);
      if (score !== null) {
        totalScore += score;
        scoredKPIs++;
      }
    }

    return scoredKPIs > 0 ? totalScore / scoredKPIs : 100;
  }

  private scoreKPI(kpi: KPIResult): number | null {
    // Scoring logic based on KPI type and value
    // This is a simplified version - should be enhanced based on business rules
    
    if (typeof kpi.value !== 'number') return null;

    switch (kpi.kpiName) {
      case 'delayed_orders_count':
        return kpi.value === 0 ? 100 : Math.max(0, 100 - kpi.value * 5);
      case 'production_efficiency':
        return kpi.value;
      case 'capacity_utilization':
        return kpi.value > 85 ? 100 : kpi.value;
      case 'scrap_rate':
        return kpi.value < 2 ? 100 : Math.max(0, 100 - kpi.value * 20);
      case 'profit_margin':
        return kpi.value > 20 ? 100 : kpi.value * 5;
      default:
        return 80; // Default score for unknown KPIs
    }
  }
}

export const industrialAnalyticsEngine = new IndustrialAnalyticsEngine();
