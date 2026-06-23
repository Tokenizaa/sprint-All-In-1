import { supabase } from '@/lib/supabase';

export interface CopilotEvent {
  id?: string;
  conversation_id?: string;
  user_id?: string;
  event_type: 'message_sent' | 'message_received' | 'tool_called' | 'error' | 'routing_decision' | 'context_update';
  event_data: Record<string, any>;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface CopilotMetrics {
  total_conversations: number;
  total_messages: number;
  total_tool_calls: number;
  total_errors: number;
  average_response_time: number;
  routing_distribution: Record<string, number>;
  tool_usage: Record<string, number>;
}

export class CopilotObservability {
  private events: CopilotEvent[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 segundos
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startFlushTimer();
  }

  /**
   * Registra um evento do copilot
   */
  async logEvent(event: Omit<CopilotEvent, 'id' | 'created_at'>): Promise<void> {
    const eventWithTimestamp: CopilotEvent = {
      ...event,
      created_at: new Date().toISOString(),
    };

    this.events.push(eventWithTimestamp);

    // Flush se atingir o batch size
    if (this.events.length >= this.batchSize) {
      await this.flushEvents();
    }
  }

  /**
   * Envia eventos em lote para o banco de dados
   */
  private async flushEvents(): Promise<void> {
    if (this.events.length === 0) return;

    try {
      const eventsToFlush = [...this.events];
      this.events = [];

      const { error } = await supabase
        .from('copilot_events')
        .insert(eventsToFlush);

      if (error) {
        console.error('Erro ao salvar eventos de observabilidade:', error);
        // Requeue events on error
        this.events = [...eventsToFlush, ...this.events];
      }
    } catch (error) {
      console.error('Erro ao fazer flush de eventos:', error);
    }
  }

  /**
   * Inicia o timer de flush automático
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  /**
   * Para o timer de flush automático e faz flush final
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flushEvents();
  }

  /**
   * Obtém métricas agregadas do copilot
   */
  async getMetrics(userId?: string, startDate?: Date, endDate?: Date): Promise<CopilotMetrics> {
    try {
      let query = supabase
        .from('copilot_events')
        .select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data: events, error } = await query;

      if (error) throw error;

      if (!events || events.length === 0) {
        return {
          total_conversations: 0,
          total_messages: 0,
          total_tool_calls: 0,
          total_errors: 0,
          average_response_time: 0,
          routing_distribution: {},
          tool_usage: {},
        };
      }

      // Calcular métricas
      const totalMessages = events.filter(e => e.event_type === 'message_sent').length;
      const totalToolCalls = events.filter(e => e.event_type === 'tool_called').length;
      const totalErrors = events.filter(e => e.event_type === 'error').length;
      
      const uniqueConversations = new Set(events.map(e => e.conversation_id)).size;

      // Distribuição de routing
      const routingDistribution: Record<string, number> = {};
      events.filter(e => e.event_type === 'routing_decision').forEach(e => {
        const strategy = e.event_data.strategy || 'unknown';
        routingDistribution[strategy] = (routingDistribution[strategy] || 0) + 1;
      });

      // Uso de ferramentas
      const toolUsage: Record<string, number> = {};
      events.filter(e => e.event_type === 'tool_called').forEach(e => {
        const toolName = e.event_data.tool_name || 'unknown';
        toolUsage[toolName] = (toolUsage[toolName] || 0) + 1;
      });

      // Tempo médio de resposta
      const responseTimes = events
        .filter(e => e.event_type === 'message_received' && e.event_data.response_time)
        .map(e => e.event_data.response_time);
      
      const averageResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

      return {
        total_conversations: uniqueConversations,
        total_messages: totalMessages,
        total_tool_calls: totalToolCalls,
        total_errors: totalErrors,
        average_response_time: averageResponseTime,
        routing_distribution: routingDistribution,
        tool_usage: toolUsage,
      };
    } catch (error) {
      console.error('Erro ao obter métricas:', error);
      return {
        total_conversations: 0,
        total_messages: 0,
        total_tool_calls: 0,
        total_errors: 0,
        average_response_time: 0,
        routing_distribution: {},
        tool_usage: {},
      };
    }
  }

  /**
   * Obtém eventos recentes para debugging
   */
  async getRecentEvents(limit: number = 50, conversationId?: string): Promise<CopilotEvent[]> {
    try {
      let query = supabase
        .from('copilot_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      }

      const { data: events, error } = await query;

      if (error) throw error;

      return events || [];
    } catch (error) {
      console.error('Erro ao obter eventos recentes:', error);
      return [];
    }
  }
}

export const copilotObservability = new CopilotObservability();
