import type { ChatMessage, AIContext } from "./types";
import type { Insight } from "./InsightGenerator";
import type { Alert } from "./AlertEngine";
import type { OverallKPIs } from "./KPICalculator";

export interface ResponseContext {
  query: string;
  queryType: string;
  strategy: string;
  executionTime: number;
  toolsUsed: string[];
  insights?: Insight[];
  alerts?: Alert[];
  kpis?: OverallKPIs;
  conversationContext?: AIContext;
}

export interface ResponseOptions {
  includeRoutingInfo?: boolean;
  includeInsights?: boolean;
  includeAlerts?: boolean;
  includeKPIs?: boolean;
  includeSuggestions?: boolean;
  format: 'text' | 'markdown' | 'json';
  language: 'pt-BR' | 'en-US';
}

export interface BuiltResponse {
  content: string;
  metadata: {
    queryType: string;
    strategy: string;
    executionTime: number;
    toolsUsed: string[];
    hasInsights: boolean;
    hasAlerts: boolean;
    hasKPIs: boolean;
    timestamp: string;
  };
  attachments?: {
    insights?: Insight[];
    alerts?: Alert[];
    kpis?: OverallKPIs;
  };
}

export class ResponseBuilder {
  private defaultOptions: ResponseOptions = {
    includeRoutingInfo: false,
    includeInsights: false,
    includeAlerts: false,
    includeKPIs: false,
    includeSuggestions: true,
    format: 'markdown',
    language: 'pt-BR'
  };
  
  buildResponse(
    message: string,
    context: ResponseContext,
    options?: Partial<ResponseOptions>
  ): BuiltResponse {
    const opts = { ...this.defaultOptions, ...options };
    
    let content = message;
    
    // Adicionar informações de roteamento se solicitado
    if (opts.includeRoutingInfo) {
      content = this.addRoutingInfo(content, context);
    }
    
    // Adicionar insights se solicitado
    if (opts.includeInsights && context.insights && context.insights.length > 0) {
      content = this.addInsights(content, context.insights, opts.format, opts.language);
    }
    
    // Adicionar alertas se solicitado
    if (opts.includeAlerts && context.alerts && context.alerts.length > 0) {
      content = this.addAlerts(content, context.alerts, opts.format, opts.language);
    }
    
    // Adicionar KPIs se solicitado
    if (opts.includeKPIs && context.kpis) {
      content = this.addKPIs(content, context.kpis, opts.format, opts.language);
    }
    
    // Adicionar sugestões se solicitado
    if (opts.includeSuggestions) {
      content = this.addSuggestions(content, context, opts.language);
    }
    
    return {
      content,
      metadata: {
        queryType: context.queryType,
        strategy: context.strategy,
        executionTime: context.executionTime,
        toolsUsed: context.toolsUsed,
        hasInsights: !!(context.insights && context.insights.length > 0),
        hasAlerts: !!(context.alerts && context.alerts.length > 0),
        hasKPIs: !!context.kpis,
        timestamp: new Date().toISOString()
      },
      attachments: {
        insights: opts.includeInsights ? context.insights : undefined,
        alerts: opts.includeAlerts ? context.alerts : undefined,
        kpis: opts.includeKPIs ? context.kpis : undefined
      }
    };
  }
  
  buildErrorResponse(error: string, context?: ResponseContext): BuiltResponse {
    const errorMessage = this.formatErrorMessage(error, 'pt-BR');
    
    return {
      content: errorMessage,
      metadata: {
        queryType: context?.queryType || 'unknown',
        strategy: context?.strategy || 'unknown',
        executionTime: context?.executionTime || 0,
        toolsUsed: context?.toolsUsed || [],
        hasInsights: false,
        hasAlerts: false,
        hasKPIs: false,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  buildStreamingChunk(chunk: string, isComplete: boolean): string {
    return chunk;
  }
  
  private addRoutingInfo(content: string, context: ResponseContext): string {
    const routingInfo = `
---
📊 **Informações de Processamento**
- **Tipo de Query:** ${context.queryType}
- **Estratégia:** ${context.strategy}
- **Tempo de Execução:** ${context.executionTime}ms
- **Ferramentas Usadas:** ${context.toolsUsed.length > 0 ? context.toolsUsed.join(', ') : 'Nenhuma'}
---
`;
    
    return content + routingInfo;
  }
  
  private addInsights(
    content: string,
    insights: Insight[],
    format: 'text' | 'markdown' | 'json',
    language: 'pt-BR' | 'en-US'
  ): string {
    if (format === 'json') {
      return content;
    }
    
    const criticalInsights = insights.filter(i => i.type === 'critical');
    const warningInsights = insights.filter(i => i.type === 'warning');
    const opportunityInsights = insights.filter(i => i.type === 'opportunity');
    
    let insightsSection = '\n\n💡 **Insights Relevantes**\n';
    
    if (criticalInsights.length > 0) {
      insightsSection += '\n🚨 **Críticos:**\n';
      for (const insight of criticalInsights.slice(0, 3)) {
        insightsSection += `- ${insight.title}\n`;
      }
    }
    
    if (warningInsights.length > 0) {
      insightsSection += '\n⚠️ **Avisos:**\n';
      for (const insight of warningInsights.slice(0, 3)) {
        insightsSection += `- ${insight.title}\n`;
      }
    }
    
    if (opportunityInsights.length > 0) {
      insightsSection += '\n✨ **Oportunidades:**\n';
      for (const insight of opportunityInsights.slice(0, 2)) {
        insightsSection += `- ${insight.title}\n`;
      }
    }
    
    return content + insightsSection;
  }
  
  private addAlerts(
    content: string,
    alerts: Alert[],
    format: 'text' | 'markdown' | 'json',
    language: 'pt-BR' | 'en-US'
  ): string {
    if (format === 'json') {
      return content;
    }
    
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const highAlerts = alerts.filter(a => a.severity === 'high');
    
    let alertsSection = '\n\n🔔 **Alertas Ativos**\n';
    
    if (criticalAlerts.length > 0) {
      alertsSection += '\n🔴 **Críticos:**\n';
      for (const alert of criticalAlerts.slice(0, 3)) {
        alertsSection += `- ${alert.title}\n`;
      }
    }
    
    if (highAlerts.length > 0) {
      alertsSection += '\n🟠 **Altos:**\n';
      for (const alert of highAlerts.slice(0, 3)) {
        alertsSection += `- ${alert.title}\n`;
      }
    }
    
    return content + alertsSection;
  }
  
  private addKPIs(
    content: string,
    kpis: OverallKPIs,
    format: 'text' | 'markdown' | 'json',
    language: 'pt-BR' | 'en-US'
  ): string {
    if (format === 'json') {
      return content;
    }
    
    let kpisSection = '\n\n📈 **KPIs Principais**\n';
    kpisSection += `\n- **Saúde Geral:** ${kpis.overallHealth.toFixed(1)}/100`;
    kpisSection += `\n- **Taxa de Conclusão:** ${kpis.production.completionRate.toFixed(1)}%`;
    kpisSection += `\n- **Itens com Estoque Baixo:** ${kpis.inventory.lowStockItems}`;
    kpisSection += `\n- **Taxa de Refugo:** ${kpis.quality.scrapRate.toFixed(2)}%`;
    kpisSection += `\n- **Margem Líquida:** ${kpis.financial.netMargin.toFixed(1)}%`;
    kpisSection += `\n- **Fornecedores Críticos:** ${kpis.supplier.criticalSuppliers}`;
    
    return content + kpisSection;
  }
  
  private addSuggestions(
    content: string,
    context: ResponseContext,
    language: 'pt-BR' | 'en-US'
  ): string {
    const suggestions = this.generateSuggestions(context, language);
    
    if (suggestions.length === 0) {
      return content;
    }
    
    let suggestionsSection = '\n\n💭 **Sugestões Relacionadas**\n';
    
    for (const suggestion of suggestions.slice(0, 3)) {
      suggestionsSection += `- ${suggestion}\n`;
    }
    
    return content + suggestionsSection;
  }
  
  private generateSuggestions(context: ResponseContext, language: 'pt-BR' | 'en-US'): string[] {
    const suggestions: string[] = [];
    
    // Sugestões baseadas no tipo de query
    if (context.queryType === 'SQL_DIRECT') {
      suggestions.push('Quer ver mais detalhes sobre esses dados?');
      suggestions.push('Precisa de um gráfico ou visualização?');
    }
    
    if (context.queryType === 'SERVICE_DIRECT') {
      suggestions.push('Quer filtrar esses resultados?');
      suggestions.push('Precisa de informações adicionais?');
    }
    
    if (context.queryType === 'AI_REQUIRED') {
      suggestions.push('Quer que eu aprofunde mais em algum aspecto?');
      suggestions.push('Precisa de uma ação específica?');
    }
    
    // Sugestões baseadas em insights
    if (context.insights && context.insights.length > 0) {
      const actionableInsights = context.insights.filter(i => i.actionable);
      if (actionableInsights.length > 0) {
        suggestions.push('Quer ver as ações sugeridas para esses insights?');
      }
    }
    
    // Sugestões baseadas em alertas
    if (context.alerts && context.alerts.length > 0) {
      suggestions.push('Quer que eu priorize a resolução de algum alerta?');
    }
    
    return suggestions;
  }
  
  private formatErrorMessage(error: string, language: 'pt-BR' | 'en-US'): string {
    if (language === 'pt-BR') {
      return `❌ **Erro ao processar sua solicitação**\n\n${error}\n\nPor favor, tente novamente ou reformule sua pergunta.`;
    }
    
    return `❌ **Error processing your request**\n\n${error}\n\nPlease try again or rephrase your question.`;
  }
  
  setDefaultOptions(options: Partial<ResponseOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }
  
  getDefaultOptions(): ResponseOptions {
    return { ...this.defaultOptions };
  }
}

export const responseBuilder = new ResponseBuilder();
