/**
 * ResponsePrioritizationEngine - Decision engine for response strategy
 * 
 * Prioritizes response strategies in the following order:
 * 1. KPI Pre-calculated (fastest)
 * 2. Insight Existing (fast)
 * 3. Analytics (medium)
 * 4. Report Structured (medium)
 * 5. Template (medium)
 * 6. AI (slowest, last resort)
 * 
 * Goal: 85-90% of responses without AI
 */

import { copilotIntentRouter, type ResponseStrategy, type Domain } from './CopilotIntentRouter';
import { industrialAnalyticsEngine } from './IndustrialAnalyticsEngine';
import { insightGenerationEngine } from './InsightGenerationEngine';
import { responseEngine } from './ResponseEngine';
import { responseTemplateLibrary } from './ResponseTemplateLibrary';
import { copilotOperationalMemory } from './CopilotOperationalMemory';

export interface PrioritizationRequest {
  query: string;
  tenantId?: string;
  context?: Record<string, any>;
}

export interface PrioritizationResult {
  strategy: ResponseStrategy;
  response: string;
  sources: string[];
  confidence: number;
  executionTime: number;
  metadata?: Record<string, any>;
  usedAI: boolean;
}

export class ResponsePrioritizationEngine {
  /**
   * Execute the prioritization engine to get the best response
   */
  async execute(request: PrioritizationRequest): Promise<PrioritizationResult> {
    const startTime = Date.now();
    const { query, tenantId, context } = request;

    // Step 1: Check operational memory cache first
    const cachedResponse = await copilotOperationalMemory.get(query, tenantId);
    if (cachedResponse && this.isCacheValid(cachedResponse.timestamp)) {
      return {
        ...cachedResponse,
        executionTime: Date.now() - startTime,
        usedAI: cachedResponse.strategy === 'ai',
      };
    }

    // Step 2: Classify intent
    const intentResult = copilotIntentRouter.classify(query);
    const { classification, suggestedKPI, suggestedTemplate } = intentResult;

    // Step 3: Try strategies in priority order
    const strategies: ResponseStrategy[] = [
      'kpi_precomputed',
      'insight_existing',
      'analytics',
      'report_structured',
      'template',
      'ai',
    ];

    for (const strategy of strategies) {
      const result = await this.tryStrategy(
        strategy,
        query,
        classification.domain,
        tenantId,
        suggestedKPI,
        suggestedTemplate
      );

      if (result) {
        const finalResult: PrioritizationResult = {
          strategy,
          response: result.message,
          sources: result.sources,
          confidence: result.confidence,
          executionTime: Date.now() - startTime,
          metadata: {
            ...result.metadata,
            classification,
          },
          usedAI: strategy === 'ai',
        };

        // Cache the result
        await copilotOperationalMemory.set(query, finalResult, tenantId);

        return finalResult;
      }
    }

    // Fallback response
    return {
      strategy: 'template',
      response: 'Não foi possível processar a solicitação. Tente reformular sua pergunta.',
      sources: [],
      confidence: 0.3,
      executionTime: Date.now() - startTime,
      usedAI: false,
    };
  }

  private async tryStrategy(
    strategy: ResponseStrategy,
    query: string,
    domain: Domain,
    tenantId?: string,
    suggestedKPI?: string,
    suggestedTemplate?: string
  ): Promise<{ message: string; sources: string[]; confidence: number; metadata?: Record<string, any> } | null> {
    switch (strategy) {
      case 'kpi_precomputed':
        return this.tryKPIPrecomputed(query, domain, tenantId, suggestedKPI);
      
      case 'insight_existing':
        return this.tryInsightExisting(query, domain, tenantId);
      
      case 'analytics':
        return this.tryAnalytics(query, domain, tenantId);
      
      case 'report_structured':
        return this.tryReportStructured(query, domain, tenantId);
      
      case 'template':
        return this.tryTemplate(query, domain, tenantId, suggestedTemplate);
      
      case 'ai':
        return this.tryAI(query, domain, tenantId);
      
      default:
        return null;
    }
  }

  private async tryKPIPrecomputed(
    query: string,
    domain: Domain,
    tenantId?: string,
    suggestedKPI?: string
  ): Promise<{ message: string; sources: string[]; confidence: number } | null> {
    if (!suggestedKPI) return null;

    try {
      const kpi = await industrialAnalyticsEngine.getKPI({
        domain,
        kpiName: suggestedKPI,
        tenantId,
      });

      const message = this.formatKPIResponse(kpi, domain);

      return {
        message,
        sources: [domain],
        confidence: 0.95,
      };
    } catch (error) {
      console.error('Error in KPI precomputed strategy:', error);
      return null;
    }
  }

  private async tryInsightExisting(
    query: string,
    domain: Domain,
    tenantId?: string
  ): Promise<{ message: string; sources: string[]; confidence: number } | null> {
    try {
      const insights = await insightGenerationEngine.getActiveInsights(tenantId, domain);
      
      if (insights.length === 0) return null;

      const relevantInsights = this.filterInsightsByQuery(insights, query);
      
      if (relevantInsights.length === 0) return null;

      const message = this.formatInsightsResponse(relevantInsights);

      return {
        message,
        sources: [domain],
        confidence: 0.85,
      };
    } catch (error) {
      console.error('Error in insight existing strategy:', error);
      return null;
    }
  }

  private async tryAnalytics(
    query: string,
    domain: Domain,
    tenantId?: string
  ): Promise<{ message: string; sources: string[]; confidence: number } | null> {
    try {
      const result = await industrialAnalyticsEngine.executeAnalytics({
        domain,
        query,
        tenantId,
      });

      const message = this.formatAnalyticsResponse(result);

      return {
        message,
        sources: [domain],
        confidence: 0.8,
      };
    } catch (error) {
      console.error('Error in analytics strategy:', error);
      return null;
    }
  }

  private async tryReportStructured(
    query: string,
    domain: Domain,
    tenantId?: string
  ): Promise<{ message: string; sources: string[]; confidence: number } | null> {
    // For now, delegate to analytics
    return this.tryAnalytics(query, domain, tenantId);
  }

  private async tryTemplate(
    query: string,
    domain: Domain,
    tenantId?: string,
    suggestedTemplate?: string
  ): Promise<{ message: string; sources: string[]; confidence: number } | null> {
    try {
      const template = responseTemplateLibrary.getTemplate(query, domain);
      if (!template) return null;

      const result = await responseEngine.generateResponse({
        query,
        domain,
        tenantId,
      });

      return {
        message: result.message,
        sources: result.sources,
        confidence: result.confidence,
      };
    } catch (error) {
      console.error('Error in template strategy:', error);
      return null;
    }
  }

  private async tryAI(
    query: string,
    domain: Domain,
    tenantId?: string
  ): Promise<{ message: string; sources: string[]; confidence: number } | null> {
    // AI is the last resort - should rarely be used
    // This is a placeholder for AI integration
    // For now, return null to force fallback to template
    
    // If AI is needed, integrate with existing AIService
    return null;
  }

  private filterInsightsByQuery(insights: any[], query: string): any[] {
    const lowerQuery = query.toLowerCase();
    
    return insights.filter(insight => {
      const titleMatch = insight.title.toLowerCase().includes(lowerQuery);
      const descMatch = insight.description.toLowerCase().includes(lowerQuery);
      return titleMatch || descMatch;
    });
  }

  private formatKPIResponse(kpi: any, domain: Domain): string {
    const value = kpi.value;
    const unit = kpi.unit || '';

    const messages: Partial<Record<Domain, (v: any, u: string) => string>> = {
      production: (v, u) => `KPI: ${v} ${u}`,
      inventory: (v, u) => `KPI: ${v} ${u}`,
      mrp: (v, u) => `KPI: ${v} ${u}`,
      quality: (v, u) => `KPI: ${v} ${u}`,
      supplier: (v, u) => `KPI: ${v} ${u}`,
      financial: (v, u) => `KPI: ${v} ${u}`,
    };

    return messages[domain]?.(value, unit) || `KPI: ${value} ${unit}`;
  }

  private formatInsightsResponse(insights: any[]): string {
    if (insights.length === 0) {
      return 'Nenhum insight relevante encontrado.';
    }

    const critical = insights.filter(i => i.severity === 'critical');
    const warnings = insights.filter(i => i.severity === 'warning');

    let message = '';

    if (critical.length > 0) {
      message += `⚠️ ${critical.length} issue(s) crítica(s):\n`;
      critical.slice(0, 3).forEach(insight => {
        message += `- ${insight.title}\n`;
      });
    }

    if (warnings.length > 0) {
      message += `⚡ ${warnings.length} alerta(s):\n`;
      warnings.slice(0, 3).forEach(insight => {
        message += `- ${insight.title}\n`;
      });
    }

    return message;
  }

  private formatAnalyticsResponse(result: any): string {
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

  private isCacheValid(timestamp: string): boolean {
    const cacheTime = new Date(timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - cacheTime.getTime()) / (1000 * 60);
    return diffMinutes < 30; // Cache valid for 30 minutes
  }

  /**
   * Get statistics on strategy usage
   */
  async getStatistics(tenantId?: string): Promise<{
    totalQueries: number;
    strategyUsage: Record<ResponseStrategy, number>;
    aiUsageRate: number;
    averageResponseTime: number;
  }> {
    return copilotOperationalMemory.getStatistics(tenantId);
  }
}

export const responsePrioritizationEngine = new ResponsePrioritizationEngine();
