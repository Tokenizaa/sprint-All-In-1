import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";
import { productService } from "./ProductService";
import { bomService } from "./BOMService";
import { inventoryService } from "./InventoryService";

export interface ProductionOrder {
  id: string;
  order_number: string;
  product_id: string;
  quantity: number;
  status: 'planejada' | 'liberada' | 'em_producao' | 'pausada' | 'finalizada' | 'cancelada';
  priority: 'baixa' | 'normal' | 'alta' | 'urgente';
  start_date?: string;
  due_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Campos adicionais da tabela industrial.ordens_producao
  produto?: string;
  numero?: string;
  quantidade?: number;
  unidade_medida?: string;
  lote?: string;
  prioridade?: string;
  data_inicio?: string;
  data_previsao?: string;
  data_conclusao?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  observacoes?: string;
  especificacoes?: Record<string, any>;
}

export interface CreateProductionOrderInput {
  product_id: string;
  quantity: number;
  priority?: 'baixa' | 'normal' | 'alta' | 'urgente';
  start_date?: string;
  due_date?: string;
  notes?: string;
}

export interface UpdateProductionOrderInput {
  quantity?: number;
  status?: 'planejada' | 'liberada' | 'em_producao' | 'pausada' | 'finalizada' | 'cancelada';
  priority?: 'baixa' | 'normal' | 'alta' | 'urgente';
  start_date?: string;
  due_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  notes?: string;
}

export class ProductionOrderService {
  /**
   * Cria uma nova ordem de produção
   */
  async create(input: CreateProductionOrderInput): Promise<ServiceResult<ProductionOrder>> {
    try {
      // Validar produto
      const productResult = await productService.getById(input.product_id);
      if (!productResult.success) {
        return {
          success: false,
          error: 'Produto não encontrado'
        };
      }

      // Validar BOM
      const bomResult = await bomService.getByProduct(input.product_id);
      if (!bomResult.success || bomResult.data.length === 0) {
        return {
          success: false,
          error: 'Produto não possui BOM definida'
        };
      }

      // Gerar número da OP
      const orderNumber = await this.generateOrderNumber();

      const { data, error } = await supabase
        .schema('industrial').from('ordens_producao')
        .insert({
          numero: orderNumber,
          produto: input.product_id,
          quantidade: input.quantity,
          status: 'planejada',
          prioridade: input.priority || 'normal',
          data_inicio: input.start_date,
          data_previsao: input.due_date,
          observacoes: input.notes,
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
          quantidade: input.quantity,
          status: input.status,
          prioridade: input.priority,
          data_inicio: input.start_date,
          data_previsao: input.due_date,
          data_conclusao: input.actual_end_date,
          observacoes: input.notes,
          updated_at: new Date().toISOString(),
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
        .update({ status: 'cancelada' })
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
   * Busca uma ordem de produção por ID
   */
  async getById(id: string): Promise<ServiceResult<ProductionOrder>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('ordens_producao')
        .select('*')
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
   * Lista ordens de produção
   */
  async list(options?: { 
    status?: ProductionOrder['status'];
    product_id?: string;
    priority?: ProductionOrder['priority'];
  }): Promise<ServiceResult<ProductionOrder[]>> {
    try {
      let query = supabase
        .schema('industrial').from('ordens_producao')
        .select('*');

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.product_id) {
        query = query.eq('produto', options.product_id);
      }

      if (options?.priority) {
        query = query.eq('prioridade', options.priority);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as ProductionOrder[]
      };
    } catch (error) {
      console.error('Erro ao listar ordens de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Valida uma ordem de produção antes de liberar
   */
  async validate(id: string): Promise<ServiceResult<{ valid: boolean; issues: string[] }>> {
    try {
      const orderResult = await this.getById(id);
      if (!orderResult.success || !orderResult.data) {
        return {
          success: false,
          error: orderResult.error || 'Ordem não encontrada'
        };
      }

      const order = orderResult.data;
      const issues: string[] = [];

      // Validar BOM
      const bomResult = await bomService.getByProduct(order.produto || order.product_id);
      if (!bomResult.success || bomResult.data.length === 0) {
        issues.push('Produto não possui BOM definida');
      }

      // Validar disponibilidade de materiais
      const canProduceResult = await productService.canProduce(order.produto || order.product_id, order.quantidade || order.quantity);
      if (!canProduceResult.success) {
        issues.push('Erro ao verificar disponibilidade de materiais');
      } else if (!canProduceResult.data.canProduce) {
        issues.push(...canProduceResult.data.reasons);
      }

      return {
        success: true,
        data: {
          valid: issues.length === 0,
          issues
        }
      };
    } catch (error) {
      console.error('Erro ao validar ordem de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Libera uma ordem de produção
   */
  async release(id: string): Promise<ServiceResult<ProductionOrder>> {
    try {
      // Validar ordem
      const validationResult = await this.validate(id);
      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error
        };
      }

      if (!validationResult.data.valid) {
        return {
          success: false,
          error: `Ordem inválida: ${validationResult.data.issues.join(', ')}`
        };
      }

      // Atualizar status
      const updateResult = await this.update(id, {
        status: 'liberada',
        start_date: new Date().toISOString(),
      });

      if (!updateResult.success) {
        return updateResult;
      }

      // Reservar materiais
      await this.reserveMaterials(id);

      return updateResult;
    } catch (error) {
      console.error('Erro ao liberar ordem de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Inicia uma ordem de produção
   */
  async start(id: string): Promise<ServiceResult<ProductionOrder>> {
    try {
      return await this.update(id, {
        status: 'em_producao',
        start_date: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao iniciar ordem de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Completa uma ordem de produção
   */
  async complete(id: string): Promise<ServiceResult<ProductionOrder>> {
    try {
      const updateResult = await this.update(id, {
        status: 'finalizada',
        due_date: new Date().toISOString(),
      });

      if (!updateResult.success) {
        return updateResult;
      }

      // Consumir materiais
      await this.consumeMaterials(id);

      return updateResult;
    } catch (error) {
      console.error('Erro ao completar ordem de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Reserva materiais para uma ordem de produção
   */
  private async reserveMaterials(orderId: string): Promise<void> {
    try {
      const orderResult = await this.getById(orderId);
      if (!orderResult.success || !orderResult.data) return;

      const order = orderResult.data;
      const bomResult = await bomService.getByProduct(order.produto || order.product_id);
      if (!bomResult.success) return;

      for (const bomItem of bomResult.data) {
        const requiredQuantity = bomItem.quantidade * (order.quantidade || order.quantity || 0);

        if (bomItem.componente_id) {
          // Buscar item de estoque
          const inventoryResult = await inventoryService.list({ component_id: bomItem.componente_id });
          if (inventoryResult.success && inventoryResult.data.length > 0) {
            const inventoryItem = inventoryResult.data[0];
            await inventoryService.reserveStock(inventoryItem.id, requiredQuantity, orderId);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao reservar materiais:', error);
    }
  }

  /**
   * Consome materiais de uma ordem de produção
   */
  private async consumeMaterials(orderId: string): Promise<void> {
    try {
      const orderResult = await this.getById(orderId);
      if (!orderResult.success || !orderResult.data) return;

      const order = orderResult.data;
      const bomResult = await bomService.getByProduct(order.produto || order.product_id);
      if (!bomResult.success) return;

      for (const bomItem of bomResult.data) {
        const requiredQuantity = bomItem.quantidade * (order.quantidade || order.quantity || 0);

        if (bomItem.componente_id) {
          // Buscar item de estoque
          const inventoryResult = await inventoryService.list({ component_id: bomItem.componente_id });
          if (inventoryResult.success && inventoryResult.data.length > 0) {
            const inventoryItem = inventoryResult.data[0];
            await inventoryService.registerMovement({
              inventory_id: inventoryItem.id,
              type: 'consumption',
              quantity: requiredQuantity,
              reason: 'Consumo na produção',
              reference_id: orderId,
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao consumir materiais:', error);
    }
  }

  /**
   * Gera um número único para a ordem de produção
   */
  private async generateOrderNumber(): Promise<string> {
    try {
      const year = new Date().getFullYear();
      const { data, error } = await supabase
        .schema('industrial').from('ordens_producao')
        .select('numero')
        .like('numero', `OP-${year}%`)
        .order('numero', { ascending: false })
        .limit(1);

      if (error) throw error;

      let sequence = 1;
      if (data && data.length > 0) {
        const lastNumber = data[0].numero;
        const lastSequence = parseInt(lastNumber.split('-')[2] || '0');
        sequence = lastSequence + 1;
      }

      return `OP-${year}-${sequence.toString().padStart(5, '0')}`;
    } catch (error) {
      console.error('Erro ao gerar número da ordem:', error);
      return `OP-${new Date().getFullYear()}-00001`;
    }
  }

  /**
   * Calcula o progresso de uma ordem de produção
   */
  async getProgress(id: string): Promise<ServiceResult<{ completed: number; total: number; percentage: number }>> {
    try {
      // Buscar apontamentos da ordem
      const { data: appointments, error } = await supabase
        .schema('industrial').from('apontamentos')
        .select('quantidade_produzida')
        .eq('op_id', id);

      if (error) throw error;

      const orderResult = await this.getById(id);
      if (!orderResult.success || !orderResult.data) {
        return {
          success: false,
          error: orderResult.error || 'Ordem não encontrada'
        };
      }

      const total = orderResult.data.quantidade || orderResult.data.quantity;
      const completed = appointments?.reduce((sum, appt) => sum + (appt.quantidade_produzida || 0), 0) || 0;
      const percentage = total > 0 ? (completed / total) * 100 : 0;

      return {
        success: true,
        data: {
          completed,
          total,
          percentage
        }
      };
    } catch (error) {
      console.error('Erro ao calcular progresso:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const productionOrderService = new ProductionOrderService();
