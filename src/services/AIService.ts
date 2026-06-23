import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";
import { toolRegistry } from "./ToolRegistry";

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  toolCallId?: string;
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export interface StreamingChunk {
  content: string;
  done: boolean;
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface AIContext {
  factoryName?: string;
  factoryId?: string;
  currentModule?: string;
  userId?: string;
  userRole?: string;
  timestamp?: string;
  relevantData?: Record<string, any>;
}

export interface AIMemory {
  id: string;
  userId: string;
  conversationId: string;
  messages: ChatMessage[];
  context: AIContext;
  createdAt: string;
  updatedAt: string;
}

export interface AIMemoryEntry {
  id: string;
  userId: string;
  key: string;
  value: any;
  createdAt: string;
  updatedAt: string;
}

export class AIService {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api';
    this.model = process.env.OLLAMA_MODEL || 'tinyllama';
  }

  /**
   * Envia mensagem com streaming e suporte a function calling
   */
  async sendMessageWithStreaming(
    messages: ChatMessage[],
    tools?: ToolDefinition[],
    onChunk?: (chunk: StreamingChunk) => void,
    context?: AIContext
  ): Promise<ServiceResult<{ content: string; toolCalls?: any[] }>> {
    try {
      // Adicionar contexto ao sistema
      const systemMessage = this.buildSystemMessage(context);
      const messagesWithContext = [systemMessage, ...messages];

      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: messagesWithContext.map(m => ({
            role: m.role,
            content: m.content,
          })),
          tools: tools?.map(t => t.function),
          stream: true,
          options: {
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        // Fallback para Ollama offline - retorna resposta genérica
        console.warn(`Ollama API error: ${response.statusText}, using fallback response`);
        const fallbackContent = this.generateFallbackResponse(messagesWithContext);
        if (onChunk) {
          onChunk({ content: fallbackContent, done: false });
          onChunk({ content: '', done: true });
        }
        return {
          success: true,
          data: {
            content: fallbackContent,
          }
        };
      }

      const reader = response.body?.getReader();
      if (!reader) {
        // Fallback se não houver reader
        console.warn('No reader available, using fallback response');
        const fallbackContent = this.generateFallbackResponse(messagesWithContext);
        if (onChunk) {
          onChunk({ content: fallbackContent, done: false });
          onChunk({ content: '', done: true });
        }
        return {
          success: true,
          data: {
            content: fallbackContent,
          }
        };
      }

      const decoder = new TextDecoder();
      let fullContent = '';
      let toolCalls: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            
            // Handle content streaming
            if (parsed.message?.content) {
              const content = parsed.message.content;
              fullContent += content;
              if (onChunk) {
                onChunk({ content, done: false });
              }
            }

            // Handle tool calls
            if (parsed.message?.tool_calls) {
              const calls = parsed.message.tool_calls;
              toolCalls = [...toolCalls, ...calls];
              
              if (onChunk) {
                onChunk({ 
                  content: '', 
                  done: false, 
                  toolCalls: calls 
                });
              }
            }
          } catch (e) {
            // Ignorar erros de parsing
          }
        }
      }

      // Execute tool calls if any
      if (toolCalls.length > 0) {
        const toolResults: ChatMessage[] = [];
        
        for (const call of toolCalls) {
          const result = await this.executeToolCall(call.function.name, JSON.stringify(call.function.arguments));
          
          toolResults.push({
            role: 'tool',
            content: JSON.stringify(result.data),
            toolCallId: call.id,
          });
        }

        // Get final response after tool execution
        const followUpMessages = [...messagesWithContext, ...toolResults];
        const followUpResponse = await this.sendMessage(followUpMessages, tools, context);
        
        if (followUpResponse.success) {
          fullContent += '\n\n' + followUpResponse.data.content;
        }
      }

      if (onChunk) {
        onChunk({ content: '', done: true });
      }

      return {
        success: true,
        data: {
          content: fullContent,
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        }
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem com streaming:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Envia mensagem sem streaming
   */
  async sendMessage(
    messages: ChatMessage[],
    tools?: ToolDefinition[],
    context?: AIContext
  ): Promise<ServiceResult<{ content: string; toolCalls?: any[] }>> {
    try {
      // Adicionar contexto ao sistema
      const systemMessage = this.buildSystemMessage(context);
      const messagesWithContext = [systemMessage, ...messages];

      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: messagesWithContext.map(m => ({
            role: m.role,
            content: m.content,
          })),
          stream: false,
          options: {
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        // Fallback para Ollama offline
        console.warn(`Ollama API error: ${response.statusText}, using fallback response`);
        const fallbackContent = this.generateFallbackResponse(messagesWithContext);
        return {
          success: true,
          data: {
            content: fallbackContent,
          }
        };
      }

      const data = await response.json();
      const message = data.message;

      return {
        success: true,
        data: {
          content: message?.content || '',
        }
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Fallback em caso de erro de rede
      const fallbackContent = this.generateFallbackResponse(messages);
      return {
        success: true,
        data: {
          content: fallbackContent,
        }
      };
    }
  }

  /**
   * Executa function calling usando ToolRegistry
   */
  async executeToolCall(
    toolName: string,
    toolArguments: string
  ): Promise<ServiceResult<any>> {
    try {
      const args = JSON.parse(toolArguments);
      
      // Usar ToolRegistry para executar a ferramenta
      const result = await toolRegistry.executeTool(toolName, args);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Erro ao executar tool call:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Constrói mensagem do sistema com contexto
   */
  private buildSystemMessage(context?: AIContext): ChatMessage {
    let systemPrompt = `Você é o Industrial Copilot, um assistente de IA especializado em gestão industrial de colchões.

Seu objetivo é ajudar usuários a:
- Gerenciar produção e ordens de produção
- Controlar estoque e materiais
- Monitorar qualidade e não-conformidades
- Analisar custos e métricas financeiras
- Otimizar processos industriais

Seja conciso, prático e direto. Forneça respostas baseadas em dados quando disponível.
`;

    if (context) {
      if (context.factoryName) {
        systemPrompt += `\n\nFábrica: ${context.factoryName}`;
      }
      if (context.currentModule) {
        systemPrompt += `\n\nMódulo atual: ${context.currentModule}`;
      }
      if (context.userRole) {
        systemPrompt += `\n\nPapel do usuário: ${context.userRole}`;
      }
      if (context.relevantData) {
        systemPrompt += `\n\nDados relevantes: ${JSON.stringify(context.relevantData, null, 2)}`;
      }
    }

    return {
      role: 'system',
      content: systemPrompt,
    };
  }

  /**
   * Gera resposta de fallback quando Ollama está offline
   */
  private generateFallbackResponse(messages: ChatMessage[]): string {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const userQuery = lastUserMessage?.content.toLowerCase() || '';
    
    // Respostas genéricas baseadas em palavras-chave
    if (userQuery.includes('quantos') || userQuery.includes('quantidade') || userQuery.includes('contar')) {
      return 'Não consigo acessar o serviço de IA no momento. Para verificar quantidades, utilize os relatórios disponíveis no sistema ou navegue até o módulo específico.';
    }
    
    if (userQuery.includes('status') || userQuery.includes('estado') || userQuery.includes('situação')) {
      return 'Não consigo acessar o serviço de IA no momento. Para verificar o status, navegue até o módulo específico e consulte os registros.';
    }
    
    if (userQuery.includes('criar') || userQuery.includes('cadastrar') || userQuery.includes('adicionar')) {
      return 'Não consigo acessar o serviço de IA no momento. Para criar novos registros, utilize o formulário de cadastro no módulo correspondente.';
    }
    
    if (userQuery.includes('analisar') || userQuery.includes('diagnóstico') || userQuery.includes('gargalo')) {
      return 'Não consigo acessar o serviço de IA no momento. Para análises detalhadas, utilize os relatórios disponíveis no sistema ou consulte a documentação.';
    }
    
    if (userQuery.includes('ajuda') || userQuery.includes('como') || userQuery.includes('orientar')) {
      return 'Não consigo acessar o serviço de IA no momento. Verifique se o Ollama está rodando em http://localhost:11434. Enquanto isso, você pode navegar pelos módulos do sistema ou consultar a documentação.';
    }
    
    // Resposta padrão
    return 'Não consigo acessar o serviço de IA no momento. Verifique se o Ollama está rodando em http://localhost:11434. Você pode continuar usando o sistema normalmente através da interface tradicional.';
  }

  /**
   * Define ferramentas disponíveis para function calling usando ToolRegistry
   */
  getAvailableTools(): ToolDefinition[] {
    const tools = toolRegistry.getAllTools();
    
    // Converter formato do ToolRegistry para formato esperado pelo Ollama
    return tools.map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }));
  }

  /**
   * Constrói contexto profundo do sistema
   */
  async buildDeepContext(userId?: string): Promise<AIContext> {
    try {
      const context: AIContext = {
        timestamp: new Date().toISOString(),
      };

      if (userId) {
        context.userId = userId;

        // Buscar usuário
        const { data: user } = await supabase
          .from('users')
          .select('*, role')
          .eq('id', userId)
          .single();

        if (user) {
          context.userRole = user.role;
        }
      }

      // Buscar informações da fábrica
      const { data: factory } = await supabase
        .from('empresas')
        .select('id, nome, cnpj')
        .limit(1)
        .single();

      if (factory) {
        context.factoryName = factory.nome;
        context.factoryId = factory.id;
      }

      // Buscar dados relevantes de todos os módulos
      const relevantData: Record<string, any> = {};

      // Contagem de ordens de produção
      const { count: productionOrdersCount } = await supabase
        .schema('industrial').from('ordens_producao')
        .select('*', { count: 'exact', head: true });

      relevantData.productionOrdersCount = productionOrdersCount || 0;

      // Contagem de itens de estoque
      const { count: inventoryCount } = await supabase
        .from('estoque')
        .select('*', { count: 'exact', head: true });

      relevantData.inventoryCount = inventoryCount || 0;

      // Contagem de registros de qualidade
      const { count: qualityRecordsCount } = await supabase
        .from('qualidade')
        .select('*', { count: 'exact', head: true });

      relevantData.qualityRecordsCount = qualityRecordsCount || 0;

      // Contagem de produtos
      const { count: productsCount } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true });

      relevantData.productsCount = productsCount || 0;

      // Contagem de funcionários
      const { count: employeesCount } = await supabase
        .from('funcionarios')
        .select('*', { count: 'exact', head: true });

      relevantData.employeesCount = employeesCount || 0;

      // Contagem de equipamentos
      const { count: equipmentCount } = await supabase
        .from('equipamentos')
        .select('*', { count: 'exact', head: true });

      relevantData.equipmentCount = equipmentCount || 0;

      // Contagem de fornecedores
      const { count: suppliersCount } = await supabase
        .from('fornecedores')
        .select('*', { count: 'exact', head: true });

      relevantData.suppliersCount = suppliersCount || 0;

      // Contagem de não-conformidades abertas
      const { count: openNonConformitiesCount } = await supabase
        .from('nao_conformidades')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      relevantData.openNonConformitiesCount = openNonConformitiesCount || 0;

      // Contagem de ordens de produção em andamento
      const { count: inProgressOrdersCount } = await supabase
        .schema('industrial').from('ordens_producao')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'em_producao');

      relevantData.inProgressOrdersCount = inProgressOrdersCount || 0;

      // Contagem de itens de estoque baixo
      const { count: lowStockCount } = await supabase
        .from('estoque')
        .select('*', { count: 'exact', head: true })
        .lt('quantity', 'min_quantity');

      relevantData.lowStockCount = lowStockCount || 0;

      context.relevantData = relevantData;

      return context;
    } catch (error) {
      console.error('Erro ao construir contexto profundo:', error);
      return {
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Constrói contexto específico de um módulo
   */
  async buildModuleContext(module: string, userId?: string): Promise<AIContext> {
    try {
      const context: AIContext = {
        timestamp: new Date().toISOString(),
        currentModule: module,
      };

      if (userId) {
        context.userId = userId;

        const { data: user } = await supabase
          .from('users')
          .select('*, role')
          .eq('id', userId)
          .single();

        if (user) {
          context.userRole = user.role;
        }
      }

      const relevantData: Record<string, any> = {};

      // Dados específicos por módulo
      switch (module) {
        case 'producao':
          const { count: productionOrdersCount } = await supabase
            .schema('industrial').from('ordens_producao')
            .select('*', { count: 'exact', head: true });
          relevantData.productionOrdersCount = productionOrdersCount || 0;

          const { count: inProgressOrdersCount } = await supabase
            .schema('industrial').from('ordens_producao')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'em_producao');
          relevantData.inProgressOrdersCount = inProgressOrdersCount || 0;
          break;

        case 'estoque':
          const { count: inventoryCount } = await supabase
            .from('estoque')
            .select('*', { count: 'exact', head: true });
          relevantData.inventoryCount = inventoryCount || 0;

          const { count: lowStockCount } = await supabase
            .from('estoque')
            .select('*', { count: 'exact', head: true })
            .lt('quantity', 'min_quantity');
          relevantData.lowStockCount = lowStockCount || 0;
          break;

        case 'qualidade':
          const { count: qualityRecordsCount } = await supabase
            .from('qualidade')
            .select('*', { count: 'exact', head: true });
          relevantData.qualityRecordsCount = qualityRecordsCount || 0;

          const { count: openNonConformitiesCount } = await supabase
            .from('nao_conformidades')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'open');
          relevantData.openNonConformitiesCount = openNonConformitiesCount || 0;
          break;

        case 'custos':
          const { count: productsCount } = await supabase
            .from('produtos')
            .select('*', { count: 'exact', head: true });
          relevantData.productsCount = productsCount || 0;
          break;

        default:
          // Dados gerais
          const { count: generalCount } = await supabase
            .schema('industrial').from('ordens_producao')
            .select('*', { count: 'exact', head: true });
          relevantData.generalCount = generalCount || 0;
          break;
      }

      context.relevantData = relevantData;

      return context;
    } catch (error) {
      console.error('Erro ao construir contexto de módulo:', error);
      return {
        timestamp: new Date().toISOString(),
        currentModule: module,
      };
    }
  }

  /**
   * Salva conversa na memória de longo prazo
   */
  async saveConversation(
    userId: string,
    conversationId: string,
    messages: ChatMessage[],
    context: AIContext
  ): Promise<ServiceResult<AIMemory>> {
    try {
      const { data, error } = await supabase
        .from('ai_memory')
        .upsert({
          user_id: userId,
          conversation_id: conversationId,
          messages: messages,
          context: context,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          userId: data.user_id,
          conversationId: data.conversation_id,
          messages: data.messages,
          context: data.context,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      };
    } catch (error) {
      console.error('Erro ao salvar conversa:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca conversa da memória de longo prazo
   */
  async getConversation(userId: string, conversationId: string): Promise<ServiceResult<AIMemory>> {
    try {
      const { data, error } = await supabase
        .from('ai_memory')
        .select('*')
        .eq('user_id', userId)
        .eq('conversation_id', conversationId)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          userId: data.user_id,
          conversationId: data.conversation_id,
          messages: data.messages,
          context: data.context,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      };
    } catch (error) {
      console.error('Erro ao buscar conversa:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista conversas do usuário
   */
  async listConversations(userId: string, limit: number = 10): Promise<ServiceResult<AIMemory[]>> {
    try {
      const { data, error } = await supabase
        .from('ai_memory')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        data: (data || []).map(item => ({
          id: item.id,
          userId: item.user_id,
          conversationId: item.conversation_id,
          messages: item.messages,
          context: item.context,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }))
      };
    } catch (error) {
      console.error('Erro ao listar conversas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Salva entrada de memória
   */
  async saveMemoryEntry(userId: string, key: string, value: any): Promise<ServiceResult<AIMemoryEntry>> {
    try {
      const { data, error } = await supabase
        .from('ai_memory_entries')
        .upsert({
          user_id: userId,
          key: key,
          value: value,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          userId: data.user_id,
          key: data.key,
          value: data.value,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      };
    } catch (error) {
      console.error('Erro ao salvar entrada de memória:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca entrada de memória
   */
  async getMemoryEntry(userId: string, key: string): Promise<ServiceResult<AIMemoryEntry>> {
    try {
      const { data, error } = await supabase
        .from('ai_memory_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('key', key)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          userId: data.user_id,
          key: data.key,
          value: data.value,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      };
    } catch (error) {
      console.error('Erro ao buscar entrada de memória:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista entradas de memória do usuário
   */
  async listMemoryEntries(userId: string, limit: number = 10): Promise<ServiceResult<AIMemoryEntry[]>> {
    try {
      const { data, error } = await supabase
        .from('ai_memory_entries')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        data: (data || []).map(item => ({
          id: item.id,
          userId: item.user_id,
          key: item.key,
          value: item.value,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }))
      };
    } catch (error) {
      console.error('Erro ao listar entradas de memória:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Deleta entrada de memória
   */
  async deleteMemoryEntry(userId: string, key: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('ai_memory_entries')
        .delete()
        .eq('user_id', userId)
        .eq('key', key);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar entrada de memória:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const aiService = new AIService();
