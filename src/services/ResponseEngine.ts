/**
 * ResponseEngine - Generate responses without AI
 * 
 * This engine generates natural language responses based on KPIs, insights, and analytics
 * without using AI. It uses templates and structured data to create human-readable responses.
 */

import { industrialAnalyticsEngine } from './IndustrialAnalyticsEngine';
import { insightGenerationEngine } from './InsightGenerationEngine';
import { responseTemplateLibrary } from './ResponseTemplateLibrary';
import type { Domain } from './CopilotIntentRouter';

export interface ResponseRequest {
  query: string;
  domain: Domain;
  tenantId?: string;
  entities?: Array<{ type: string; value: string }>;
}

export interface ResponseResult {
  message: string;
  strategy: 'kpi' | 'insight' | 'analytics' | 'template' | 'ai';
  sources: string[];
  confidence: number;
  metadata?: Record<string, any>;
}

export class ResponseEngine {
  /**
   * Generate a response without AI
   */
  async generateResponse(request: ResponseRequest): Promise<ResponseResult> {
    const { query, domain, tenantId, entities } = request;

    // Try to use a template first
    const templateResponse = await this.tryTemplateResponse(query, domain, tenantId);
    if (templateResponse) {
      return templateResponse;
    }

    // Try to use KPI data
    const kpiResponse = await this.tryKPIResponse(query, domain, tenantId);
    if (kpiResponse) {
      return kpiResponse;
    }

    // Try to use existing insights
    const insightResponse = await this.tryInsightResponse(query, domain, tenantId);
    if (insightResponse) {
      return insightResponse;
    }

    // Fall back to analytics
    const analyticsResponse = await this.tryAnalyticsResponse(query, domain, tenantId);
    if (analyticsResponse) {
      return analyticsResponse;
    }

    // If all else fails, return a generic response
    return {
      message: this.generateGenericResponse(query, domain),
      strategy: 'template',
      sources: [],
      confidence: 0.5,
    };
  }

  private async tryTemplateResponse(
    query: string,
    domain: Domain,
    tenantId?: string
  ): Promise<ResponseResult | null> {
    const template = responseTemplateLibrary.getTemplate(query, domain);
    if (!template) return null;

    // Get data needed for template
    const data = await this.getTemplateData(template, domain, tenantId);
    
    // Generate response from template
    const message = this.renderTemplate(template, data);

    return {
      message,
      strategy: 'template',
      sources: [domain],
      confidence: 0.9,
      metadata: { template: template.name },
    };
  }

  private async tryKPIResponse(
    query: string,
    domain: Domain,
    tenantId?: string
  ): Promise<ResponseResult | null> {
    const kpiName = this.extractKPIName(query, domain);
    if (!kpiName) return null;

    try {
      const kpi = await industrialAnalyticsEngine.getKPI({
        domain,
        kpiName,
        tenantId,
      });

      const message = this.formatKPIResponse(kpi, domain);

      return {
        message,
        strategy: 'kpi',
        sources: [domain],
        confidence: 0.95,
        metadata: { kpiName, kpiValue: kpi.value },
      };
    } catch (error) {
      console.error('Error getting KPI response:', error);
      return null;
    }
  }

  private async tryInsightResponse(
    query: string,
    domain: Domain,
    tenantId?: string
  ): Promise<ResponseResult | null> {
    const insights = await insightGenerationEngine.getActiveInsights(tenantId, domain);
    
    if (insights.length === 0) return null;

    // Filter insights relevant to query
    const relevantInsights = this.filterInsightsByQuery(insights, query);
    
    if (relevantInsights.length === 0) return null;

    const message = this.formatInsightsResponse(relevantInsights, domain);

    return {
      message,
      strategy: 'insight',
      sources: [domain],
      confidence: 0.85,
      metadata: { insightCount: relevantInsights.length },
    };
  }

  private async tryAnalyticsResponse(
    query: string,
    domain: Domain,
    tenantId?: string
  ): Promise<ResponseResult | null> {
    try {
      const result = await industrialAnalyticsEngine.executeAnalytics({
        domain,
        query,
        tenantId,
      });

      const message = this.formatAnalyticsResponse(result, domain);

      return {
        message,
        strategy: 'analytics',
        sources: [domain],
        confidence: 0.8,
        metadata: { insightsCount: result.insights.length },
      };
    } catch (error) {
      console.error('Error getting analytics response:', error);
      return null;
    }
  }

  private async getTemplateData(
    template: any,
    domain: Domain,
    tenantId?: string
  ): Promise<Record<string, any>> {
    const data: Record<string, any> = {};

    if (template.requiredKPIs) {
      for (const kpiName of template.requiredKPIs) {
        try {
          const kpi = await industrialAnalyticsEngine.getKPI({
            domain,
            kpiName,
            tenantId,
          });
          data[kpiName] = kpi.value;
        } catch (error) {
          data[kpiName] = null;
        }
      }
    }

    return data;
  }

  private renderTemplate(template: any, data: Record<string, any>): string {
    let message = template.message;

    // Replace placeholders with actual data
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      message = message.replace(new RegExp(placeholder, 'g'), String(value || 'N/A'));
    }

    return message;
  }

  private extractKPIName(query: string, domain: Domain): string | null {
    const lowerQuery = query.toLowerCase();

    const kpiKeywords: Partial<Record<Domain, Record<string, string>>> = {
      production: {
        'atrasada': 'delayed_orders_count',
        'op': 'open_orders_count',
        'eficiência': 'production_efficiency',
        'capacidade': 'capacity_utilization',
      },
      inventory: {
        'crítico': 'critical_materials_count',
        'estoque': 'current_inventory_level',
        'giro': 'inventory_turnover',
      },
      mrp: {
        'comprar': 'pending_purchases_count',
        'cobertura': 'materials_below_coverage',
        'lead time': 'average_lead_time',
      },
      quality: {
        'refugo': 'scrap_rate',
        'retrabalho': 'rework_rate',
        'não conformidade': 'non_conformity_count',
      },
      supplier: {
        'atraso': 'delayed_deliveries_count',
        'performance': 'supplier_performance',
        'lead time': 'average_lead_time',
      },
      financial: {
        'margem': 'profit_margin',
        'custo': 'industrial_cost',
        'lucro': 'profitability',
      },
    };

    const domainKPIs = kpiKeywords[domain];
    if (!domainKPIs) return null;

    for (const [keyword, kpiName] of Object.entries(domainKPIs)) {
      if (lowerQuery.includes(keyword)) {
        return kpiName;
      }
    }

    return null;
  }

  private formatKPIResponse(kpi: any, domain: Domain): string {
    const value = kpi.value;
    const unit = kpi.unit || '';
    const trend = kpi.trend;

    let message = '';

    switch (domain) {
      case 'production':
        if (kpi.kpiName === 'delayed_orders_count') {
          message = `Existem ${value} ${unit} atrasadas. `;
          if (value > 0) {
            message += 'Recomenda-se priorizar as ordens com maior atraso.';
          }
        } else if (kpi.kpiName === 'open_orders_count') {
          message = `Existem ${value} ${unit} em andamento. `;
        } else if (kpi.kpiName === 'production_efficiency') {
          message = `A eficiência produtiva atual é de ${value}${unit}. `;
          if (value < 80) {
            message += 'Está abaixo da meta de 80%. Recomenda-se investigar paradas não planejadas.';
          } else {
            message += 'A eficiência está dentro da meta.';
          }
        } else if (kpi.kpiName === 'capacity_utilization') {
          message = `A utilização de capacidade é de ${value}${unit}. `;
          if (value > 90) {
            message += 'Está próxima do limite. Recomenda-se avaliar turno adicional.';
          }
        } else {
          message = `${kpi.kpiName}: ${value} ${unit}`;
        }
        break;

      case 'inventory':
        if (kpi.kpiName === 'critical_materials_count') {
          message = `Foram identificados ${value} ${unit} em situação crítica. `;
          if (value > 0) {
            message += 'Recomenda-se gerar pedidos de compra urgentes.';
          }
        } else if (kpi.kpiName === 'current_inventory_level') {
          message = `O nível atual de estoque é de ${value} ${unit}. `;
        } else if (kpi.kpiName === 'inventory_turnover') {
          message = `O giro de estoque anual é de ${value} ${unit}. `;
          if (value < 4) {
            message += 'Está abaixo do recomendado. Recomenda-se revisar políticas de estoque.';
          }
        } else {
          message = `${kpi.kpiName}: ${value} ${unit}`;
        }
        break;

      case 'quality':
        if (kpi.kpiName === 'scrap_rate') {
          message = `A taxa de refugo é de ${value}${unit}. `;
          if (value > 2) {
            message += 'Está acima da meta de 2%. Recomenda-se investigar as causas principais.';
          }
        } else if (kpi.kpiName === 'rework_rate') {
          message = `A taxa de retrabalho é de ${value}${unit}. `;
          if (value > 3) {
            message += 'Recomenda-se treinar operadores e revisar instruções de trabalho.';
          }
        } else if (kpi.kpiName === 'non_conformity_count') {
          message = `Existem ${value} ${unit} abertas aguardando resolução. `;
        } else {
          message = `${kpi.kpiName}: ${value} ${unit}`;
        }
        break;

      case 'financial':
        if (kpi.kpiName === 'profit_margin') {
          message = `A margem de lucro média é de ${value}${unit}. `;
          if (value < 15) {
            message += 'Está abaixo da meta de 15%. Recomenda-se revisar estrutura de custos.';
          }
        } else if (kpi.kpiName === 'industrial_cost') {
          message = `O custo industrial total é de R$ ${value}. `;
        } else {
          message = `${kpi.kpiName}: ${value} ${unit}`;
        }
        break;

      case 'supplier':
        if (kpi.kpiName === 'delayed_deliveries_count') {
          message = `Existem ${value} ${unit} atrasadas. `;
          if (value > 0) {
            message += 'Recomenda-se contactar os fornecedores.';
          }
        } else if (kpi.kpiName === 'average_lead_time') {
          message = `O lead time médio dos fornecedores é de ${value} ${unit}. `;
        } else if (kpi.kpiName === 'supplier_performance') {
          message = `A performance média dos fornecedores é de ${value}${unit}. `;
        } else {
          message = `${kpi.kpiName}: ${value} ${unit}`;
        }
        break;

      case 'mrp':
        if (kpi.kpiName === 'pending_purchases_count') {
          message = `Existem ${value} ${unit} pendentes. `;
        } else if (kpi.kpiName === 'materials_below_coverage') {
          message = `${value} ${unit} possuem cobertura insuficiente. `;
          if (value > 0) {
            message += 'Recomenda-se gerar pedidos de compra.';
          }
        } else {
          message = `${kpi.kpiName}: ${value} ${unit}`;
        }
        break;

      default:
        message = `${kpi.kpiName}: ${value} ${unit}`;
    }

    return message;
  }

  private filterInsightsByQuery(insights: any[], query: string): any[] {
    const lowerQuery = query.toLowerCase();
    
    return insights.filter(insight => {
      const titleMatch = insight.title.toLowerCase().includes(lowerQuery);
      const descMatch = insight.description.toLowerCase().includes(lowerQuery);
      return titleMatch || descMatch;
    });
  }

  private formatInsightsResponse(insights: any[], domain: Domain): string {
    if (insights.length === 0) {
      return 'Nenhum insight relevante encontrado.';
    }

    const critical = insights.filter(i => i.severity === 'critical');
    const warnings = insights.filter(i => i.severity === 'warning');
    const info = insights.filter(i => i.severity === 'info');

    let message = '';

    if (critical.length > 0) {
      message += `⚠️ **Crítico**: ${critical.length} issue(s) identificada(s).\n`;
      critical.slice(0, 3).forEach(insight => {
        message += `- ${insight.title}: ${insight.description}\n`;
      });
    }

    if (warnings.length > 0) {
      message += `⚡ **Alertas**: ${warnings.length} alerta(s).\n`;
      warnings.slice(0, 3).forEach(insight => {
        message += `- ${insight.title}: ${insight.description}\n`;
      });
    }

    if (info.length > 0) {
      message += `ℹ️ **Informações**: ${info.length} informação(ões).\n`;
    }

    return message;
  }

  private formatAnalyticsResponse(result: any, domain: Domain): string {
    let message = '';

    if (result.insights && result.insights.length > 0) {
      message += result.insights.join('\n') + '\n\n';
    }

    if (result.recommendations && result.recommendations.length > 0) {
      message += 'Recomendações:\n';
      result.recommendations.forEach((rec: string, i: number) => {
        message += `${i + 1}. ${rec}\n`;
      });
    }

    return message || 'Análise concluída.';
  }

  private generateGenericResponse(query: string, domain: Domain): string {
    const domainMessages: Partial<Record<Domain, string>> = {
      production: 'Não foi possível encontrar dados específicos de produção. Tente perguntar sobre OPs, eficiência ou capacidade.',
      inventory: 'Não foi possível encontrar dados específicos de estoque. Tente perguntar sobre materiais críticos ou níveis de estoque.',
      mrp: 'Não foi possível encontrar dados específicos de MRP. Tente perguntar sobre compras ou cobertura de materiais.',
      quality: 'Não foi possível encontrar dados específicos de qualidade. Tente perguntar sobre refugo ou não conformidades.',
      supplier: 'Não foi possível encontrar dados específicos de fornecedores. Tente perguntar sobre atrasos ou performance.',
      financial: 'Não foi possível encontrar dados específicos financeiros. Tente perguntar sobre margens ou custos.',
    };

    return domainMessages[domain] || 'Não foi possível processar a solicitação.';
  }
}

export const responseEngine = new ResponseEngine();
