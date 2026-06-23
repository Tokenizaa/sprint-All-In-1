import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "../types";

export interface CopilotContext {
  id: string;
  tipo: 'producao' | 'qualidade' | 'inventario' | 'custos' | 'pcp' | 'manutencao';
  contexto: Record<string, any>;
  dados_agregados: Record<string, any>;
  data_criacao: string;
  data_atualizacao: string;
}

export interface CopilotSuggestion {
  id: string;
  tipo: 'alerta' | 'recomendacao' | 'otimizacao' | 'predicao';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  titulo: string;
  descricao: string;
  dados: Record<string, any>;
  acoes_sugeridas?: string[];
  modulo_afetado?: string;
  status: 'pendente' | 'revisada' | 'implementada' | 'ignorada';
  data_criacao: string;
  data_implementacao?: string;
}

export interface CreateCopilotContextInput {
  tipo: CopilotContext['tipo'];
  contexto: Record<string, any>;
  dados_agregados: Record<string, any>;
}

export interface CreateCopilotSuggestionInput {
  tipo: CopilotSuggestion['tipo'];
  prioridade: CopilotSuggestion['prioridade'];
  titulo: string;
  descricao: string;
  dados: Record<string, any>;
  acoes_sugeridas?: string[];
  modulo_afetado?: string;
}

export class CopilotDataService {
  /**
   * Busca todos os contextos do Copilot
   */
  async getAllContexts(): Promise<ServiceResult<CopilotContext[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('copilot_contextos')
        .select('*')
        .order('data_atualizacao', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as CopilotContext[]
      };
    } catch (error) {
      console.error('Erro ao buscar contextos do Copilot:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca contexto por tipo
   */
  async getContextByType(tipo: CopilotContext['tipo']): Promise<ServiceResult<CopilotContext>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('copilot_contextos')
        .select('*')
        .eq('tipo', tipo)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as CopilotContext
      };
    } catch (error) {
      console.error('Erro ao buscar contexto por tipo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria ou atualiza contexto do Copilot
   */
  async upsertContext(input: CreateCopilotContextInput): Promise<ServiceResult<CopilotContext>> {
    try {
      // Tenta buscar contexto existente
      const existing = await this.getContextByType(input.tipo);
      
      if (existing.success && existing.data) {
        // Atualiza existente
        const { data, error } = await supabase
          .schema('industrial').from('copilot_contextos')
          .update({
            contexto: input.contexto,
            dados_agregados: input.dados_agregados,
            data_atualizacao: new Date().toISOString(),
          })
          .eq('id', existing.data.id)
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          data: data as CopilotContext
        };
      } else {
        // Cria novo
        const { data, error } = await supabase
          .schema('industrial').from('copilot_contextos')
          .insert({
            ...input,
            data_criacao: new Date().toISOString(),
            data_atualizacao: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          data: data as CopilotContext
        };
      }
    } catch (error) {
      console.error('Erro ao salvar contexto do Copilot:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca todas as sugestões do Copilot
   */
  async getAllSuggestions(): Promise<ServiceResult<CopilotSuggestion[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('copilot_sugestoes')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as CopilotSuggestion[]
      };
    } catch (error) {
      console.error('Erro ao buscar sugestões do Copilot:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca sugestões pendentes
   */
  async getPendingSuggestions(): Promise<ServiceResult<CopilotSuggestion[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('copilot_sugestoes')
        .select('*')
        .eq('status', 'pendente')
        .order('prioridade', { ascending: false })
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as CopilotSuggestion[]
      };
    } catch (error) {
      console.error('Erro ao buscar sugestões pendentes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria uma nova sugestão do Copilot
   */
  async createSuggestion(input: CreateCopilotSuggestionInput): Promise<ServiceResult<CopilotSuggestion>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('copilot_sugestoes')
        .insert({
          ...input,
          status: 'pendente',
          data_criacao: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as CopilotSuggestion
      };
    } catch (error) {
      console.error('Erro ao criar sugestão do Copilot:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza status de uma sugestão
   */
  async updateSuggestionStatus(id: string, status: CopilotSuggestion['status']): Promise<ServiceResult<CopilotSuggestion>> {
    try {
      const updateData: any = { status };
      if (status === 'implementada') {
        updateData.data_implementacao = new Date().toISOString();
      }

      const { data, error } = await supabase
        .schema('industrial').from('copilot_sugestoes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as CopilotSuggestion
      };
    } catch (error) {
      console.error('Erro ao atualizar status da sugestão:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Gera contexto agregado para IA
   */
  async generateAIContext(): Promise<ServiceResult<Record<string, any>>> {
    try {
      const contexts = await this.getAllContexts();
      if (!contexts.success) {
        return {
          success: false,
          error: contexts.error
        };
      }

      const aggregatedContext: Record<string, any> = {};
      
      for (const context of contexts.data || []) {
        aggregatedContext[context.tipo] = {
          contexto: context.contexto,
          dados: context.dados_agregados,
          ultima_atualizacao: context.data_atualizacao,
        };
      }

      return {
        success: true,
        data: aggregatedContext
      };
    } catch (error) {
      console.error('Erro ao gerar contexto para IA:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Real-time subscription para contextos do Copilot
   */
  subscribeToContexts(callback: (payload: any) => void) {
    return supabase
      .channel('copilot-contextos-changes')
      .on('postgres_changes', { event: '*', schema: 'industrial', table: 'copilot_contextos' }, callback)
      .subscribe();
  }

  /**
   * Real-time subscription para sugestões do Copilot
   */
  subscribeToSuggestions(callback: (payload: any) => void) {
    return supabase
      .channel('copilot-sugestoes-changes')
      .on('postgres_changes', { event: '*', schema: 'industrial', table: 'copilot_sugestoes' }, callback)
      .subscribe();
  }
}

// Singleton instance
export const copilotDataService = new CopilotDataService();
