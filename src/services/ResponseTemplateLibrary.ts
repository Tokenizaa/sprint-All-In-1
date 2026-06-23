/**
 * ResponseTemplateLibrary - Catalog of recurring question templates
 * 
 * Provides pre-defined response templates for common questions
 * This enables instant responses without AI for frequently asked questions
 */

import type { Domain } from './CopilotIntentRouter';

export interface ResponseTemplate {
  name: string;
  domain: Domain;
  keywords: string[];
  message: string;
  requiredKPIs?: string[];
}

export class ResponseTemplateLibrary {
  private templates: ResponseTemplate[] = [];

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Production templates
    this.templates.push({
      name: 'production_status_template',
      domain: 'production',
      keywords: ['status', 'produção', 'como está'],
      message: 'Status da Produção:\n- OPs abertas: {{open_orders_count}}\n- OPs atrasadas: {{delayed_orders_count}}\n- Eficiência: {{production_efficiency}}%\n- Capacidade utilizada: {{capacity_utilization}}%',
      requiredKPIs: ['open_orders_count', 'delayed_orders_count', 'production_efficiency', 'capacity_utilization'],
    });

    this.templates.push({
      name: 'delayed_orders_template',
      domain: 'production',
      keywords: ['atrasada', 'atraso', 'op atrasada'],
      message: 'Existem {{delayed_orders_count}} ordens de produção atrasadas. Destas, {{critical_delays_count}} possuem atraso superior a 5 dias. O setor de montagem concentra a maior parte dos atrasos.',
      requiredKPIs: ['delayed_orders_count'],
    });

    this.templates.push({
      name: 'capacity_template',
      domain: 'production',
      keywords: ['capacidade', 'produzir', 'throughput'],
      message: 'A capacidade produtiva atual está em {{capacity_utilization}}%. {{capacity_recommendation}}',
      requiredKPIs: ['capacity_utilization'],
    });

    // Inventory templates
    this.templates.push({
      name: 'critical_materials_template',
      domain: 'inventory',
      keywords: ['crítico', 'material crítico', 'abaixo do mínimo'],
      message: 'Foram identificados {{critical_materials_count}} materiais em situação crítica. Os itens mais urgentes possuem cobertura inferior a 3 dias de produção. Recomenda-se gerar pedidos de compra urgentes.',
      requiredKPIs: ['critical_materials_count'],
    });

    this.templates.push({
      name: 'availability_template',
      domain: 'inventory',
      keywords: ['disponibilidade', 'temos', 'estoque disponível'],
      message: 'O estoque atual é de {{current_inventory_level}} unidades. {{critical_materials_count}} materiais estão abaixo do mínimo.',
      requiredKPIs: ['current_inventory_level', 'critical_materials_count'],
    });

    // Quality templates
    this.templates.push({
      name: 'scrap_rate_template',
      domain: 'quality',
      keywords: ['refugo', 'taxa de refugo'],
      message: 'A taxa média de refugo do período é de {{scrap_rate}}%, {{scrap_trend}} em relação ao mês anterior.',
      requiredKPIs: ['scrap_rate'],
    });

    this.templates.push({
      name: 'defects_template',
      domain: 'quality',
      keywords: ['defeito', 'não conformidade', 'problema'],
      message: 'Existem {{non_conformity_count}} não conformidades abertas. As principais causas são relacionadas a {{main_defect_cause}}.',
      requiredKPIs: ['non_conformity_count'],
    });

    // Financial templates
    this.templates.push({
      name: 'cost_template',
      domain: 'financial',
      keywords: ['custo', 'gasto', 'despesa'],
      message: 'O custo industrial total do período é de R$ {{industrial_cost}}. A estrutura de custos é composta por: {{cost_breakdown}}.',
      requiredKPIs: ['industrial_cost'],
    });

    this.templates.push({
      name: 'margin_template',
      domain: 'financial',
      keywords: ['margem', 'lucro', 'rentabilidade'],
      message: 'A margem de lucro média é de {{profit_margin}}%. {{margin_recommendation}}',
      requiredKPIs: ['profit_margin'],
    });

    // Supplier templates
    this.templates.push({
      name: 'supplier_delays_template',
      domain: 'supplier',
      keywords: ['atraso', 'fornecedor atrasando', 'entrega'],
      message: 'Existem {{delayed_deliveries_count}} entregas de fornecedores atrasadas. Os fornecedores com mais atrasos são: {{top_delayed_suppliers}}.',
      requiredKPIs: ['delayed_deliveries_count'],
    });

    this.templates.push({
      name: 'supplier_performance_template',
      domain: 'supplier',
      keywords: ['performance', 'avaliação', 'nota'],
      message: 'A performance média dos fornecedores é de {{supplier_performance}}%. {{critical_suppliers_count}} fornecedores estão com performance crítica.',
      requiredKPIs: ['supplier_performance', 'critical_suppliers'],
    });

    // MRP templates
    this.templates.push({
      name: 'purchase_requirements_template',
      domain: 'mrp',
      keywords: ['comprar', 'pedido de compra', 'compra'],
      message: 'Materiais que precisam ser comprados: {{materials_below_coverage}}. O valor total estimado é R$ {{estimated_purchase_value}}.',
      requiredKPIs: ['materials_below_coverage'],
    });
  }

  /**
   * Get a template matching the query and domain
   */
  getTemplate(query: string, domain: Domain): ResponseTemplate | null {
    const lowerQuery = query.toLowerCase();

    // Find templates for the domain
    const domainTemplates = this.templates.filter(t => t.domain === domain);

    // Find matching template based on keywords
    for (const template of domainTemplates) {
      const matchCount = template.keywords.filter(keyword => 
        lowerQuery.includes(keyword.toLowerCase())
      ).length;

      if (matchCount > 0) {
        return template;
      }
    }

    // Return first template for domain if no keyword match
    return domainTemplates[0] || null;
  }

  /**
   * Get all templates for a domain
   */
  getTemplatesForDomain(domain: Domain): ResponseTemplate[] {
    return this.templates.filter(t => t.domain === domain);
  }

  /**
   * Get all templates
   */
  getAllTemplates(): ResponseTemplate[] {
    return [...this.templates];
  }

  /**
   * Add a custom template
   */
  addTemplate(template: ResponseTemplate): void {
    this.templates.push(template);
  }

  /**
   * Remove a template by name
   */
  removeTemplate(name: string): void {
    this.templates = this.templates.filter(t => t.name !== name);
  }
}

export const responseTemplateLibrary = new ResponseTemplateLibrary();
