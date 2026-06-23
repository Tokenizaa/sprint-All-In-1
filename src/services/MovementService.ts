import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";
import { inventoryService } from "./InventoryService";

export interface Movement {
  id: string;
  inventory_id: string;
  type: 'entry' | 'exit' | 'consumption' | 'production' | 'transfer';
  quantity: number;
  reason?: string;
  reference_id?: string;
  created_at: string;
}

export interface CreateMovementInput {
  inventory_id: string;
  type: 'entry' | 'exit' | 'consumption' | 'production' | 'transfer';
  quantity: number;
  reason?: string;
  reference_id?: string;
}

export class MovementService {
  /**
   * Cria uma nova movimentação
   */
  async create(input: CreateMovementInput): Promise<ServiceResult<Movement>> {
    try {
      // Validar quantidade positiva
      if (input.quantity <= 0) {
        return {
          success: false,
          error: 'Quantidade deve ser maior que zero'
        };
      }

      // Buscar item de estoque atual
      const { data: inventoryItem } = await supabase
        .schema('industrial').from('estoque_industrial')
        .select('quantity')
        .eq('id', input.inventory_id)
        .single();

      if (!inventoryItem) {
        return {
          success: false,
          error: 'Item de estoque não encontrado'
        };
      }

      // Calcular nova quantidade
      let newQuantity = inventoryItem.quantity;
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
        .update({ quantity: newQuantity })
        .eq('id', input.inventory_id);

      if (updateError) throw updateError;

      // Registrar movimentação
      const { data, error } = await supabase
        .schema('industrial').from('movimentacoes')
        .insert(input)
        .select()
        .single();

      if (error) throw error;

      // Verificar se está abaixo do mínimo
      await inventoryService.checkLowStock(input.inventory_id);

      return {
        success: true,
        data: data as Movement
      };
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca uma movimentação por ID
   */
  async getById(id: string): Promise<ServiceResult<Movement>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('movimentacoes')
        .select(`
          *,
          inventory:inventory_id (
            *,
            materias_primas:material_id (name, sku, unit),
            componentes:component_id (name, sku, unit),
            produtos:product_id (name, sku, unit)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Movement
      };
    } catch (error) {
      console.error('Erro ao buscar movimentação:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista movimentações
   */
  async list(options?: { 
    inventory_id?: string;
    type?: Movement['type'];
    reference_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ServiceResult<Movement[]>> {
    try {
      let query = supabase
        .schema('industrial').from('movimentacoes')
        .select(`
          *,
          inventory:inventory_id (
            *,
            materias_primas:material_id (name, sku, unit),
            componentes:component_id (name, sku, unit),
            produtos:product_id (name, sku, unit)
          )
        `);

      if (options?.inventory_id) {
        query = query.eq('inventory_id', options.inventory_id);
      }

      if (options?.type) {
        query = query.eq('type', options.type);
      }

      if (options?.reference_id) {
        query = query.eq('reference_id', options.reference_id);
      }

      if (options?.start_date) {
        query = query.gte('created_at', options.start_date);
      }

      if (options?.end_date) {
        query = query.lte('created_at', options.end_date);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as Movement[]
      };
    } catch (error) {
      console.error('Erro ao listar movimentações:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Registra entrada de material
   */
  async registerEntry(inventoryId: string, quantity: number, reason?: string, referenceId?: string): Promise<ServiceResult<Movement>> {
    try {
      return await this.create({
        inventory_id: inventoryId,
        type: 'entry',
        quantity,
        reason: reason || 'Entrada de material',
        reference_id: referenceId,
      });
    } catch (error) {
      console.error('Erro ao registrar entrada:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Registra saída de material
   */
  async registerExit(inventoryId: string, quantity: number, reason?: string, referenceId?: string): Promise<ServiceResult<Movement>> {
    try {
      return await this.create({
        inventory_id: inventoryId,
        type: 'exit',
        quantity,
        reason: reason || 'Saída de material',
        reference_id: referenceId,
      });
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Registra consumo na produção
   */
  async registerConsumption(inventoryId: string, quantity: number, referenceId: string): Promise<ServiceResult<Movement>> {
    try {
      return await this.create({
        inventory_id: inventoryId,
        type: 'consumption',
        quantity,
        reason: 'Consumo na produção',
        reference_id: referenceId,
      });
    } catch (error) {
      console.error('Erro ao registrar consumo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Registra produção
   */
  async registerProduction(inventoryId: string, quantity: number, referenceId: string): Promise<ServiceResult<Movement>> {
    try {
      return await this.create({
        inventory_id: inventoryId,
        type: 'production',
        quantity,
        reason: 'Produção',
        reference_id: referenceId,
      });
    } catch (error) {
      console.error('Erro ao registrar produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Registra transferência entre setores
   */
  async registerTransfer(fromInventoryId: string, toInventoryId: string, quantity: number, reason?: string): Promise<ServiceResult<{ fromMovement: Movement; toMovement: Movement }>> {
    try {
      // Registrar saída do estoque de origem
      const fromResult = await this.registerExit(fromInventoryId, quantity, reason || 'Transferência');
      if (!fromResult.success) {
        return {
          success: false,
          error: fromResult.error
        };
      }

      // Registrar entrada no estoque de destino
      const toResult = await this.registerEntry(toInventoryId, quantity, reason || 'Transferência');
      if (!toResult.success) {
        return {
          success: false,
          error: toResult.error
        };
      }

      return {
        success: true,
        data: {
          fromMovement: fromResult.data!,
          toMovement: toResult.data!
        }
      };
    } catch (error) {
      console.error('Erro ao registrar transferência:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula o saldo de um item de estoque em um período
   */
  async calculateBalance(inventoryId: string, startDate: string, endDate: string): Promise<ServiceResult<{ opening: number; entries: number; exits: number; closing: number }>> {
    try {
      // Buscar saldo inicial (movimentações antes do período)
      const { data: beforeMovements } = await supabase
        .from('movimentacoes')
        .select('type, quantity')
        .eq('inventory_id', inventoryId)
        .lt('created_at', startDate);

      const opening = beforeMovements?.reduce((sum, mov) => {
        if (mov.type === 'entry' || mov.type === 'production') {
          return sum + mov.quantity;
        } else {
          return sum - mov.quantity;
        }
      }, 0) || 0;

      // Buscar movimentações do período
      const { data: periodMovements } = await supabase
        .from('movimentacoes')
        .select('type, quantity')
        .eq('inventory_id', inventoryId)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const entries = periodMovements?.reduce((sum, mov) => {
        if (mov.type === 'entry' || mov.type === 'production') {
          return sum + mov.quantity;
        }
        return sum;
      }, 0) || 0;

      const exits = periodMovements?.reduce((sum, mov) => {
        if (mov.type === 'exit' || mov.type === 'consumption' || mov.type === 'transfer') {
          return sum + mov.quantity;
        }
        return sum;
      }, 0) || 0;

      const closing = opening + entries - exits;

      return {
        success: true,
        data: { opening, entries, exits, closing }
      };
    } catch (error) {
      console.error('Erro ao calcular saldo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Reverte uma movimentação
   */
  async reverse(id: string): Promise<ServiceResult<Movement>> {
    try {
      const movementResult = await this.getById(id);
      if (!movementResult.success) {
        return {
          success: false,
          error: movementResult.error
        };
      }

      const movement = movementResult.data;

      // Determinar tipo reverso
      let reverseType: Movement['type'];
      switch (movement.type) {
        case 'entry':
          reverseType = 'exit';
          break;
        case 'exit':
          reverseType = 'entry';
          break;
        case 'consumption':
          reverseType = 'entry';
          break;
        case 'production':
          reverseType = 'exit';
          break;
        case 'transfer':
          reverseType = 'entry';
          break;
        default:
          return {
            success: false,
            error: 'Tipo de movimentação não suportado para reversão'
          };
      }

      return await this.create({
        inventory_id: movement.inventory_id,
        type: reverseType,
        quantity: movement.quantity,
        reason: `Reversão da movimentação ${id}`,
        reference_id: movement.reference_id,
      });
    } catch (error) {
      console.error('Erro ao reverter movimentação:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const movementService = new MovementService();
