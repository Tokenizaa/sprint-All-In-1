/**
 * CopilotIntentRouter - Enhanced intent classification for industrial queries
 * 
 * Classifies user questions into domains and response strategies to minimize AI dependency
 * Target: 85-90% of responses without AI
 */

export type ResponseStrategy = 
  | 'kpi_precomputed' 
  | 'insight_existing' 
  | 'analytics' 
  | 'report_structured' 
  | 'template' 
  | 'ai';

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

export interface IntentClassification {
  domain: Domain;
  strategy: ResponseStrategy;
  confidence: number;
  entities: Entity[];
  requiresAI: boolean;
}

export interface Entity {
  type: 'product' | 'material' | 'supplier' | 'order' | 'lot' | 'bom' | 'equipment' | 'employee';
  value: string;
  confidence: number;
}

export interface IntentRouterResult {
  classification: IntentClassification;
  suggestedService: string | undefined;
  suggestedKPI: string | undefined;
  suggestedTemplate: string | undefined;
}

export class CopilotIntentRouter {
  private domainPatterns: Map<Domain, RegExp[]> = new Map();
  private strategyPatterns: Map<ResponseStrategy, RegExp[]> = new Map();

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // Domain patterns
    this.domainPatterns.set('production', [
      /op|ordem\s+de\s+produção|produção|fabricação|montagem|corte|costura|embalagem/i,
      /capacidade|eficiência|produtividade|gargalo|throughput/i,
      /chão\s+de\s+fábrica|linha\s+de\s+produção|turno/i,
    ]);

    this.domainPatterns.set('pcp', [
      /pcp|planejamento|controle\s+de\s+produção|sequenciamento/i,
      /programação|agenda|cronograma/i,
    ]);

    this.domainPatterns.set('mrp', [
      /mrp|material\s+requirements|necessidade\s+de\s+material/i,
      /comprar|pedido\s+de\s+compra|requisição/i,
      /cobertura|lead\s+time|previsão\s+de\s+consumo/i,
    ]);

    this.domainPatterns.set('inventory', [
      /estoque|material|insumo|matéria[-\s]?prima/i,
      /reserva|disponível|crítico|mínimo|máximo/i,
      /giro|movimentação|entrada|saída/i,
    ]);

    this.domainPatterns.set('quality', [
      /qualidade|refugo|retrabalho|defeito|não\s+conformidade/i,
      /inspeção|teste|amostra|lote/i,
      /iso|norma|padrão/i,
    ]);

    this.domainPatterns.set('financial', [
      /custo|margem|lucro|rentabilidade|roi/i,
      /preço|venda|receita|despesa/i,
      /financeiro|contábil|orçamento/i,
    ]);

    this.domainPatterns.set('supplier', [
      /fornecedor|compra|pedido|entrega/i,
      /atraso|lead\s+time|performance|avaliação/i,
      /crítico|risco|confiabilidade/i,
    ]);

    this.domainPatterns.set('product', [
      /produto|sku|modelo|linha\s+comercial/i,
      /bom|bill\s+of\s+materials|estrutura|componente/i,
      /especificação|característica/i,
    ]);

    this.domainPatterns.set('lot', [
      /lote|batch|partida/i,
      /rastreabilidade|traçabilidade|origem/i,
      /validade|data\s+de\s+fabricação/i,
    ]);

    this.domainPatterns.set('traceability', [
      /rastre|traç|origem|histórico/i,
      /onde|quando|como\s+foi\s+feito/i,
    ]);

    // Strategy patterns - prioritize non-AI strategies
    this.strategyPatterns.set('kpi_precomputed', [
      /quantos?|quantidade|número|total|contar/i,
      /taxa|índice|percentual|%/i,
      /média|mediana|soma/i,
      /status|estado|situação/i,
      /kpi|indicador|métrica/i,
    ]);

    this.strategyPatterns.set('insight_existing', [
      /problema|gargalo|crítico|risco|alerta/i,
      /atrasado|pendente|bloqueado/i,
      /o\s+que\s+está\s+errado|qual\s+o\s+problema/i,
    ]);

    this.strategyPatterns.set('analytics', [
      /comparar|evolução|tendência|histórico/i,
      /por\s+(setor|período|turno|fornecedor)/i,
      /ranking|top\s+\d+|piores/i,
      /distribuição|proporção/i,
    ]);

    this.strategyPatterns.set('report_structured', [
      /relatório|lista|detalhe|informação/i,
      /mostrar|exibir|buscar|listar/i,
      /dados\s+do|especificações/i,
    ]);

    this.strategyPatterns.set('template', [
      /como\s+está|qual\s+o\s+status|o\s+que\s+temos/i,
      /quais\s+são|quais\s+estão/i,
      /resumo|visão\s+geral/i,
    ]);

    this.strategyPatterns.set('ai', [
      /por\s+que|qual\s+a\s+causa|diagnosticar/i,
      /recomendar|sugerir|como\s+melhorar|otimizar/i,
      /prever|previsão|futuro|estimar|projec/i,
      /explicar|entender|interpretar/i,
      /planejar|simular|cenário/i,
      /analisar\s+profundamente|insight\s+avançado/i,
    ]);
  }

  classify(query: string): IntentRouterResult {
    const lowerQuery = query.toLowerCase();

    // 1. Classify domain
    const domain = this.classifyDomain(lowerQuery);

    // 2. Classify strategy (prioritize non-AI)
    const strategy = this.classifyStrategy(lowerQuery);

    // 3. Extract entities
    const entities = this.extractEntities(query);

    // 4. Determine if AI is required
    const requiresAI = strategy === 'ai';

    // 5. Suggest service/template/KPI
    const suggestedService = this.suggestService(domain, strategy);
    const suggestedKPI = this.suggestKPI(domain, lowerQuery);
    const suggestedTemplate = this.suggestTemplate(domain, lowerQuery);

    const classification: IntentClassification = {
      domain,
      strategy,
      confidence: this.calculateConfidence(domain, strategy, lowerQuery),
      entities,
      requiresAI,
    };

    return {
      classification,
      suggestedService,
      suggestedKPI,
      suggestedTemplate,
    };
  }

  private classifyDomain(query: string): Domain {
    let bestDomain: Domain = 'general';
    let maxMatches = 0;

    for (const [domain, patterns] of this.domainPatterns.entries()) {
      const matches = patterns.filter(pattern => pattern.test(query)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestDomain = domain;
      }
    }

    return bestDomain;
  }

  private classifyStrategy(query: string): ResponseStrategy {
    // Priority order: kpi_precomputed > insight_existing > analytics > report_structured > template > ai
    const priority: ResponseStrategy[] = [
      'kpi_precomputed',
      'insight_existing',
      'analytics',
      'report_structured',
      'template',
      'ai',
    ];

    for (const strategy of priority) {
      const patterns = this.strategyPatterns.get(strategy);
      if (patterns && patterns.some(pattern => pattern.test(query))) {
        return strategy;
      }
    }

    return 'template'; // Default to template (non-AI)
  }

  private extractEntities(query: string): Entity[] {
    const entities: Entity[] = [];

    // Product
    const productMatch = query.match(/produto\s+[:\s]+([^\s,]+)/i);
    if (productMatch) {
      entities.push({ type: 'product', value: productMatch[1], confidence: 0.8 });
    }

    // Order/OP
    const orderMatch = query.match(/op[-\s]?(\d+)/i);
    if (orderMatch) {
      entities.push({ type: 'order', value: orderMatch[1], confidence: 0.9 });
    }

    // Material
    const materialMatch = query.match(/material\s+[:\s]+([^\s,]+)/i);
    if (materialMatch) {
      entities.push({ type: 'material', value: materialMatch[1], confidence: 0.8 });
    }

    // Supplier
    const supplierMatch = query.match(/fornecedor\s+[:\s]+([^\s,]+)/i);
    if (supplierMatch) {
      entities.push({ type: 'supplier', value: supplierMatch[1], confidence: 0.8 });
    }

    // Lot
    const lotMatch = query.match(/lote\s+[:\s]+([^\s,]+)/i);
    if (lotMatch) {
      entities.push({ type: 'lot', value: lotMatch[1], confidence: 0.9 });
    }

    return entities;
  }

  private calculateConfidence(domain: Domain, strategy: ResponseStrategy, query: string): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence if domain is not general
    if (domain !== 'general') {
      confidence += 0.1;
    }

    // Increase confidence if strategy is not AI
    if (strategy !== 'ai') {
      confidence += 0.1;
    }

    // Increase confidence if entities were found
    if (query.match(/:\s+\w+|:\d+/)) {
      confidence += 0.05;
    }

    return Math.min(confidence, 0.95);
  }

  private suggestService(domain: Domain, strategy: ResponseStrategy): string | undefined {
    const serviceMap: Partial<Record<Domain, string>> = {
      production: 'ProductionAnalyticsService',
      pcp: 'ProductionAnalyticsService',
      mrp: 'MRPAnalyticsService',
      inventory: 'InventoryAnalyticsService',
      quality: 'QualityAnalyticsService',
      financial: 'FinancialAnalyticsService',
      supplier: 'SupplierAnalyticsService',
      product: 'ProductService',
      lot: 'LotService',
      traceability: 'LotService',
    };

    return serviceMap[domain];
  }

  private suggestKPI(domain: Domain, query: string): string | undefined {
    const kpiMap: Record<Domain, Record<string, string>> = {
      production: {
        'atrasada': 'delayed_orders_count',
        'eficiência': 'production_efficiency',
        'capacidade': 'capacity_utilization',
        'op': 'open_orders_count',
      },
      pcp: {},
      mrp: {},
      inventory: {
        'crítico': 'critical_materials_count',
        'estoque': 'current_inventory_level',
        'giro': 'inventory_turnover',
      },
      quality: {
        'refugo': 'scrap_rate',
        'retrabalho': 'rework_rate',
        'não conformidade': 'non_conformity_count',
      },
      financial: {
        'margem': 'profit_margin',
        'custo': 'industrial_cost',
        'lucro': 'profitability',
      },
      supplier: {
        'atraso': 'delayed_deliveries_count',
        'lead time': 'average_lead_time',
        'performance': 'supplier_performance',
      },
      product: {},
      lot: {},
      traceability: {},
      general: {},
    };

    const domainKPIs = kpiMap[domain];
    if (!domainKPIs) return undefined;

    for (const [keyword, kpi] of Object.entries(domainKPIs)) {
      if (query.includes(keyword)) {
        return kpi;
      }
    }

    return undefined;
  }

  private suggestTemplate(domain: Domain, query: string): string | undefined {
    const templateMap: Record<Domain, Record<string, string>> = {
      production: {
        'status': 'production_status_template',
        'atraso': 'delayed_orders_template',
        'capacidade': 'capacity_template',
      },
      pcp: {},
      mrp: {},
      inventory: {
        'crítico': 'critical_materials_template',
        'disponibilidade': 'availability_template',
      },
      quality: {
        'refugo': 'scrap_rate_template',
        'defeito': 'defects_template',
      },
      financial: {
        'custo': 'cost_template',
        'margem': 'margin_template',
      },
      supplier: {
        'atraso': 'supplier_delays_template',
        'performance': 'supplier_performance_template',
      },
      product: {},
      lot: {},
      traceability: {},
      general: {},
    };

    const domainTemplates = templateMap[domain];
    if (!domainTemplates) return undefined;

    for (const [keyword, template] of Object.entries(domainTemplates)) {
      if (query.includes(keyword)) {
        return template;
      }
    }

    return undefined;
  }
}

export const copilotIntentRouter = new CopilotIntentRouter();
