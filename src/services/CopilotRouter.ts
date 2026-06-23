import { sqlDirectExecutor } from "./SQLDirectExecutor";
import { serviceDirectExecutor } from "./ServiceDirectExecutor";
import { aiService } from "./AIService";
import { QueryType } from "./types";
import type { AIContext } from "./types";

export interface RouterResult {
  success: boolean;
  strategy: QueryType;
  data?: any;
  message?: string;
  error?: string;
  confidence?: number;
}

export interface RouterContext extends AIContext {
  message?: string;
}

export class CopilotRouter {
  async route(query: string, context?: RouterContext): Promise<RouterResult> {
    const queryType = this.classifyQuery(query);
    
    switch (queryType) {
      case QueryType.SQL_DIRECT:
        return await sqlDirectExecutor.execute(query, context);
      
      case QueryType.SERVICE_DIRECT:
        return await serviceDirectExecutor.execute(query, context);
      
      case QueryType.AI_REQUIRED:
        // Para IA, precisamos processar através do AIService
        // Por enquanto, vamos retornar indicando que precisa de IA
        return {
          success: true,
          strategy: QueryType.AI_REQUIRED,
          message: 'Consulta requer processamento por IA',
          confidence: 0.5,
        };
      
      default:
        return {
          success: true,
          strategy: QueryType.AI_REQUIRED,
          message: 'Consulta requer processamento por IA',
          confidence: 0.5,
        };
    }
  }
  
  private classifyQuery(query: string): QueryType {
    const lowerQuery = query.toLowerCase();
    
    // SQL Direct patterns - consultas simples de contagem e status
    if (this.isQuantityQuery(lowerQuery)) return QueryType.SQL_DIRECT;
    if (this.isStatusQuery(lowerQuery)) return QueryType.SQL_DIRECT;
    
    // Service Direct patterns - listagens e dados específicos
    if (this.isListingQuery(lowerQuery)) return QueryType.SERVICE_DIRECT;
    if (this.isDataQuery(lowerQuery)) return QueryType.SERVICE_DIRECT;
    
    // AI Required patterns - diagnósticos, insights, recomendações
    if (this.isDiagnosticQuery(lowerQuery)) return QueryType.AI_REQUIRED;
    if (this.isInsightQuery(lowerQuery)) return QueryType.AI_REQUIRED;
    if (this.isRecommendationQuery(lowerQuery)) return QueryType.AI_REQUIRED;
    if (this.isPredictionQuery(lowerQuery)) return QueryType.AI_REQUIRED;
    
    // Default to AI
    return QueryType.AI_REQUIRED;
  }
  
  private isQuantityQuery(query: string): boolean {
    const patterns = [
      /quantos?/,
      /quantidade/,
      /contar/,
      /número/,
      /total de/,
      /quantas?/,
    ];
    return patterns.some(pattern => pattern.test(query));
  }
  
  private isListingQuery(query: string): boolean {
    const patterns = [
      /listar/,
      /mostrar/,
      /todos?/,
      /buscar/,
      /exibir/,
    ];
    return patterns.some(pattern => pattern.test(query));
  }
  
  private isDiagnosticQuery(query: string): boolean {
    const patterns = [
      /por que/,
      /qual o problema/,
      /diagnosticar/,
      /gargalo/,
      /erro/,
      /causa/,
    ];
    return patterns.some(pattern => pattern.test(query));
  }
  
  private isInsightQuery(query: string): boolean {
    const patterns = [
      /analisar/,
      /insight/,
      /tendência/,
      /padrão/,
      /comportamento/,
    ];
    return patterns.some(pattern => pattern.test(query));
  }
  
  private isRecommendationQuery(query: string): boolean {
    const patterns = [
      /recomendar/,
      /sugerir/,
      /como melhorar/,
      /otimizar/,
      /deveria/,
    ];
    return patterns.some(pattern => pattern.test(query));
  }
  
  private isPredictionQuery(query: string): boolean {
    const patterns = [
      /prever/,
      /previsão/,
      /futuro/,
      /estimar/,
      /projec/,
    ];
    return patterns.some(pattern => pattern.test(query));
  }
  
  private isStatusQuery(query: string): boolean {
    const patterns = [
      /status/,
      /estado/,
      /situação/,
    ];
    return patterns.some(pattern => pattern.test(query));
  }
  
  private isDataQuery(query: string): boolean {
    const patterns = [
      /dados do/,
      /informações do/,
      /detalhes do/,
      /bom do/,
      /especificações/,
    ];
    return patterns.some(pattern => pattern.test(query));
  }
}

export const copilotRouter = new CopilotRouter();
