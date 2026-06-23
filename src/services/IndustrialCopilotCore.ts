import { copilotRouter } from './CopilotRouter';
import { toolRegistry } from './ToolRegistry';
import { insightGenerator } from './InsightGenerator';
import { alertEngine } from './AlertEngine';
import { aiService, AIService } from './AIService';
import { kpiCalculator } from './KPICalculator';
import { copilotObservability } from './CopilotObservability';
import { copilotOperationalMemory } from './CopilotOperationalMemory';
import { supabase } from '@/lib/supabase';
import type { ChatMessage, AIContext } from './types';
import { QueryType } from './types';

export interface CopilotContext {
  module?: 'production' | 'inventory' | 'quality' | 'financial' | 'supplier' | 'pcp' | 'mrp';
  page?: string;
  companyId?: string;
  tenantId?: string;
  userId?: string;
  selectedEntity?: {
    type: 'product' | 'material' | 'supplier' | 'order' | 'lot';
    id: string;
    name: string;
  };
}

export interface CopilotIntent {
  type: 'query' | 'action' | 'analysis' | 'planning';
  domain: 'production' | 'inventory' | 'quality' | 'financial' | 'supplier' | 'general';
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  confidence: number;
}

export interface CopilotResponse {
  message: string;
  sources: Array<{
    name: string;
    type: 'production' | 'inventory' | 'quality' | 'financial' | 'supplier' | 'bom' | 'pcp';
  }>;
  actions?: Array<{
    label: string;
    type: 'navigate' | 'create' | 'update' | 'export';
    target?: string;
  }>;
  insights?: Array<{
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
  }>;
  metadata: {
    timestamp: string;
    intent?: CopilotIntent;
    context: CopilotContext;
  };
}

export interface IndustrialMemory {
  userId?: string;
  companyId?: string;
  conversations: Map<string, ChatMessage[]>;
  contextHistory: CopilotContext[];
  lastModule?: string;
  lastEntity?: {
    type: string;
    id: string;
    name: string;
  };
}

export class IndustrialCopilotCore {
  private aiService: AIService;
  private currentContext: CopilotContext = {};
  
  constructor() {
    this.aiService = aiService;
  }
  
  setContext(context: Partial<CopilotContext>): void {
    this.currentContext = { ...this.currentContext, ...context };
  }
  
  getContext(): CopilotContext {
    return { ...this.currentContext };
  }
  
  getMemory(): IndustrialMemory {
    // Memory is now persisted in database, return empty for compatibility
    return {
      conversations: new Map(),
      contextHistory: [],
    };
  }

  /**
   * Carrega conversação do banco de dados
   */
  async loadConversation(conversationId: string): Promise<ChatMessage[]> {
    try {
      const { data: messages, error } = await supabase
        .from('copilot_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return messages?.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        timestamp: m.created_at,
      })) || [];
    } catch (error) {
      console.error('Erro ao carregar conversação:', error);
      return [];
    }
  }

  /**
   * Salva mensagem no banco de dados
   */
  async saveMessage(conversationId: string, message: ChatMessage): Promise<void> {
    try {
      const { error } = await supabase
        .from('copilot_messages')
        .insert({
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
          metadata: (message as any).metadata || {},
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  }

  /**
   * Cria ou atualiza conversação no banco de dados
   */
  async saveConversation(conversationId: string, userId?: string, context?: CopilotContext): Promise<void> {
    try {
      const title = context?.selectedEntity?.name || 'Nova conversação';
      
      const { error } = await supabase
        .from('copilot_conversations')
        .upsert({
          id: conversationId,
          user_id: userId,
          title,
          context: context || {},
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar conversação:', error);
    }
  }
  
  async processMessage(
    message: string,
    conversationId?: string
  ): Promise<CopilotResponse> {
    if (!this.currentContext.tenantId) {
      throw new Error('Tenant não carregado. Não é possível iniciar o Copilot.');
    }
    
    const startTime = Date.now();
    const activeConversationId = conversationId || crypto.randomUUID();
    
    // Log message sent event
    await copilotObservability.logEvent({
      conversation_id: activeConversationId,
      user_id: this.currentContext.userId,
      event_type: 'message_sent',
      event_data: {
        message_length: message.length,
        context: this.currentContext,
      },
    });
    
    // 1. Identificar intenção
    const intent = await this.identifyIntent(message);
    
    // 2. Enriquecer contexto com contexto do módulo atual
    const enrichedContext = {
      ...this.currentContext,
      intent,
    };
    
    // 3. Roteamento inteligente
    const routingResult = await copilotRouter.route(message, enrichedContext as any);
    
    // Log routing decision
    await copilotObservability.logEvent({
      conversation_id: activeConversationId,
      user_id: this.currentContext.userId,
      event_type: 'routing_decision',
      event_data: {
        strategy: routingResult.strategy,
        confidence: routingResult.confidence,
      },
    });
    
    // 4. Executar ferramentas automaticamente (não exposto ao usuário)
    let responseContent = '';
    let sources: Array<{ name: string; type: any }> = [];
    
    switch (routingResult.strategy) {
      case QueryType.SQL_DIRECT:
        responseContent = await this.handleSQLDirect(routingResult);
        sources.push({ name: 'Banco de Dados', type: 'database' });
        break;
      case QueryType.SERVICE_DIRECT:
        responseContent = await this.handleServiceDirect(routingResult);
        sources.push({ name: 'Serviços', type: 'service' });
        break;
      case QueryType.AI_REQUIRED:
        const aiResult = await this.handleAIRequired(message, enrichedContext as any);
        responseContent = aiResult.message;
        sources = aiResult.sources;
        break;
      default:
        const defaultResult = await this.handleAIRequired(message, enrichedContext as any);
        responseContent = defaultResult.message;
        sources = defaultResult.sources;
    }
    
    // 5. Gerar ações sugeridas baseadas na resposta
    const actions = this.generateSuggestedActions(responseContent, enrichedContext);
    
    // 6. Obter insights relevantes
    const insights = await this.getRelevantInsights(enrichedContext);
    
    // 7. Salvar no banco de dados e memória operacional
    if (activeConversationId) {
      await this.saveConversation(activeConversationId, this.currentContext.userId, this.currentContext);
      await this.saveMessage(activeConversationId, {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      } as any);
      await this.saveMessage(activeConversationId, {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString(),
      } as any);
    }

    if (this.currentContext.tenantId) {
      // Salvar na copilot_memory para cache de consultas recorrentes
      await copilotOperationalMemory.set(
        message,
        {
          strategy: routingResult.strategy as any,
          response: responseContent,
          sources: sources.map(s => s.name),
          confidence: routingResult.confidence || 0.8,
          metadata: {
            conversation_id: activeConversationId,
            user_id: this.currentContext.userId,
            context: this.currentContext
          }
        },
        this.currentContext.tenantId
      );
    }
    
    const executionTime = Date.now() - startTime;
    
    // Log message received event
    await copilotObservability.logEvent({
      conversation_id: activeConversationId,
      user_id: this.currentContext.userId,
      event_type: 'message_received',
      event_data: {
        response_length: responseContent.length,
        response_time: executionTime,
        sources_count: sources.length,
      },
    });
    
    return {
      message: responseContent,
      sources: this.formatSources(sources),
      actions,
      insights,
      metadata: {
        timestamp: new Date().toISOString(),
        intent,
        context: enrichedContext,
      },
    };
  }
  
  async processMessageWithStreaming(
    message: string,
    onChunk: (chunk: string) => void,
    conversationId?: string
  ): Promise<void> {
    if (!this.currentContext.tenantId) {
      throw new Error('Tenant não carregado. Não é possível iniciar o Copilot.');
    }
    
    const enrichedContext = { ...this.currentContext };
    const activeConversationId = conversationId || crypto.randomUUID();
    
    // Obter histórico da conversação do banco de dados
    let messages: ChatMessage[] = [{ role: 'user', content: message }];
    
    if (activeConversationId) {
      const conversationHistory = await this.loadConversation(activeConversationId);
      if (conversationHistory.length > 0) {
        messages = conversationHistory.map(m => ({
          role: m.role as "user" | "system" | "assistant" | "tool",
          content: m.content,
        }));
        messages.push({ role: 'user', content: message });
      }
    }
    
    // Adicionar contexto do módulo ao sistema
    const context = {
      factoryName: 'Fábrica Industrial',
      currentModule: enrichedContext.module || 'geral',
      selectedEntity: enrichedContext.selectedEntity,
    };
    
    const tools = aiService.getAvailableTools();
    
    await this.aiService.sendMessageWithStreaming(
      messages,
      tools,
      (chunk) => {
        if (chunk.content) {
          onChunk(chunk.content);
        }
      },
      context as any
    );
    
    // Salvar no banco de dados
    if (activeConversationId) {
      await this.saveConversation(activeConversationId, this.currentContext.userId, this.currentContext);
      await this.saveMessage(activeConversationId, {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      } as any);
    }
  }
  
  private async identifyIntent(message: string): Promise<CopilotIntent> {
    // Análise simples de intenção baseada em palavras-chave
    const lowerMessage = message.toLowerCase();
    
    // Identificar domínio
    let domain: CopilotIntent['domain'] = 'general';
    if (lowerMessage.includes('produção') || lowerMessage.includes('op') || lowerMessage.includes('ordem')) {
      domain = 'production';
    } else if (lowerMessage.includes('estoque') || lowerMessage.includes('material') || lowerMessage.includes('insumo')) {
      domain = 'inventory';
    } else if (lowerMessage.includes('qualidade') || lowerMessage.includes('refugo') || lowerMessage.includes('defeito')) {
      domain = 'quality';
    } else if (lowerMessage.includes('custo') || lowerMessage.includes('margem') || lowerMessage.includes('lucro')) {
      domain = 'financial';
    } else if (lowerMessage.includes('fornecedor') || lowerMessage.includes('compra') || lowerMessage.includes('pedido')) {
      domain = 'supplier';
    }
    
    // Identificar tipo
    let type: CopilotIntent['type'] = 'query';
    if (lowerMessage.includes('posso') || lowerMessage.includes('consigo') || lowerMessage.includes('é possível')) {
      type = 'action';
    } else if (lowerMessage.includes('analisar') || lowerMessage.includes('avaliar') || lowerMessage.includes('comparar')) {
      type = 'analysis';
    } else if (lowerMessage.includes('planejar') || lowerMessage.includes('simular') || lowerMessage.includes('projetar')) {
      type = 'planning';
    }
    
    // Identificar entidades (simplificado)
    const entities: CopilotIntent['entities'] = [];
    const productMatch = message.match(/produto\s+(\w+)/i);
    if (productMatch) {
      entities.push({ type: 'product', value: productMatch[1], confidence: 0.8 });
    }
    
    const orderMatch = message.match(/op[-\s]?(\d+)/i);
    if (orderMatch) {
      entities.push({ type: 'order', value: orderMatch[1], confidence: 0.9 });
    }
    
    return {
      type,
      domain,
      entities,
      confidence: 0.7,
    };
  }
  
  private async handleSQLDirect(routingResult: any): Promise<string> {
    // Implementação futura para queries SQL diretas
    return 'Consulta SQL executada com sucesso.';
  }
  
  private async handleServiceDirect(routingResult: any): Promise<string> {
    // Implementação futura para chamadas diretas de serviço
    return 'Serviço executado com sucesso.';
  }
  
  private async handleAIRequired(
    message: string,
    context: any
  ): Promise<{ message: string; sources: Array<{ name: string; type: any }> }> {
    const messages: import('./AIService').ChatMessage[] = [{ role: 'user', content: message }];
    const tools = aiService.getAvailableTools();
    
    const result = await this.aiService.sendMessage(messages, tools, context);
    
    if (result.success) {
      return {
        message: result.data?.content || 'Sem resposta',
        sources: this.extractSourcesFromToolsUsed(result.data?.toolCalls?.map((t: any) => t.function.name) || []),
      };
    }
    
    return {
      message: `Erro: ${result.error}`,
      sources: [],
    };
  }
  
  private extractSourcesFromToolsUsed(toolsUsed: string[]): Array<{ name: string; type: any }> {
    const sourceMap: Record<string, string> = {
      get_products: 'Produtos',
      get_bom: 'BOM',
      get_inventory: 'Estoque',
      get_materials: 'Matérias-Primas',
      get_production_orders: 'Ordens de Produção',
      get_quality_records: 'Registros de Qualidade',
      get_suppliers: 'Fornecedores',
      calculate_bom_cost: 'Custos',
      identify_bottlenecks: 'PCP',
    };
    
    return toolsUsed.map(tool => ({
      name: sourceMap[tool] || tool,
      type: 'service',
    }));
  }
  
  private formatSources(sources: Array<{ name: string; type: any }>): Array<{ name: string; type: any }> {
    // Remover duplicatas
    const uniqueSources = sources.filter(
      (source, index, self) =>
        index === self.findIndex(s => s.name === source.name)
    );
    
    return uniqueSources;
  }
  
  private generateSuggestedActions(
    response: string,
    context: CopilotContext
  ): Array<{ label: string; type: 'navigate' | 'create' | 'update' | 'export'; target?: string }> {
    const actions: Array<{ label: string; type: 'navigate' | 'create' | 'update' | 'export'; target?: string }> = [];
    
    const lowerResponse = response.toLowerCase();
    
    // Ações baseadas em contexto de produção
    if (context.module === 'production' || lowerResponse.includes('op') || lowerResponse.includes('ordem')) {
      if (lowerResponse.includes('atrasada') || lowerResponse.includes('atraso')) {
        actions.push({ label: 'Ver OPs Atrasadas', type: 'navigate', target: '/ordens-producao?status=atrasada' });
        actions.push({ label: 'Gerar Plano de Recuperação', type: 'create' });
      }
      if (lowerResponse.includes('capacidade') || lowerResponse.includes('produzir')) {
        actions.push({ label: 'Planejar Produção', type: 'navigate', target: '/pcp' });
      }
    }
    
    // Ações baseadas em contexto de estoque
    if (context.module === 'inventory' || lowerResponse.includes('estoque') || lowerResponse.includes('material')) {
      if (lowerResponse.includes('abaixo do mínimo') || lowerResponse.includes('crítico')) {
        actions.push({ label: 'Gerar Pedido de Compra', type: 'create' });
        actions.push({ label: 'Ver Materiais Críticos', type: 'navigate', target: '/materias-primas?status=critico' });
      }
      if (lowerResponse.includes('movimentação') || lowerResponse.includes('entrada') || lowerResponse.includes('saída')) {
        actions.push({ label: 'Registrar Movimentação', type: 'create' });
      }
    }
    
    // Ações baseadas em contexto de qualidade
    if (context.module === 'quality' || lowerResponse.includes('qualidade') || lowerResponse.includes('refugo')) {
      if (lowerResponse.includes('não conformidade') || lowerResponse.includes('defeito')) {
        actions.push({ label: 'Abrir Não Conformidade', type: 'create' });
        actions.push({ label: 'Ver Inspeções', type: 'navigate', target: '/qualidade' });
      }
    }
    
    // Ações baseadas em contexto financeiro
    if (context.module === 'financial' || lowerResponse.includes('custo') || lowerResponse.includes('margem')) {
      if (lowerResponse.includes('relatório') || lowerResponse.includes('análise')) {
        actions.push({ label: 'Exportar Relatório', type: 'export' });
      }
    }
    
    return actions;
  }
  
  private async getRelevantInsights(context: CopilotContext): Promise<Array<{ title: string; description: string; severity: 'critical' | 'warning' | 'info' }>> {
    try {
      const insights = await insightGenerator.generateInsights();
      
      // Filtrar insights relevantes ao contexto
      const relevantInsights = insights.filter(insight => {
        if (context.module && insight.category !== context.module) {
          return false;
        }
        return insight.type === 'critical' || insight.type === 'warning';
      });
      
      return relevantInsights.slice(0, 3).map(insight => ({
        title: insight.title,
        description: insight.description,
        severity: insight.type === 'critical' ? 'critical' : insight.type === 'warning' ? 'warning' : 'info',
      }));
    } catch (error) {
      console.error('Erro ao obter insights:', error);
      return [];
    }
  }
  
  clearMemory(): void {
    // Memory is now persisted in database, no-op for compatibility
  }
  
  async clearConversation(conversationId: string): Promise<void> {
    try {
      // Archive conversation instead of deleting
      const { error } = await supabase
        .from('copilot_conversations')
        .update({ 
          status: 'archived',
          is_archived: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao arquivar conversação:', error);
    }
  }
}

export const industrialCopilotCore = new IndustrialCopilotCore();
