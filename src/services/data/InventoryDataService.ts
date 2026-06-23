import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "../types";

export interface InventoryItem {
  id: string;
  material_id?: string;
  componente_id?: string;
  produto_id?: string;
  quantidade: number;
  unidade: string;
  quantidade_minima: number;
  quantidade_maxima: number;
  quantidade_reservada: number;
  localizacao?: string;
  setor_id?: string;
  data_criacao: string;
  data_atualizacao: string;
}

export interface CreateInventoryItemInput {
  material_id?: string;
  componente_id?: string;
  produto_id?: string;
  quantidade: number;
  unidade: string;
  quantidade_minima?: number;
  quantidade_maxima?: number;
  localizacao?: string;
  setor_id?: string;
}

export interface UpdateInventoryItemInput {
  quantidade?: number;
  quantidade_minima?: number;
  quantidade_maxima?: number;
  quantidade_reservada?: number;
  localizacao?: string;
  setor_id?: string;
}

export interface StockMovement {
  id: string;
  estoque_id: string;
  tipo: 'entrada' | 'saida' | 'consumo' | 'producao' | 'transferencia';
  quantidade: number;
  motivo?: string;
  referencia_id?: string;
  data_criacao: string;
}

export class InventoryDataService {
  /**
   * Busca todos os itens de estoque
   */
  async getAll(): Promise<ServiceResult<InventoryItem[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('estoque_industrial')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as InventoryItem[]
      };
    } catch (error) {
      console.error('Erro ao buscar estoque:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca um item de estoque por ID
   */
  async getById(id: string): Promise<ServiceResult<InventoryItem>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('estoque_industrial')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as InventoryItem
      };
    } catch (error) {
      console.error('Erro ao buscar item de estoque:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria um novo item de estoque
   */
  async create(input: CreateInventoryItemInput): Promise<ServiceResult<InventoryItem>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('estoque_industrial')
        .insert({
          ...input,
          quantidade_reservada: 0,
          data_criacao: new Date().toISOString(),
          data_atualizacao: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as InventoryItem
      };
    } catch (error) {
      console.error('Erro ao criar item de estoque:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza um item de estoque
   */
  async update(id: string, input: UpdateInventoryItemInput): Promise<ServiceResult<InventoryItem>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('estoque_industrial')
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
        data: data as InventoryItem
      };
    } catch (error) {
      console.error('Erro ao atualizar item de estoque:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove um item de estoque
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .schema('industrial').from('estoque_industrial')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover item de estoque:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista itens com estoque baixo
   */
  async listLowStock(): Promise<ServiceResult<InventoryItem[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('estoque_industrial')
        .select('*')
        .order('saldo_atual', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as InventoryItem[]
      };
    } catch (error) {
      console.error('Erro ao listar estoque baixo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca histórico de movimentações
   */
  async getMovementHistory(inventoryId: string): Promise<ServiceResult<StockMovement[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('movimentacoes')
        .select()
        .eq('estoque_id', inventoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as StockMovement[]
      };
    } catch (error) {
      console.error('Erro ao buscar histórico de movimentações:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Real-time subscription para estoque
   */
  subscribeToInventory(callback: (payload: any) => void) {
    return supabase
      .channel('estoque-changes')
      .on('postgres_changes', { event: '*', schema: 'industrial', table: 'estoque_industrial' }, callback)
      .subscribe();
  }

  /**
   * Real-time subscription para movimentações
   */
  subscribeToMovements(callback: (payload: any) => void) {
    return supabase
      .channel('movimentacoes-changes')
      .on('postgres_changes', { event: '*', schema: 'industrial', table: 'movimentacoes' }, callback)
      .subscribe();
  }
}

// Singleton instance
export const inventoryDataService = new InventoryDataService();
