import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";

export interface BOMItem {
  id: string;
  produto_id: string;
  componente_id?: string;
  quantidade: number;
  unidade_medida?: string;
  sequencia?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateBOMItemInput {
  produto_id: string;
  componente_id: string;
  quantidade: number;
  unidade_medida?: string;
  sequencia?: number;
  observacoes?: string;
}

export interface UpdateBOMItemInput {
  quantidade?: number;
  unidade_medida?: string;
  sequencia?: number;
  observacoes?: string;
}

export class BOMService {
  /**
   * Adiciona um item à BOM de um produto
   */
  async addItem(input: CreateBOMItemInput): Promise<ServiceResult<BOMItem>> {
    try {
      // Validar que componente foi especificado
      if (!input.componente_id) {
        return {
          success: false,
          error: 'É necessário especificar componente_id'
        };
      }

      const { data, error } = await supabase
        .schema('industrial').from('bom')
        .insert(input)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as BOMItem
      };
    } catch (error) {
      console.error('Erro ao adicionar item à BOM:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza um item da BOM
   */
  async updateItem(id: string, input: UpdateBOMItemInput): Promise<ServiceResult<BOMItem>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('bom')
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
        data: data as BOMItem
      };
    } catch (error) {
      console.error('Erro ao atualizar item da BOM:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove um item da BOM
   */
  async removeItem(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .schema('industrial').from('bom')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover item da BOM:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca a BOM completa de um produto
   */
  async getByProduct(productId: string): Promise<ServiceResult<BOMItem[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('bom')
        .select(`
          *,
          componente:componente_id (
            id,
            nome,
            categoria,
            especificacoes
          )
        `)
        .eq('produto_id', productId)
        .is('deleted_at', null)
        .order('sequencia', { ascending: true, nullsFirst: false });

      if (error) throw error;

      return {
        success: true,
        data: data as BOMItem[]
      };
    } catch (error) {
      console.error('Erro ao buscar BOM:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Duplica a BOM de um produto para outro
   */
  async duplicateBOM(fromProductId: string, toProductId: string): Promise<ServiceResult<void>> {
    try {
      // Buscar BOM do produto origem
      const bomResult = await this.getByProduct(fromProductId);
      if (!bomResult.success) {
        return {
          success: false,
          error: bomResult.error
        };
      }

      // Criar itens da BOM para o produto destino
      for (const item of bomResult.data) {
        await this.addItem({
          produto_id: toProductId,
          componente_id: item.componente_id,
          quantidade: item.quantidade,
          unidade_medida: item.unidade_medida,
          sequencia: item.sequencia,
          observacoes: item.observacoes,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao duplicar BOM:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verifica se a BOM de um produto está completa
   */
  async isComplete(productId: string): Promise<ServiceResult<{ complete: boolean; missingItems: string[] }>> {
    try {
      const bomResult = await this.getByProduct(productId);
      if (!bomResult.success) {
        return {
          success: false,
          error: bomResult.error
        };
      }

      if (bomResult.data.length === 0) {
        return {
          success: true,
          data: {
            complete: false,
            missingItems: ['BOM vazia']
          }
        };
      }

      // Verificar se todos os itens têm componente definido
      const missingComponents = bomResult.data.filter(item => !item.componente_id);
      
      if (missingComponents.length > 0) {
        return {
          success: true,
          data: {
            complete: false,
            missingItems: missingComponents.map(item => `Item ${item.id} sem componente definido`)
          }
        };
      }

      return {
        success: true,
        data: {
          complete: true,
          missingItems: []
        }
      };
    } catch (error) {
      console.error('Erro ao verificar BOM:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza o custo do produto baseado na BOM
   * NOTA: Esta funcionalidade precisa ser implementada com cálculo real de custo
   */
  private async updateProductCost(productId: string): Promise<void> {
    try {
      // TODO: Implementar cálculo real de custo baseado nos componentes
      // A tabela industrial.produtos não tem coluna 'cost'
      // Precisa adicionar coluna de custo ou usar JSONB em especificacoes
      console.log('updateProductCost: funcionalidade não implementada ainda');
    } catch (error) {
      console.error('Erro ao atualizar custo do produto:', error);
    }
  }

  /**
   * Calcula o custo total da BOM
   */
  async calculateTotalCost(productId: string): Promise<ServiceResult<number>> {
    try {
      const bomResult = await this.getByProduct(productId);
      if (!bomResult.success) {
        return {
          success: false,
          error: bomResult.error
        };
      }

      // TODO: Implementar cálculo real de custo baseado nos componentes
      // A tabela industrial.bill_of_materials não tem coluna 'unit_cost'
      const totalCost = bomResult.data.reduce((sum, item) => {
        return sum + (item.quantidade || 0);
      }, 0);

      return {
        success: true,
        data: totalCost
      };
    } catch (error) {
      console.error('Erro ao calcular custo da BOM:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const bomService = new BOMService();
