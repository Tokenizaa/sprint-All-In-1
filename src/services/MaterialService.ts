import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";

export interface Material {
  id: string;
  codigo: string;
  descricao: string;
  categoria?: string;
  unidade_medida: string;
  estoque_atual: number;
  estoque_minimo: number;
  estoque_maximo?: number;
  custo_unitario?: number;
  custo_medio?: number;
  fornecedor_padrao_id?: string;
  localizacao_id?: string;
  especificacoes?: Record<string, any>;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateMaterialInput {
  codigo: string;
  descricao: string;
  categoria?: string;
  unidade_medida: string;
  estoque_atual?: number;
  estoque_minimo?: number;
  estoque_maximo?: number;
  custo_unitario?: number;
  custo_medio?: number;
  fornecedor_padrao_id?: string;
  localizacao_id?: string;
  especificacoes?: Record<string, any>;
  observacoes?: string;
}

export interface UpdateMaterialInput {
  codigo?: string;
  descricao?: string;
  categoria?: string;
  unidade_medida?: string;
  estoque_atual?: number;
  estoque_minimo?: number;
  estoque_maximo?: number;
  custo_unitario?: number;
  custo_medio?: number;
  fornecedor_padrao_id?: string;
  localizacao_id?: string;
  especificacoes?: Record<string, any>;
  observacoes?: string;
}

export class MaterialService {
  /**
   * Cria uma nova matéria-prima
   */
  async create(input: CreateMaterialInput): Promise<ServiceResult<Material>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('materiais')
        .insert({
          codigo: input.codigo,
          descricao: input.descricao,
          categoria: input.categoria,
          unidade_medida: input.unidade_medida,
          estoque_atual: input.estoque_atual || 0,
          estoque_minimo: input.estoque_minimo || 0,
          estoque_maximo: input.estoque_maximo,
          custo_unitario: input.custo_unitario,
          custo_medio: input.custo_medio,
          fornecedor_padrao_id: input.fornecedor_padrao_id,
          localizacao_id: input.localizacao_id,
          especificacoes: input.especificacoes,
          observacoes: input.observacoes,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Material
      };
    } catch (error) {
      console.error('Erro ao criar matéria-prima:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza uma matéria-prima
   */
  async update(id: string, input: UpdateMaterialInput): Promise<ServiceResult<Material>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('materiais')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Material
      };
    } catch (error) {
      console.error('Erro ao atualizar matéria-prima:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove uma matéria-prima (soft delete)
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .schema('industrial').from('materiais')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover matéria-prima:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca uma matéria-prima por ID
   */
  async getById(id: string): Promise<ServiceResult<Material>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('materiais')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Material
      };
    } catch (error) {
      console.error('Erro ao buscar matéria-prima:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista matérias-primas
   */
  async list(options?: {
    search?: string;
    categoria?: string;
    fornecedor?: string;
    lowStock?: boolean;
  }): Promise<ServiceResult<Material[]>> {
    try {
      let query = supabase
        .schema('industrial').from('materiais')
        .select('*')
        .is('deleted_at', null);

      if (options?.search) {
        query = query.or(`codigo.ilike.%${options.search}%,descricao.ilike.%${options.search}%`);
      }

      if (options?.categoria) {
        query = query.eq('categoria', options.categoria);
      }

      if (options?.fornecedor) {
        query = query.eq('fornecedor_padrao_id', options.fornecedor);
      }

      if (options?.lowStock) {
        // Filtrar matérias-primas com estoque abaixo do mínimo
        const { data, error } = await query
          .gt('estoque_minimo', 0)
          .order('created_at', { ascending: false });
        
        if (error) throw error;

        const lowStockItems = (data as Material[]).filter(material => {
          return material.estoque_atual < material.estoque_minimo;
        });

        return {
          success: true,
          data: lowStockItems
        };
      }

      const { data, error } = await query.order('codigo', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as Material[]
      };
    } catch (error) {
      console.error('Erro ao listar matérias-primas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca matérias-primas com estoque baixo
   */
  async getLowStockMaterials(): Promise<ServiceResult<Material[]>> {
    return this.list({ lowStock: true });
  }

  /**
   * Busca matérias-primas por categoria
   */
  async getByCategory(categoria: string): Promise<ServiceResult<Material[]>> {
    return this.list({ categoria });
  }

  /**
   * Busca matérias-primas por fornecedor
   */
  async getBySupplier(fornecedor: string): Promise<ServiceResult<Material[]>> {
    return this.list({ fornecedor });
  }

  /**
   * Calcula o estoque total de matérias-primas
   */
  async getTotalStock(): Promise<ServiceResult<number>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('materiais')
        .select('estoque_atual')
        .is('deleted_at', null);

      if (error) throw error;

      const total = (data as Material[]).reduce((sum, material) => {
        return sum + (material.estoque_atual || 0);
      }, 0);

      return {
        success: true,
        data: total
      };
    } catch (error) {
      console.error('Erro ao calcular estoque total:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza o estoque de uma matéria-prima
   */
  async updateStock(id: string, quantity: number): Promise<ServiceResult<Material>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('materiais')
        .update({
          estoque_atual: quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Material
      };
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verifica disponibilidade de matéria-prima
   */
  async checkAvailability(id: string, requiredQuantity: number): Promise<ServiceResult<{ available: boolean; currentStock: number }>> {
    try {
      const materialResult = await this.getById(id);
      if (!materialResult.success || !materialResult.data) {
        return {
          success: false,
          error: 'Matéria-prima não encontrada'
        };
      }

      const currentStock = materialResult.data.estoque_atual || 0;
      const available = currentStock >= requiredQuantity;

      return {
        success: true,
        data: { available, currentStock }
      };
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const materialService = new MaterialService();
