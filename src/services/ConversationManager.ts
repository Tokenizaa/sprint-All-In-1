import { supabase } from "@/lib/supabase";
import type { ChatMessage, AIContext } from "./types";

export interface Conversation {
  id: string;
  userId?: string;
  title?: string;
  messages: ChatMessage[];
  context: AIContext;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  isPinned?: boolean;
}

export interface ConversationSummary {
  id: string;
  title?: string;
  messageCount: number;
  lastMessage: string;
  lastMessageTime: string;
  createdAt: string;
  isArchived: boolean;
  isPinned: boolean;
}

export interface ConversationFilter {
  userId?: string;
  isArchived?: boolean;
  isPinned?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export class ConversationManager {
  private memoryCache: Map<string, Conversation> = new Map();
  private cacheEnabled: boolean = true;
  private maxCacheSize: number = 100;
  
  async createConversation(
    userId?: string,
    initialContext?: Partial<AIContext>,
    title?: string
  ): Promise<Conversation> {
    const conversation: Conversation = {
      id: this.generateId(),
      userId,
      title: title || this.generateTitle(),
      messages: [],
      context: {
        timestamp: new Date().toISOString(),
        ...initialContext
      },
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      isPinned: false
    };
    
    // Salvar no cache
    if (this.cacheEnabled) {
      this.addToCache(conversation);
    }
    
    // Salvar no banco de dados
    await this.saveToDatabase(conversation);
    
    return conversation;
  }
  
  async getConversation(conversationId: string): Promise<Conversation | null> {
    // Tentar buscar do cache primeiro
    if (this.cacheEnabled && this.memoryCache.has(conversationId)) {
      return this.memoryCache.get(conversationId)!;
    }
    
    // Buscar do banco de dados
    const conversation = await this.loadFromDatabase(conversationId);
    
    if (conversation && this.cacheEnabled) {
      this.addToCache(conversation);
    }
    
    return conversation;
  }
  
  async updateConversation(
    conversationId: string,
    updates: Partial<Conversation>
  ): Promise<Conversation | null> {
    const conversation = await this.getConversation(conversationId);
    
    if (!conversation) {
      return null;
    }
    
    // Atualizar campos
    const updatedConversation: Conversation = {
      ...conversation,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Atualizar cache
    if (this.cacheEnabled) {
      this.memoryCache.set(conversationId, updatedConversation);
    }
    
    // Atualizar banco de dados
    await this.saveToDatabase(updatedConversation);
    
    return updatedConversation;
  }
  
  async addMessage(
    conversationId: string,
    message: ChatMessage
  ): Promise<Conversation | null> {
    const conversation = await this.getConversation(conversationId);
    
    if (!conversation) {
      return null;
    }
    
    // Adicionar mensagem
    const updatedConversation: Conversation = {
      ...conversation,
      messages: [...conversation.messages, message],
      updatedAt: new Date().toISOString()
    };
    
    // Atualizar título se for a primeira mensagem do usuário
    if (conversation.messages.length === 0 && message.role === 'user') {
      updatedConversation.title = this.generateTitleFromMessage(message.content);
    }
    
    // Atualizar cache
    if (this.cacheEnabled) {
      this.memoryCache.set(conversationId, updatedConversation);
    }
    
    // Atualizar banco de dados
    await this.saveToDatabase(updatedConversation);
    
    return updatedConversation;
  }
  
  async updateContext(
    conversationId: string,
    context: Partial<AIContext>
  ): Promise<Conversation | null> {
    const conversation = await this.getConversation(conversationId);
    
    if (!conversation) {
      return null;
    }
    
    const updatedConversation: Conversation = {
      ...conversation,
      context: {
        ...conversation.context,
        ...context,
        timestamp: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    };
    
    // Atualizar cache
    if (this.cacheEnabled) {
      this.memoryCache.set(conversationId, updatedConversation);
    }
    
    // Atualizar banco de dados
    await this.saveToDatabase(updatedConversation);
    
    return updatedConversation;
  }
  
  async deleteConversation(conversationId: string): Promise<boolean> {
    // Remover do cache
    if (this.cacheEnabled) {
      this.memoryCache.delete(conversationId);
    }
    
    // Remover do banco de dados
    try {
      const { error } = await supabase
        .from('copilot_conversations')
        .delete()
        .eq('id', conversationId);
      
      return !error;
    } catch (error) {
      console.error('Erro ao deletar conversação:', error);
      return false;
    }
  }
  
  async listConversations(filter?: ConversationFilter): Promise<ConversationSummary[]> {
    try {
      let query = supabase
        .from('copilot_conversations')
        .select('id, title, messages, created_at, updated_at, is_archived, is_pinned')
        .order('updated_at', { ascending: false });
      
      if (filter?.userId) {
        query = query.eq('user_id', filter.userId);
      }
      
      if (filter?.isArchived !== undefined) {
        query = query.eq('is_archived', filter.isArchived);
      }
      
      if (filter?.isPinned !== undefined) {
        query = query.eq('is_pinned', filter.isPinned);
      }
      
      if (filter?.startDate) {
        query = query.gte('created_at', filter.startDate);
      }
      
      if (filter?.endDate) {
        query = query.lte('created_at', filter.endDate);
      }
      
      if (filter?.limit) {
        query = query.limit(filter.limit);
      }
      
      if (filter?.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error || !data) {
        return [];
      }
      
      return data.map(conv => ({
        id: conv.id,
        title: conv.title,
        messageCount: Array.isArray(conv.messages) ? conv.messages.length : 0,
        lastMessage: this.getLastMessage(conv.messages),
        lastMessageTime: conv.updated_at,
        createdAt: conv.created_at,
        isArchived: conv.is_archived || false,
        isPinned: conv.is_pinned || false
      }));
    } catch (error) {
      console.error('Erro ao listar conversações:', error);
      return [];
    }
  }
  
  async archiveConversation(conversationId: string): Promise<boolean> {
    return this.updateConversation(conversationId, { isArchived: true })
      .then(() => true)
      .catch(() => false);
  }
  
  async unarchiveConversation(conversationId: string): Promise<boolean> {
    return this.updateConversation(conversationId, { isArchived: false })
      .then(() => true)
      .catch(() => false);
  }
  
  async pinConversation(conversationId: string): Promise<boolean> {
    return this.updateConversation(conversationId, { isPinned: true })
      .then(() => true)
      .catch(() => false);
  }
  
  async unpinConversation(conversationId: string): Promise<boolean> {
    return this.updateConversation(conversationId, { isPinned: false })
      .then(() => true)
      .catch(() => false);
  }
  
  async clearOldConversations(maxAgeDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
      
      const { data, error } = await supabase
        .from('copilot_conversations')
        .select('id')
        .lt('created_at', cutoffDate.toISOString())
        .eq('is_pinned', false);
      
      if (error || !data) {
        return 0;
      }
      
      const ids = data.map(conv => conv.id);
      
      if (ids.length === 0) {
        return 0;
      }
      
      const { error: deleteError } = await supabase
        .from('copilot_conversations')
        .delete()
        .in('id', ids);
      
      if (deleteError) {
        return 0;
      }
      
      // Limpar cache
      for (const id of ids) {
        this.memoryCache.delete(id);
      }
      
      return ids.length;
    } catch (error) {
      console.error('Erro ao limpar conversações antigas:', error);
      return 0;
    }
  }
  
  async searchConversations(query: string, userId?: string): Promise<ConversationSummary[]> {
    try {
      // Buscar conversações do usuário
      let dbQuery = supabase
        .from('copilot_conversations')
        .select('id, title, messages, created_at, updated_at, is_archived, is_pinned');
      
      if (userId) {
        dbQuery = dbQuery.eq('user_id', userId);
      }
      
      const { data, error } = await dbQuery;
      
      if (error || !data) {
        return [];
      }
      
      // Filtrar por query
      const filtered = data.filter(conv => {
        const titleMatch = conv.title?.toLowerCase().includes(query.toLowerCase());
        const messageMatch = Array.isArray(conv.messages) && 
          conv.messages.some((m: any) => 
            m.content?.toLowerCase().includes(query.toLowerCase())
          );
        
        return titleMatch || messageMatch;
      });
      
      return filtered.map(conv => ({
        id: conv.id,
        title: conv.title,
        messageCount: Array.isArray(conv.messages) ? conv.messages.length : 0,
        lastMessage: this.getLastMessage(conv.messages),
        lastMessageTime: conv.updated_at,
        createdAt: conv.created_at,
        isArchived: conv.is_archived || false,
        isPinned: conv.is_pinned || false
      }));
    } catch (error) {
      console.error('Erro ao buscar conversações:', error);
      return [];
    }
  }
  
  setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
    
    if (!enabled) {
      this.memoryCache.clear();
    }
  }
  
  clearCache(): void {
    this.memoryCache.clear();
  }
  
  getCacheSize(): number {
    return this.memoryCache.size;
  }
  
  private async saveToDatabase(conversation: Conversation): Promise<void> {
    try {
      const { error } = await supabase
        .from('copilot_conversations')
        .upsert({
          id: conversation.id,
          user_id: conversation.userId,
          title: conversation.title,
          messages: conversation.messages,
          context: conversation.context,
          metadata: conversation.metadata,
          created_at: conversation.createdAt,
          updated_at: conversation.updatedAt,
          is_archived: conversation.isArchived,
          is_pinned: conversation.isPinned
        });
      
      if (error) {
        console.error('Erro ao salvar conversação no banco:', error);
      }
    } catch (error) {
      console.error('Erro ao salvar conversação no banco:', error);
    }
  }
  
  private async loadFromDatabase(conversationId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('copilot_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        messages: data.messages || [],
        context: data.context || {},
        metadata: data.metadata || {},
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isArchived: data.is_archived,
        isPinned: data.is_pinned
      };
    } catch (error) {
      console.error('Erro ao carregar conversação do banco:', error);
      return null;
    }
  }
  
  private addToCache(conversation: Conversation): void {
    // Implementar LRU se necessário
    if (this.memoryCache.size >= this.maxCacheSize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    
    this.memoryCache.set(conversation.id, conversation);
  }
  
  private generateId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateTitle(): string {
    const titles = [
      'Nova conversa',
      'Consulta industrial',
      'Análise de produção',
      'Verificação de estoque',
      'Diagnóstico de qualidade',
      'Consulta financeira',
      'Análise de fornecedores'
    ];
    
    return titles[Math.floor(Math.random() * titles.length)];
  }
  
  private generateTitleFromMessage(message: string): string {
    // Pegar as primeiras 50 caracteres
    const truncated = message.substring(0, 50);
    return truncated.length === message.length ? truncated : truncated + '...';
  }
  
  private getLastMessage(messages: any): string {
    if (!Array.isArray(messages) || messages.length === 0) {
      return '';
    }
    
    const lastMessage = messages[messages.length - 1];
    return lastMessage?.content || '';
  }
}

export const conversationManager = new ConversationManager();
