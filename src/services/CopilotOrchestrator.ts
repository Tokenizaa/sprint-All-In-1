import { copilotRouter } from "./CopilotRouter";
import { toolRegistry } from "./ToolRegistry";
import { insightGenerator } from "./InsightGenerator";
import { alertEngine } from "./AlertEngine";
import { aiService, AIService } from "./AIService";
import { kpiCalculator } from "./KPICalculator";
import { QueryType } from "./types";
import type { ChatMessage, AIContext } from "./types";

export interface OrchestratorRequest {
  message: string;
  userId?: string;
  context?: Partial<AIContext>;
  conversationId?: string;
  includeInsights?: boolean;
  includeAlerts?: boolean;
}

export interface OrchestratorResponse {
  message: string;
  routing: {
    queryType: string;
    strategy: string;
    executionTime: number;
  };
  insights?: any[];
  alerts?: any[];
  context?: AIContext;
  metadata: {
    timestamp: string;
    conversationId: string;
    toolsUsed: string[];
    kpis?: any;
  };
}

export interface ConversationState {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  context: AIContext;
  createdAt: string;
  updatedAt: string;
}

export class CopilotOrchestrator {
  private conversations: Map<string, ConversationState> = new Map();
  private aiService: AIService;
  
  constructor() {
    this.aiService = aiService;
  }
  
  async processRequest(request: OrchestratorRequest): Promise<OrchestratorResponse> {
    const startTime = Date.now();
    const conversationId = request.conversationId || this.generateConversationId();
    
    // Obter ou criar estado da conversação
    let conversation = this.conversations.get(conversationId);
    if (!conversation) {
      conversation = this.createConversation(conversationId, request.userId);
      this.conversations.set(conversationId, conversation);
    }
    
    // Atualizar contexto se fornecido
    if (request.context) {
      conversation.context = { ...conversation.context, ...request.context };
    }
    
    // Adicionar mensagem do usuário
    conversation.messages.push({
      role: 'user',
      content: request.message,
      timestamp: new Date().toISOString()
    } as any);
    
    // 1. Roteamento da query
    const routingResult = await copilotRouter.route(request.message, conversation.context);
    
    // 2. Executar baseado na estratégia de roteamento
    let responseContent = '';
    const toolsUsed: string[] = [];
    
    switch (routingResult.strategy) {
      case QueryType.SQL_DIRECT:
        responseContent = await this.handleSQLDirect(routingResult);
        break;
      case QueryType.SERVICE_DIRECT:
        responseContent = await this.handleServiceDirect(routingResult);
        break;
      case QueryType.AI_REQUIRED:
        responseContent = await this.handleAIRequired(request, conversation);
        toolsUsed.push(...this.extractToolsUsed(routingResult));
        break;
      default:
        responseContent = await this.handleAIRequired(request, conversation);
    }
    
    // 3. Adicionar resposta do assistente
    conversation.messages.push({
      role: 'assistant',
      content: responseContent,
      timestamp: new Date().toISOString()
    } as any);
    
    // 4. Atualizar timestamp da conversação
    conversation.updatedAt = new Date().toISOString();
    
    // 5. Coletar insights e alertas se solicitado
    let insights: any[] = [];
    let alerts: any[] = [];
    let kpis: any = undefined;
    
    if (request.includeInsights) {
      insights = await insightGenerator.generateInsights();
    }
    
    if (request.includeAlerts) {
      alerts = alertEngine.getActiveAlerts();
    }
    
    // Calcular KPIs para contexto
    try {
      kpis = await kpiCalculator.calculateOverallKPIs();
    } catch (error) {
      console.error('Erro ao calcular KPIs:', error);
    }
    
    const executionTime = Date.now() - startTime;
    
    return {
      message: responseContent,
      routing: {
        queryType: routingResult.strategy,
        strategy: routingResult.strategy,
        executionTime
      },
      insights: request.includeInsights ? insights : undefined,
      alerts: request.includeAlerts ? alerts : undefined,
      context: conversation.context,
      metadata: {
        timestamp: new Date().toISOString(),
        conversationId,
        toolsUsed,
        kpis
      }
    };
  }
  
  async processRequestWithStreaming(
    request: OrchestratorRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const conversationId = request.conversationId || this.generateConversationId();
    
    // Obter ou criar estado da conversação
    let conversation = this.conversations.get(conversationId);
    if (!conversation) {
      conversation = this.createConversation(conversationId, request.userId);
      this.conversations.set(conversationId, conversation);
    }
    
    // Atualizar contexto se fornecido
    if (request.context) {
      conversation.context = { ...conversation.context, ...request.context };
    }
    
    // Adicionar mensagem do usuário
    conversation.messages.push({
      role: 'user',
      content: request.message,
      timestamp: new Date().toISOString()
    } as any);
    
    // Roteamento da query
    const routingResult = copilotRouter.route(request.message, conversation.context);
    
    // Para streaming, sempre usar AI
    const messages = conversation.messages.map(m => ({
      role: m.role,
      content: m.content
    }));
    
    const tools = aiService.getAvailableTools();
    
    await this.aiService.sendMessageWithStreaming(
      messages,
      tools,
      (chunk) => {
        if (chunk.content) {
          onChunk(chunk.content);
        }
      },
      conversation.context
    );
    
    // Atualizar timestamp
    conversation.updatedAt = new Date().toISOString();
  }
  
  private async handleSQLDirect(routingResult: any): Promise<string> {
    try {
      const result = routingResult;
      
      if (result.success) {
        return this.formatSQLDirectResult(result.data);
      } else {
        return `Erro ao executar query: ${result.error}`;
      }
    } catch (error) {
      console.error('Erro no SQL Direct:', error);
      return 'Erro ao processar solicitação via SQL direto.';
    }
  }
  
  private async handleServiceDirect(routingResult: any): Promise<string> {
    try {
      const result = routingResult;
      
      if (result.success) {
        return this.formatServiceDirectResult(result.data);
      } else {
        return `Erro ao executar serviço: ${result.error}`;
      }
    } catch (error) {
      console.error('Erro no Service Direct:', error);
      return 'Erro ao processar solicitação via serviço direto.';
    }
  }
  
  private async handleAIRequired(
    request: OrchestratorRequest,
    conversation: ConversationState
  ): Promise<string> {
    try {
      const messages = conversation.messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      
      const tools = aiService.getAvailableTools();
      
      const result = await this.aiService.sendMessage(
        messages,
        tools,
        conversation.context
      );
      
      if (result.success) {
        return result.data.content;
      } else {
        return `Erro ao processar com IA: ${result.error}`;
      }
    } catch (error) {
      console.error('Erro no AI Required:', error);
      return 'Erro ao processar solicitação com IA.';
    }
  }
  
  private formatSQLDirectResult(data: any): string {
    if (typeof data === 'number') {
      return `Resultado: ${data}`;
    }
    
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return 'Nenhum resultado encontrado.';
      }
      if (data.length === 1) {
        return `1 resultado encontrado: ${JSON.stringify(data[0])}`;
      }
      return `${data.length} resultados encontrados: ${JSON.stringify(data)}`;
    }
    
    return JSON.stringify(data);
  }
  
  private formatServiceDirectResult(data: any): string {
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return 'Nenhum resultado encontrado.';
      }
      return `${data.length} itens encontrados.`;
    }
    
    return JSON.stringify(data);
  }
  
  private extractToolsUsed(routingResult: any): string[] {
    const tools: string[] = [];
    
    if (routingResult.domain) {
      const domainTools = toolRegistry.getToolsByDomain(routingResult.domain);
      tools.push(...domainTools.map(t => t.name));
    }
    
    return tools;
  }
  
  private createConversation(conversationId: string, userId?: string): ConversationState {
    return {
      id: conversationId,
      userId,
      messages: [],
      context: {
        timestamp: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  getConversation(conversationId: string): ConversationState | undefined {
    return this.conversations.get(conversationId);
  }
  
  getAllConversations(): ConversationState[] {
    return Array.from(this.conversations.values());
  }
  
  deleteConversation(conversationId: string): void {
    this.conversations.delete(conversationId);
  }
  
  clearOldConversations(maxAgeHours: number = 24): void {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - maxAgeHours);
    
    for (const [id, conversation] of this.conversations.entries()) {
      const createdAt = new Date(conversation.createdAt);
      if (createdAt < cutoffDate) {
        this.conversations.delete(id);
      }
    }
  }
  
  async enrichContext(userId?: string): Promise<AIContext> {
    try {
      const context = await this.aiService.buildDeepContext(userId);
      
      // Adicionar insights e alertas ao contexto
      const insights = await insightGenerator.generateInsights();
      const alerts = alertEngine.getActiveAlerts();
      const kpis = await kpiCalculator.calculateOverallKPIs();
      
      return {
        ...context,
        relevantData: {
          ...context.relevantData,
          insights: insights.slice(0, 5), // Top 5 insights
          alerts: alerts.slice(0, 5), // Top 5 alertas
          overallHealth: kpis.overallHealth
        }
      };
    } catch (error) {
      console.error('Erro ao enriquecer contexto:', error);
      return {
        timestamp: new Date().toISOString()
      };
    }
  }
  
  async getQuickInsights(): Promise<any> {
    try {
      const [insights, alerts, kpis] = await Promise.all([
        insightGenerator.generateInsights(),
        Promise.resolve(alertEngine.getActiveAlerts()),
        kpiCalculator.calculateOverallKPIs()
      ]);
      
      return {
        insights: insights.slice(0, 3),
        alerts: alerts.slice(0, 3),
        overallHealth: kpis.overallHealth,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao obter insights rápidos:', error);
      return {
        insights: [],
        alerts: [],
        overallHealth: 0,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const copilotOrchestrator = new CopilotOrchestrator();
