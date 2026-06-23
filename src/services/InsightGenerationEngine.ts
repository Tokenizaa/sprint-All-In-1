/**
 * InsightGenerationEngine - Automatic insight generation
 * 
 * Generates insights automatically without AI dependency
 * Runs periodically to identify critical issues and opportunities
 */

import { supabase } from '@/lib/supabase';
import { industrialAnalyticsEngine } from './IndustrialAnalyticsEngine';

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

export type Severity = 'critical' | 'warning' | 'info';

export interface Insight {
  id?: string;
  tenant_id?: string;
  domain: Domain;
  severity: Severity;
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  metadata?: Record<string, any>;
  created_at?: string;
  resolved?: boolean;
  resolved_at?: string;
}

export class InsightGenerationEngine {
  /**
   * Generate all insights for a tenant
   */
  async generateInsights(tenantId?: string): Promise<Insight[]> {
    const insights: Insight[] = [];

    // Generate insights for each domain
    insights.push(...await this.generateProductionInsights(tenantId));
    insights.push(...await this.generateInventoryInsights(tenantId));
    insights.push(...await this.generateMRPInsights(tenantId));
    insights.push(...await this.generateQualityInsights(tenantId));
    insights.push(...await this.generateSupplierInsights(tenantId));
    insights.push(...await this.generateFinancialInsights(tenantId));

    // Persist insights to database
    await this.persistInsights(insights, tenantId);

    return insights;
  }

  /**
   * Get active (unresolved) insights
   */
  async getActiveInsights(tenantId?: string, domain?: Domain): Promise<Insight[]> {
    try {
      let query = supabase
        .from('copilot_insights')
        .select('*')
        .eq('resolved', false)
        .eq('tenant_id', tenantId || null);

      if (domain) {
        query = query.eq('domain', domain);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting active insights:', error);
      return [];
    }
  }

  /**
   * Mark insight as resolved
   */
  async resolveInsight(insightId: string): Promise<void> {
    try {
      await supabase
        .from('copilot_insights')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', insightId);
    } catch (error) {
      console.error('Error resolving insight:', error);
    }
  }

  private async generateProductionInsights(tenantId?: string): Promise<Insight[]> {
    const insights: Insight[] = [];

    try {
      const delayedOrders = await industrialAnalyticsEngine.getKPI({
        domain: 'production',
        kpiName: 'delayed_orders_count',
        tenantId,
      });

      if (Number(delayedOrders.value) > 0) {
        insights.push({
          domain: 'production',
          severity: Number(delayedOrders.value) > 10 ? 'critical' : 'warning',
          title: 'Ordens de Produção Atrasadas',
          description: `Existem ${delayedOrders.value} ordens de produção com atraso na entrega.`,
          impact: 'Atrasos podem impactar prazos de entrega e satisfação do cliente.',
          recommendation: 'Priorizar ordens com maior atraso e revisar capacidade produtiva.',
          metadata: { delayed_orders_count: delayedOrders.value },
        });
      }

      const efficiency = await industrialAnalyticsEngine.getKPI({
        domain: 'production',
        kpiName: 'production_efficiency',
        tenantId,
      });

      if (Number(efficiency.value) < 80) {
        insights.push({
          domain: 'production',
          severity: Number(efficiency.value) < 70 ? 'critical' : 'warning',
          title: 'Eficiência Produtiva Abaixo do Esperado',
          description: `A eficiência produtiva atual é de ${efficiency.value}%, abaixo da meta de 80%.`,
          impact: 'Baixa eficiência aumenta custos e reduz capacidade produtiva.',
          recommendation: 'Investigar paradas não planejadas e revisar treinamento de operadores.',
          metadata: { efficiency: efficiency.value },
        });
      }

      const capacity = await industrialAnalyticsEngine.getKPI({
        domain: 'production',
        kpiName: 'capacity_utilization',
        tenantId,
      });

      if (Number(capacity.value) > 90) {
        insights.push({
          domain: 'production',
          severity: 'warning',
          title: 'Capacidade Produtiva Próxima do Limite',
          description: `A utilização de capacidade está em ${capacity.value}%.`,
          impact: 'Alta utilização pode causar gargalos e aumentar lead times.',
          recommendation: 'Considerar turno adicional ou terceirização de operações.',
          metadata: { capacity_utilization: capacity.value },
        });
      }
    } catch (error) {
      console.error('Error generating production insights:', error);
    }

    return insights;
  }

  private async generateInventoryInsights(tenantId?: string): Promise<Insight[]> {
    const insights: Insight[] = [];

    try {
      const criticalMaterials = await industrialAnalyticsEngine.getKPI({
        domain: 'inventory',
        kpiName: 'critical_materials_count',
        tenantId,
      });

      if (Number(criticalMaterials.value) > 0) {
        insights.push({
          domain: 'inventory',
          severity: Number(criticalMaterials.value) > 5 ? 'critical' : 'warning',
          title: 'Materiais em Estoque Crítico',
          description: `Foram identificados ${criticalMaterials.value} materiais com estoque abaixo do mínimo.`,
          impact: 'Materiais críticos podem parar a produção.',
          recommendation: 'Gerar pedidos de compra urgentes para materiais críticos.',
          metadata: { critical_materials_count: criticalMaterials.value },
        });
      }

      const turnover = await industrialAnalyticsEngine.getKPI({
        domain: 'inventory',
        kpiName: 'inventory_turnover',
        tenantId,
      });

      if (Number(turnover.value) < 4) {
        insights.push({
          domain: 'inventory',
          severity: 'warning',
          title: 'Giro de Estoque Baixo',
          description: `O giro de estoque anual é de ${turnover.value} vezes, abaixo do recomendado.`,
          impact: 'Baixo giro indica capital imobilizado em estoque.',
          recommendation: 'Revisar políticas de estoque e reduzir lotes de compra.',
          metadata: { inventory_turnover: turnover.value },
        });
      }
    } catch (error) {
      console.error('Error generating inventory insights:', error);
    }

    return insights;
  }

  private async generateMRPInsights(tenantId?: string): Promise<Insight[]> {
    const insights: Insight[] = [];

    try {
      const belowCoverage = await industrialAnalyticsEngine.getKPI({
        domain: 'mrp',
        kpiName: 'materials_below_coverage',
        tenantId,
      });

      if (Number(belowCoverage.value) > 0) {
        insights.push({
          domain: 'mrp',
          severity: Number(belowCoverage.value) > 10 ? 'critical' : 'warning',
          title: 'Materiais com Cobertura Insuficiente',
          description: `${belowCoverage.value} materiais possuem cobertura inferior a 7 dias de produção.`,
          impact: 'Risco de paralisação por falta de materiais.',
          recommendation: 'Gerar pedidos de compra com urgência.',
          metadata: { materials_below_coverage: belowCoverage.value },
        });
      }

      const delayedPurchases = await industrialAnalyticsEngine.getKPI({
        domain: 'mrp',
        kpiName: 'purchase_orders_delayed',
        tenantId,
      });

      if (Number(delayedPurchases.value) > 0) {
        insights.push({
          domain: 'mrp',
          severity: 'warning',
          title: 'Pedidos de Compra Atrasados',
          description: `${delayedPurchases.value} pedidos de compra estão com entrega atrasada.`,
          impact: 'Atrasos em compras impactam planejamento de produção.',
          recommendation: 'Contactar fornecedores e buscar alternativas.',
          metadata: { purchase_orders_delayed: delayedPurchases.value },
        });
      }
    } catch (error) {
      console.error('Error generating MRP insights:', error);
    }

    return insights;
  }

  private async generateQualityInsights(tenantId?: string): Promise<Insight[]> {
    const insights: Insight[] = [];

    try {
      const scrapRate = await industrialAnalyticsEngine.getKPI({
        domain: 'quality',
        kpiName: 'scrap_rate',
        tenantId,
      });

      if (Number(scrapRate.value) > 2) {
        insights.push({
          domain: 'quality',
          severity: Number(scrapRate.value) > 5 ? 'critical' : 'warning',
          title: 'Taxa de Refugo Elevada',
          description: `A taxa de refugo atual é de ${scrapRate.value}%, acima da meta de 2%.`,
          impact: 'Refugo aumenta custos e reduz produtividade.',
          recommendation: 'Investigar causas principais de refugo e revisar parâmetros de processo.',
          metadata: { scrap_rate: scrapRate.value },
        });
      }

      const reworkRate = await industrialAnalyticsEngine.getKPI({
        domain: 'quality',
        kpiName: 'rework_rate',
        tenantId,
      });

      if (Number(reworkRate.value) > 3) {
        insights.push({
          domain: 'quality',
          severity: 'warning',
          title: 'Taxa de Retrabalho Elevada',
          description: `A taxa de retrabalho é de ${reworkRate.value}%.`,
          impact: 'Retrabalho aumenta custos e reduz capacidade.',
          recommendation: 'Treinar operadores e revisar instruções de trabalho.',
          metadata: { rework_rate: reworkRate.value },
        });
      }

      const nonConformities = await industrialAnalyticsEngine.getKPI({
        domain: 'quality',
        kpiName: 'non_conformity_count',
        tenantId,
      });

      if (Number(nonConformities.value) > 5) {
        insights.push({
          domain: 'quality',
          severity: 'warning',
          title: 'Muitas Não Conformidades Abertas',
          description: `Existem ${nonConformities.value} não conformidades aguardando resolução.`,
          impact: 'Não conformidades não tratadas podem indicar problemas recorrentes.',
          recommendation: 'Priorizar resolução de não conformidades críticas.',
          metadata: { non_conformity_count: nonConformities.value },
        });
      }
    } catch (error) {
      console.error('Error generating quality insights:', error);
    }

    return insights;
  }

  private async generateSupplierInsights(tenantId?: string): Promise<Insight[]> {
    const insights: Insight[] = [];

    try {
      const criticalSuppliers = await industrialAnalyticsEngine.getKPI({
        domain: 'supplier',
        kpiName: 'critical_suppliers',
        tenantId,
      });

      if (Number(criticalSuppliers.value) > 0) {
        insights.push({
          domain: 'supplier',
          severity: 'warning',
          title: 'Fornecedores com Performance Crítica',
          description: `${criticalSuppliers.value} fornecedores possuem performance abaixo de 70%.`,
          impact: 'Fornecedores críticos representam risco para cadeia de suprimentos.',
          recommendation: 'Revisar contratos e buscar fornecedores alternativos.',
          metadata: { critical_suppliers: criticalSuppliers.value },
        });
      }

      const delayedDeliveries = await industrialAnalyticsEngine.getKPI({
        domain: 'supplier',
        kpiName: 'delayed_deliveries_count',
        tenantId,
      });

      if (Number(delayedDeliveries.value) > 3) {
        insights.push({
          domain: 'supplier',
          severity: 'warning',
          title: 'Entregas de Fornecedores Atrasadas',
          description: `${delayedDeliveries.value} entregas estão atrasadas.`,
          impact: 'Atrasos impactam planejamento de produção.',
          recommendation: 'Contactar fornecedores e revisar lead times.',
          metadata: { delayed_deliveries_count: delayedDeliveries.value },
        });
      }
    } catch (error) {
      console.error('Error generating supplier insights:', error);
    }

    return insights;
  }

  private async generateFinancialInsights(tenantId?: string): Promise<Insight[]> {
    const insights: Insight[] = [];

    try {
      const profitMargin = await industrialAnalyticsEngine.getKPI({
        domain: 'financial',
        kpiName: 'profit_margin',
        tenantId,
      });

      if (Number(profitMargin.value) < 15) {
        insights.push({
          domain: 'financial',
          severity: Number(profitMargin.value) < 10 ? 'critical' : 'warning',
          title: 'Margem de Lucro Abaixo do Esperado',
          description: `A margem de lucro média é de ${profitMargin.value}%, abaixo da meta de 15%.`,
          impact: 'Margem baixa compromete rentabilidade do negócio.',
          recommendation: 'Revisar estrutura de custos e avaliar aumento de preços.',
          metadata: { profit_margin: profitMargin.value },
        });
      }
    } catch (error) {
      console.error('Error generating financial insights:', error);
    }

    return insights;
  }

  private async persistInsights(insights: Insight[], tenantId?: string): Promise<void> {
    try {
      for (const insight of insights) {
        // Check if similar insight already exists and is unresolved
        const { data: existing } = await supabase
          .from('copilot_insights')
          .select('id')
          .eq('domain', insight.domain)
          .eq('title', insight.title)
          .eq('resolved', false)
          .eq('tenant_id', tenantId || null)
          .limit(1);

        if (existing && existing.length > 0) {
          // Update existing insight
          await supabase
            .from('copilot_insights')
            .update({
              description: insight.description,
              impact: insight.impact,
              recommendation: insight.recommendation,
              metadata: insight.metadata,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing[0].id);
        } else {
          // Insert new insight
          await supabase
            .from('copilot_insights')
            .insert({
              ...insight,
              tenant_id: tenantId,
              created_at: new Date().toISOString(),
            });
        }
      }
    } catch (error) {
      console.error('Error persisting insights:', error);
    }
  }
}

export const insightGenerationEngine = new InsightGenerationEngine();
