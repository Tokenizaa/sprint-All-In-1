import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";

export interface InventoryItem {
  id: string;
  material_id?: string;
  component_id?: string;
  product_id?: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  max_quantity: number;
  location?: string;
  sector_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryItemInput {
  material_id?: string;
  component_id?: string;
  product_id?: string;
  quantity: number;
  unit: string;
  min_quantity?: number;
  max_quantity?: number;
  location?: string;
  sector_id?: string;
}

export interface UpdateInventoryItemInput {
  quantity?: number;
  min_quantity?: number;
  max_quantity?: number;
  location?: string;
  sector_id?: string;
}

export interface StockMovement {
  id: string;
  inventory_id: string;
  type: 'entry' | 'exit' | 'consumption' | 'production' | 'transfer';
  quantity: number;
  reason?: string;
  reference_id?: string;
  created_at: string;
}

export class InventoryService {
  /**
   * Cria um novo item de estoque
   */
  async createItem(input: CreateInventoryItemInput): Promise<ServiceResult<InventoryItem>> {
    try {
      // Validar que pelo menos um tipo foi especificado
      if (!input.material_id && !input.component_id && !input.product_id) {
        return {
          success: false,
          error: 'É necessário especificar material_id, component_id ou product_id'
        };
      }

      // Validar que não foi especificado mais de um
      const specified = [input.material_id, input.component_id, input.product_id].filter(Boolean).length;
      if (specified > 1) {
        return {
          success: false,
          error: 'Especifique apenas um: material_id, component_id ou product_id'
        };
      }

      const { data, error } = await supabase
        .schema('industrial').from('estoque_industrial')
        .insert({
          material_id: input.material_id,
          componente_id: input.component_id,
          produto_id: input.product_id,
          quantidade: input.quantity,
          unidade: input.unit,
          quantidade_minima: input.min_quantity || 0,
          quantidade_maxima: input.max_quantity || 1000,
          localizacao: input.location,
          setor_id: input.sector_id,
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
  async updateItem(id: string, input: UpdateInventoryItemInput): Promise<ServiceResult<InventoryItem>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('estoque_industrial')
        .update({
          quantidade: input.quantity,
          quantidade_minima: input.min_quantity,
          quantidade_maxima: input.max_quantity,
          localizacao: input.location,
          setor_id: input.sector_id,
          data_atualizacao: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Verificar se está abaixo do mínimo e gerar alerta
      if (input.quantity !== undefined) {
        await this.checkLowStock(id);
      }

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
  async deleteItem(id: string): Promise<ServiceResult<void>> {
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
   * Lista itens de estoque
   */
  async list(options?: { 
    material_id?: string; 
    component_id?: string; 
    product_id?: string;
    sector_id?: string;
    lowStock?: boolean;
  }): Promise<ServiceResult<InventoryItem[]>> {
    try {
      let query = supabase
        .schema('industrial').from('estoque_industrial')
        .select('*');

      if (options?.material_id) {
        query = query.eq('material_id', options.material_id);
      }

      if (options?.component_id) {
        query = query.eq('component_id', options.component_id);
      }

      if (options?.product_id) {
        query = query.eq('produto_id', options.product_id);
      }

      if (options?.sector_id) {
        query = query.eq('setor_id', options.sector_id);
      }

      if (options?.lowStock) {
        // PostgREST can't compare two columns, so we fetch all and filter client-side
        // or use RPC. For now we just fetch all.
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as InventoryItem[]
      };
    } catch (error) {
      console.error('Erro ao listar estoque:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Registra uma movimentação de estoque
   */
  async registerMovement(input: {
    inventory_id: string;
    type: 'entry' | 'exit' | 'consumption' | 'production' | 'transfer';
    quantity: number;
    reason?: string;
    reference_id?: string;
  }): Promise<ServiceResult<StockMovement>> {
    try {
      // Buscar item de estoque atual
      const { data: inventoryItem } = await supabase
        .schema('industrial').from('estoque_industrial')
        .select('quantidade')
        .eq('id', input.inventory_id)
        .single();

      if (!inventoryItem) {
        return {
          success: false,
          error: 'Item de estoque não encontrado'
        };
      }

      // Calcular nova quantidade
      let newQuantity = inventoryItem.quantidade || 0;
      if (input.type === 'entry' || input.type === 'production') {
        newQuantity += input.quantity;
      } else {
        newQuantity -= input.quantity;
        if (newQuantity < 0) {
          return {
            success: false,
            error: 'Quantidade insuficiente em estoque'
          };
        }
      }

      // Atualizar estoque
      const { error: updateError } = await supabase
        .schema('industrial').from('estoque_industrial')
        .update({ quantidade: newQuantity })
        .eq('id', input.inventory_id);

      if (updateError) throw updateError;

      // Registrar movimentação
      const { data, error } = await supabase
        .schema('industrial').from('movimentacoes')
        .insert({
          estoque_id: input.inventory_id,
          tipo: input.type,
          quantidade: input.quantity,
          motivo: input.reason,
          referencia_id: input.reference_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Verificar se está abaixo do mínimo
      await this.checkLowStock(input.inventory_id);

      return {
        success: true,
        data: data as StockMovement
      };
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca histórico de movimentações de um item
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
   * Verifica se o estoque está abaixo do mínimo
   */
  async checkLowStock(inventoryId: string): Promise<ServiceResult<{ isLow: boolean; current: number; min: number }>> {
    try {
      const { data: inventoryItem } = await supabase
        .schema('industrial').from('estoque_industrial')
        .select('quantidade, quantidade_minima')
        .eq('id', inventoryId)
        .single();

      if (!inventoryItem) {
        return {
          success: false,
          error: 'Item de estoque não encontrado'
        };
      }

      const isLow = (inventoryItem.quantidade || 0) < (inventoryItem.quantidade_minima || 0);

      if (isLow) {
        // Aqui poderia ser implementada uma notificação ou alerta
        console.warn(`Estoque baixo para item ${inventoryId}: ${inventoryItem.quantidade} < ${inventoryItem.quantidade_minima}`);
      }

      return {
        success: true,
        data: {
          isLow,
          current: inventoryItem.quantidade || 0,
          min: inventoryItem.quantidade_minima || 0
        }
      };
    } catch (error) {
      console.error('Erro ao verificar estoque baixo:', error);
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
   * Reserva estoque para uma ordem de produção
   */
  async reserveStock(inventoryId: string, quantity: number, referenceId: string): Promise<ServiceResult<any>> {
    try {
      return await this.registerMovement({
        inventory_id: inventoryId,
        type: 'exit',
        quantity,
        reason: 'Reserva para ordem de produção',
        reference_id: referenceId,
      });
    } catch (error) {
      console.error('Erro ao reservar estoque:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Libera estoque reservado
   */
  async releaseStock(inventoryId: string, quantity: number, referenceId: string): Promise<ServiceResult<any>> {
    try {
      return await this.registerMovement({
        inventory_id: inventoryId,
        type: 'entry',
        quantity,
        reason: 'Liberação de reserva',
        reference_id: referenceId,
      });
    } catch (error) {
      console.error('Erro ao liberar estoque:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Recebe produto acabado no estoque
   */
  async receiveFinishedProduct(productId: string, quantity: number, lotId?: string, referenceId?: string): Promise<ServiceResult<void>> {
    try {
      // Buscar item de estoque do produto
      const { data: inventoryItem, error: inventoryError } = await supabase
        .schema('industrial').from('estoque_industrial')
        .select('id, quantidade')
        .eq('produto_id', productId)
        .single();

      if (inventoryError) {
        // Se não existir, criar novo item
        const { data: newItem, error: createError } = await supabase
          .schema('industrial').from('estoque_industrial')
          .insert({
            produto_id: productId,
            quantidade: quantity,
            quantidade_minima: 0,
            quantidade_reservada: 0,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Registrar movimentação
        await this.registerMovement({
          inventory_id: newItem.id,
          type: 'production',
          quantity: quantity,
          reason: 'Recebimento de produto acabado',
          reference_id: referenceId,
        });
      } else {
        // Atualizar quantidade existente
        const { error: updateError } = await supabase
          .schema('industrial').from('estoque_industrial')
          .update({ quantidade: (inventoryItem?.quantidade || 0) + quantity })
          .eq('id', inventoryItem?.id);

        if (updateError) throw updateError;

        // Registrar movimentação
        await this.registerMovement({
          inventory_id: inventoryItem?.id,
          type: 'production',
          quantity: quantity,
          reason: 'Recebimento de produto acabado',
          reference_id: referenceId,
        });
      }

      // Atualizar quantidade do lote se fornecido
      if (lotId) {
        const { error: lotError } = await supabase
          .schema('industrial').from('lotes')
          .update({ 
            quantidade: quantity,
            status: 'concluido',
          })
          .eq('id', lotId);

        if (lotError) throw lotError;
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao receber produto acabado:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const inventoryService = new InventoryService();
