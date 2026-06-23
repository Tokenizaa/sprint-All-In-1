import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "../types";

export interface ProductionOrder {
  id: string;
  numero: string;
  produto: string;
  quantidade: number;
  status: 'rascunho' | 'planejada' | 'liberada' | 'em_producao' | 'concluida' | 'cancelada';
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
  data_inicio: string;
  data_previsao: string;
  data_conclusao?: string;
  observacoes?: string;
  data_criacao: string;
  data_atualizacao: string;
}

export interface CreateProductionOrderInput {
  produto: string;
  quantidade: number;
  prioridade?: 'baixa' | 'normal' | 'alta' | 'urgente';
  data_inicio?: string;
  data_previsao?: string;
  observacoes?: string;
}

export interface UpdateProductionOrderInput {
  quantidade?: number;
  status?: ProductionOrder['status'];
  prioridade?: 'baixa' | 'normal' | 'alta' | 'urgente';
  data_inicio?: string;
  data_previsao?: string;
  data_conclusao?: string;
  observacoes?: string;
}

export class ProductionDataService {
  /**
   * Busca todas as ordens de produção
   */
  async getAll(): Promise<ServiceResult<ProductionOrder[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('ordens_producao')
        .select(`
          *,
          produtos:produto_id (modelo, sku)
        `)
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as ProductionOrder[]
      };
    } catch (error) {
      console.error('Erro ao buscar ordens de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca uma ordem de produção por ID
   */
  async getById(id: string): Promise<ServiceResult<ProductionOrder>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('ordens_producao')
        .select(`
          *,
          produtos:produto_id (modelo, sku)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as ProductionOrder
      };
    } catch (error) {
      console.error('Erro ao buscar ordem de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria uma nova ordem de produção
   */
  async create(input: CreateProductionOrderInput): Promise<ServiceResult<ProductionOrder>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('ordens_producao')
        .insert({
          ...input,
          status: 'planejada',
          prioridade: input.prioridade || 'normal',
          data_criacao: new Date().toISOString(),
          data_atualizacao: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as ProductionOrder
      };
    } catch (error) {
      console.error('Erro ao criar ordem de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza uma ordem de produção
   */
  async update(id: string, input: UpdateProductionOrderInput): Promise<ServiceResult<ProductionOrder>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('ordens_producao')
        .update({
          ...input,
          data_atualizacao: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as ProductionOrder
      };
    } catch (error) {
      console.error('Erro ao atualizar ordem de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove uma ordem de produção (soft delete)
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .schema('industrial').from('ordens_producao')
        .update({ status: 'cancelada', data_atualizacao: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover ordem de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista ordens por status
   */
  async getByStatus(status: ProductionOrder['status']): Promise<ServiceResult<ProductionOrder[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('ordens_producao')
        .select(`
          *,
          produtos:produto_id (modelo, sku)
        `)
        .eq('status', status)
        .order('data_criacao', { ascending: false });

     if (error) throw error;

      return {
        success: true,
        data: data as ProductionOrder[]
      };
    } catch (error) {
      console.error('Erro ao buscar ordens por status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Real-time subscription para ordens de produção
   */
  subscribeToProductionOrders(callback: (payload: any) => void) {
    return supabase
      .channel('ordens-producao-changes')
      .on('postgres_changes', { event: '*', schema: 'industrial', table: 'ordens_producao' }, callback)
      .subscribe();
  }
}

// Singleton instance
export const productionDataService = new ProductionDataService();
