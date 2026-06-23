import { kpiCalculator, OverallKPIs } from "./KPICalculator";

export interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'critical' | 'information';
  category: 'production' | 'inventory' | 'quality' | 'financial' | 'supplier';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  priority: number;
  actionable: boolean;
  suggestedActions?: string[];
  data: Record<string, any>;
  timestamp: string;
}

export interface InsightConfig {
  enableProductionInsights: boolean;
  enableInventoryInsights: boolean;
  enableQualityInsights: boolean;
  enableFinancialInsights: boolean;
  enableSupplierInsights: boolean;
  thresholdProductionCompletion: number;
  thresholdLowStockPercentage: number;
  thresholdScrapRate: number;
  thresholdCriticalSuppliers: number;
  thresholdNetMargin: number;
}

export class InsightGenerator {
  private config: InsightConfig = {
    enableProductionInsights: true,
    enableInventoryInsights: true,
    enableQualityInsights: true,
    enableFinancialInsights: true,
    enableSupplierInsights: true,
    thresholdProductionCompletion: 80,
    thresholdLowStockPercentage: 10,
    thresholdScrapRate: 5,
    thresholdCriticalSuppliers: 20,
    thresholdNetMargin: 10
  };
  
  async generateInsights(): Promise<Insight[]> {
    try {
      const kpis = await kpiCalculator.calculateOverallKPIs();
      const insights: Insight[] = [];
      
      if (this.config.enableProductionInsights) {
        insights.push(...this.generateProductionInsights(kpis));
      }
      
      if (this.config.enableInventoryInsights) {
        insights.push(...this.generateInventoryInsights(kpis));
      }
      
      if (this.config.enableQualityInsights) {
        insights.push(...this.generateQualityInsights(kpis));
      }
      
      if (this.config.enableFinancialInsights) {
        insights.push(...this.generateFinancialInsights(kpis));
      }
      
      if (this.config.enableSupplierInsights) {
        insights.push(...this.generateSupplierInsights(kpis));
      }
      
      // Ordenar por prioridade
      return insights.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
      return [];
    }
  }
  
  private generateProductionInsights(kpis: OverallKPIs): Insight[] {
    const insights: Insight[] = [];
    const prod = kpis.production;
    
    // Taxa de conclusão baixa
    if (prod.completionRate < this.config.thresholdProductionCompletion) {
      insights.push({
        id: this.generateId(),
        type: 'warning',
        category: 'production',
        title: 'Taxa de conclusão de ordens abaixo do esperado',
        description: `A taxa de conclusão de ordens de produção está em ${prod.completionRate.toFixed(1)}%, abaixo do alvo de ${this.config.thresholdProductionCompletion}%.`,
        impact: prod.completionRate < 50 ? 'high' : 'medium',
        priority: 80,
        actionable: true,
        suggestedActions: [
          'Revisar gargalos de produção',
          'Verificar disponibilidade de materiais',
          'Avaliar capacidade de equipamentos',
          'Revisar alocação de pessoal'
        ],
        data: {
          completionRate: prod.completionRate,
          target: this.config.thresholdProductionCompletion,
          totalOrders: prod.totalOrders,
          completedOrders: prod.completedOrders,
          pendingOrders: prod.pendingOrders
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Gargalos identificados
    if (prod.bottlenecks.length > 0) {
      insights.push({
        id: this.generateId(),
        type: 'critical',
        category: 'production',
        title: 'Gargalos de produção identificados',
        description: `Foram identificados ${prod.bottlenecks.length} gargalos na linha de produção que estão impactando a capacidade produtiva.`,
        impact: 'high',
        priority: 90,
        actionable: true,
        suggestedActions: [
          'Priorizar resolução de gargalos críticos',
          'Aumentar capacidade nos pontos de estrangulamento',
          'Rebalancear carga de trabalho',
          'Considerar turnos adicionais'
        ],
        data: {
          bottlenecks: prod.bottlenecks,
          efficiency: prod.efficiency,
          utilization: prod.utilization
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Alta eficiência (insight positivo)
    if (prod.efficiency > 90) {
      insights.push({
        id: this.generateId(),
        type: 'opportunity',
        category: 'production',
        title: 'Alta eficiência produtiva',
        description: `A eficiência produtiva está em ${prod.efficiency.toFixed(1)}%, indicando ótimo desempenho operacional.`,
        impact: 'medium',
        priority: 30,
        actionable: true,
        suggestedActions: [
          'Documentar práticas que levaram a alta eficiência',
          'Considerar aumento de volume de produção',
          'Compartilhar aprendizados com outras linhas'
        ],
        data: {
          efficiency: prod.efficiency,
          utilization: prod.utilization,
          completionRate: prod.completionRate
        },
        timestamp: new Date().toISOString()
      });
    }
    
    return insights;
  }
  
  private generateInventoryInsights(kpis: OverallKPIs): Insight[] {
    const insights: Insight[] = [];
    const inv = kpis.inventory;
    
    // Estoque baixo
    const lowStockPercentage = inv.totalItems > 0 
      ? (inv.lowStockItems / inv.totalItems) * 100 
      : 0;
    
    if (lowStockPercentage > this.config.thresholdLowStockPercentage) {
      insights.push({
        id: this.generateId(),
        type: 'warning',
        category: 'inventory',
        title: 'Alta porcentagem de itens com estoque baixo',
        description: `${inv.lowStockItems} itens (${lowStockPercentage.toFixed(1)}%) estão com estoque abaixo do mínimo, o que pode impactar a produção.`,
        impact: lowStockPercentage > 20 ? 'high' : 'medium',
        priority: 75,
        actionable: true,
        suggestedActions: [
          'Gerar pedidos de compra urgentes',
          'Revisar políticas de estoque mínimo',
          'Avaliar lead times de fornecedores',
          'Considerar estoque de segurança'
        ],
        data: {
          lowStockItems: inv.lowStockItems,
          totalItems: inv.totalItems,
          lowStockPercentage,
          categories: inv.categories
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Giro de estoque baixo
    if (inv.stockTurnover < 4) {
      insights.push({
        id: this.generateId(),
        type: 'information',
        category: 'inventory',
        title: 'Giro de estoque abaixo do ideal',
        description: `O giro de estoque está em ${inv.stockTurnover.toFixed(1)}x ao ano, abaixo do ideal de 4x ou mais. Isso indica capital parado.`,
        impact: 'medium',
        priority: 40,
        actionable: true,
        suggestedActions: [
          'Revisar níveis de estoque',
          'Implementar Just-in-Time onde possível',
          'Negociar melhores lead times',
          'Avaliar obsolescência'
        ],
        data: {
          stockTurnover: inv.stockTurnover,
          averageDaysInStock: inv.averageDaysInStock,
          inventoryValue: inv.inventoryValue
        },
        timestamp: new Date().toISOString()
      });
    }
    
    return insights;
  }
  
  private generateQualityInsights(kpis: OverallKPIs): Insight[] {
    const insights: Insight[] = [];
    const qual = kpis.quality;
    
    // Taxa de refugo alta
    if (qual.scrapRate > this.config.thresholdScrapRate) {
      insights.push({
        id: this.generateId(),
        type: 'critical',
        category: 'quality',
        title: 'Taxa de refugo acima do aceitável',
        description: `A taxa de refugo está em ${qual.scrapRate.toFixed(2)}%, acima do limite de ${this.config.thresholdScrapRate}%.`,
        impact: qual.scrapRate > 10 ? 'high' : 'medium',
        priority: 85,
        actionable: true,
        suggestedActions: [
          'Investigar causas raiz dos defeitos mais comuns',
          'Revisar processos de qualidade',
          'Treinar equipe em pontos críticos',
          'Implementar Poka-Yoke'
        ],
        data: {
          scrapRate: qual.scrapRate,
          threshold: this.config.thresholdScrapRate,
          commonDefects: qual.commonDefects,
          passRate: qual.passRate
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Defeitos comuns
    if (qual.commonDefects.length > 0) {
      const topDefect = qual.commonDefects[0];
      if (topDefect.percentage > 30) {
        insights.push({
          id: this.generateId(),
          type: 'warning',
          category: 'quality',
          title: `Defeito predominante: ${topDefect.defect}`,
          description: `O defeito "${topDefect.defect}" representa ${topDefect.percentage.toFixed(1)}% de todos os defeitos registrados.`,
          impact: 'medium',
          priority: 70,
          actionable: true,
          suggestedActions: [
            'Investigar causa raiz específica deste defeito',
            'Implementar ação corretiva imediata',
            'Monitorar tendência deste defeito',
            'Revisar processo específico'
          ],
          data: {
            topDefect,
            allDefects: qual.commonDefects
          },
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Alta taxa de aprovação (insight positivo)
    if (qual.passRate > 95) {
      insights.push({
        id: this.generateId(),
        type: 'opportunity',
        category: 'quality',
        title: 'Excelente taxa de aprovação',
        description: `A taxa de aprovação está em ${qual.passRate.toFixed(1)}%, indicando excelente controle de qualidade.`,
        impact: 'low',
        priority: 25,
        actionable: true,
        suggestedActions: [
          'Documentar práticas de qualidade',
          'Considerar redução de inspeções (sampling)',
          'Compartilhar práticas com outras áreas'
        ],
        data: {
          passRate: qual.passRate,
          firstPassYield: qual.firstPassYield,
          scrapRate: qual.scrapRate
        },
        timestamp: new Date().toISOString()
      });
    }
    
    return insights;
  }
  
  private generateFinancialInsights(kpis: OverallKPIs): Insight[] {
    const insights: Insight[] = [];
    const fin = kpis.financial;
    
    // Margem líquida baixa
    if (fin.netMargin < this.config.thresholdNetMargin) {
      insights.push({
        id: this.generateId(),
        type: 'warning',
        category: 'financial',
        title: 'Margem líquida abaixo do alvo',
        description: `A margem líquida está em ${fin.netMargin.toFixed(1)}%, abaixo do alvo de ${this.config.thresholdNetMargin}%.`,
        impact: fin.netMargin < 5 ? 'high' : 'medium',
        priority: 80,
        actionable: true,
        suggestedActions: [
          'Revisar estrutura de custos',
          'Aumentar preços se possível',
          'Reduzir desperdícios',
          'Otimizar mix de produtos'
        ],
        data: {
          netMargin: fin.netMargin,
          target: this.config.thresholdNetMargin,
          grossMargin: fin.grossMargin,
          totalRevenue: fin.totalRevenue,
          totalCost: fin.totalCost
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Custo de material alto
    if (fin.materialCostPercentage > 60) {
      insights.push({
        id: this.generateId(),
        type: 'information',
        category: 'financial',
        title: 'Custo de materiais representa grande parte do custo total',
        description: `Os materiais representam ${fin.materialCostPercentage.toFixed(1)}% do custo total de produção.`,
        impact: 'medium',
        priority: 50,
        actionable: true,
        suggestedActions: [
          'Negociar melhores preços com fornecedores',
          'Buscar alternativas de materiais',
          'Otimizar BOM para reduzir material',
          'Considerar produção em maior escala'
        ],
        data: {
          materialCostPercentage: fin.materialCostPercentage,
          laborCostPercentage: fin.laborCostPercentage,
          productionCostPerUnit: fin.productionCostPerUnit
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Margem líquida alta (insight positivo)
    if (fin.netMargin > 20) {
      insights.push({
        id: this.generateId(),
        type: 'opportunity',
        category: 'financial',
        title: 'Excelente margem líquida',
        description: `A margem líquida está em ${fin.netMargin.toFixed(1)}%, indicando excelente rentabilidade.`,
        impact: 'medium',
        priority: 35,
        actionable: true,
        suggestedActions: [
          'Considerar reinvestimento em expansão',
          'Aumentar participação de mercado',
          'Desenvolver novos produtos'
        ],
        data: {
          netMargin: fin.netMargin,
          grossMargin: fin.grossMargin,
          totalRevenue: fin.totalRevenue
        },
        timestamp: new Date().toISOString()
      });
    }
    
    return insights;
  }
  
  private generateSupplierInsights(kpis: OverallKPIs): Insight[] {
    const insights: Insight[] = [];
    const sup = kpis.supplier;
    
    // Alta porcentagem de fornecedores críticos
    const criticalPercentage = sup.totalSuppliers > 0 
      ? (sup.criticalSuppliers / sup.totalSuppliers) * 100 
      : 0;
    
    if (criticalPercentage > this.config.thresholdCriticalSuppliers) {
      insights.push({
        id: this.generateId(),
        type: 'warning',
        category: 'supplier',
        title: 'Alta porcentagem de fornecedores críticos',
        description: `${sup.criticalSuppliers} fornecedores (${criticalPercentage.toFixed(1)}%) são considerados críticos, representando risco de abastecimento.`,
        impact: 'high',
        priority: 75,
        actionable: true,
        suggestedActions: [
          'Diversificar base de fornecedores',
          'Desenvolver fornecedores alternativos',
          'Negociar melhores lead times',
          'Aumentar estoque de segurança'
        ],
        data: {
          criticalSuppliers: sup.criticalSuppliers,
          totalSuppliers: sup.totalSuppliers,
          criticalPercentage,
          averageLeadTime: sup.averageLeadTime,
          leadTimeByCategory: sup.leadTimeByCategory
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Lead time médio alto
    if (sup.averageLeadTime > 30) {
      insights.push({
        id: this.generateId(),
        type: 'information',
        category: 'supplier',
        title: 'Lead time médio de fornecedores alto',
        description: `O lead time médio dos fornecedores é de ${sup.averageLeadTime.toFixed(1)} dias, o que pode impactar a agilidade da produção.`,
        impact: 'medium',
        priority: 45,
        actionable: true,
        suggestedActions: [
          'Negociar redução de lead times',
          'Buscar fornecedores locais',
          'Implementar VMI (Vendor Managed Inventory)',
          'Aumentar estoque de segurança'
        ],
        data: {
          averageLeadTime: sup.averageLeadTime,
          leadTimeByCategory: sup.leadTimeByCategory
        },
        timestamp: new Date().toISOString()
      });
    }
    
    return insights;
  }
  
  updateConfig(config: Partial<InsightConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  getConfig(): InsightConfig {
    return { ...this.config };
  }
  
  private generateId(): string {
    return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const insightGenerator = new InsightGenerator();
