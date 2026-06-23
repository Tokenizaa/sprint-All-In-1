import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";

export interface Lot {
  id: string;
  lot_number: string;
  production_order_id?: string;
  product_id?: string;
  quantity: number;
  status: 'in_progress' | 'completed' | 'rejected' | 'quarantine';
  production_date?: string;
  expiry_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLotInput {
  lot_number: string;
  production_order_id?: string;
  product_id?: string;
  quantity: number;
  production_date?: string;
  expiry_date?: string;
  notes?: string;
}

export interface UpdateLotInput {
  quantity?: number;
  status?: 'in_progress' | 'completed' | 'rejected' | 'quarantine';
  production_date?: string;
  expiry_date?: string;
  notes?: string;
}

export class LotService {
  /**
   * Cria um novo lote
   */
  async create(input: CreateLotInput): Promise<ServiceResult<Lot>> {
    try {
      // Validar número do lote único
      const { data: existingLot } = await supabase
        .schema('industrial').from('lotes')
        .select('id')
        .eq('lot_number', input.lot_number)
        .single();

      if (existingLot) {
        return {
          success: false,
          error: 'Número de lote já existe'
        };
      }

      const { data, error } = await supabase
        .schema('industrial').from('lotes')
        .insert({
          ...input,
          status: 'in_progress',
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Lot
      };
    } catch (error) {
      console.error('Erro ao criar lote:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza um lote
   */
  async update(id: string, input: UpdateLotInput): Promise<ServiceResult<Lot>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('lotes')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Se status mudou para completed, atualizar estoque
      if (input.status === 'completed') {
        await this.updateStockOnCompletion(id);
      }

      return {
        success: true,
        data: data as Lot
      };
    } catch (error) {
      console.error('Erro ao atualizar lote:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove um lote
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .schema('industrial').from('lotes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover lote:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca um lote por ID
   */
  async getById(id: string): Promise<ServiceResult<Lot>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('lotes')
        .select(`
          *,
          ordens_producao:production_order_id (numero, produto_id, quantidade),
          produtos:product_id (name, sku, description)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Lot
      };
    } catch (error) {
      console.error('Erro ao buscar lote:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca um lote por número
   */
  async getByNumber(lotNumber: string): Promise<ServiceResult<Lot>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('lotes')
        .select(`
          *,
          ordens_producao:production_order_id (numero, produto_id, quantidade),
          produtos:product_id (name, sku, description)
        `)
        .eq('lot_number', lotNumber)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Lot
      };
    } catch (error) {
      console.error('Erro ao buscar lote:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista lotes
   */
  async list(options?: { 
    production_order_id?: string;
    product_id?: string;
    status?: Lot['status'];
    start_date?: string;
    end_date?: string;
  }): Promise<ServiceResult<Lot[]>> {
    try {
      let query = supabase
        .schema('industrial').from('lotes')
        .select(`
          *,
          ordens_producao:production_order_id (numero, produto_id, quantidade),
          produtos:product_id (name, sku, description)
        `);

      if (options?.production_order_id) {
        query = query.eq('production_order_id', options.production_order_id);
      }

      if (options?.product_id) {
        query = query.eq('product_id', options.product_id);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.start_date) {
        query = query.gte('production_date', options.start_date);
      }

      if (options?.end_date) {
        query = query.lte('production_date', options.end_date);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as Lot[]
      };
    } catch (error) {
      console.error('Erro ao listar lotes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Gera um número único para o lote
   */
  async generateLotNumber(productId?: string): Promise<string> {
    try {
      const year = new Date().getFullYear();
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const day = new Date().getDate().toString().padStart(2, '0');
      const datePart = `${year}${month}${day}`;

      // Buscar último lote do dia
      const { data: lastLot } = await supabase
        .schema('industrial').from('lotes')
        .select('lot_number')
        .like('lot_number', `LOT-${datePart}%`)
        .order('lot_number', { ascending: false })
        .limit(1);

      let sequence = 1;
      if (lastLot && lastLot.length > 0) {
        const lastNumber = lastLot[0].lot_number;
        const lastSequence = parseInt(lastNumber.split('-')[2] || '0');
        sequence = lastSequence + 1;
      }

      const productPart = productId ? `-${productId.substring(0, 4).toUpperCase()}` : '';
      return `LOT-${datePart}-${sequence.toString().padStart(4, '0')}${productPart}`;
    } catch (error) {
      console.error('Erro ao gerar número do lote:', error);
      return `LOT-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-0001`;
    }
  }

  /**
   * Completa um lote
   */
  async complete(id: string, finalQuantity: number): Promise<ServiceResult<Lot>> {
    try {
      return await this.update(id, {
        quantity: finalQuantity,
        status: 'completed',
      });
    } catch (error) {
      console.error('Erro ao completar lote:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Rejeita um lote
   */
  async reject(id: string, reason?: string): Promise<ServiceResult<Lot>> {
    try {
      const updateResult = await this.update(id, {
        status: 'rejected',
        notes: reason,
      });

      return updateResult;
    } catch (error) {
      console.error('Erro ao rejeitar lote:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Coloca um lote em quarentena
   */
  async quarantine(id: string, reason?: string): Promise<ServiceResult<Lot>> {
    try {
      const updateResult = await this.update(id, {
        status: 'quarantine',
        notes: reason,
      });

      return updateResult;
    } catch (error) {
      console.error('Erro ao colocar lote em quarentena:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Libera um lote da quarentena
   */
  async releaseFromQuarantine(id: string): Promise<ServiceResult<Lot>> {
    try {
      return await this.update(id, {
        status: 'in_progress',
      });
    } catch (error) {
      console.error('Erro ao liberar lote da quarentena:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza o estoque quando um lote é completado
   */
  private async updateStockOnCompletion(lotId: string): Promise<void> {
    try {
      const lotResult = await this.getById(lotId);
      if (!lotResult.success || !lotResult.data) return;

      const lot = lotResult.data;

      if (!lot?.product_id) {
        console.warn('Lote sem product_id, não é possível atualizar estoque');
        return;
      }

      // Buscar item de estoque do produto
      const { data: inventoryItem } = await supabase
        .schema('industrial').from('estoque_industrial')
        .select('id, quantidade')
        .eq('produto_id', lot.product_id)
        .single();

      if (!inventoryItem) {
        // Criar item de estoque se não existir
        await supabase
          .schema('industrial').from('estoque_industrial')
          .insert({
            produto_id: lot.product_id,
            quantidade: lot.quantity || 0,
            unidade_medida: 'un',
            quantidade_minima: 0,
            quantidade_maxima: 1000,
          });
      } else {
        // Atualizar quantidade
        await supabase
          .schema('industrial').from('estoque_industrial')
          .update({
            quantidade: (inventoryItem.quantidade || 0) + (lot.quantity || 0),
          })
          .eq('id', inventoryItem.id);
      }

      // Registrar movimentação de produção
      if (inventoryItem) {
        await supabase
          .schema('industrial').from('movimentacoes')
          .insert({
            estoque_id: inventoryItem.id,
            type: 'production',
            quantity: lot.quantity || 0,
            reason: 'Produção do lote ' + (lot.lot_number || lotId),
            reference_id: lotId,
          });
      }
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
    }
  }

  /**
   * Busca o histórico de rastreabilidade de um lote
   */
  async getTraceability(lotId: string): Promise<ServiceResult<any>> {
    try {
      const lotResult = await this.getById(lotId);
      if (!lotResult.success || !lotResult.data) {
        return {
          success: false,
          error: lotResult.error
        };
      }

      const lot = lotResult.data;

      // Buscar ordem de produção associada
      let productionOrder = null;
      if (lot.production_order_id) {
        const { data: po } = await supabase
          .schema('industrial').from('ordens_producao')
          .select('*')
          .eq('id', lot.production_order_id)
          .single();

        productionOrder = po;
      }

      // Buscar apontamentos associados
      const { data: appointments } = await supabase
        .schema('industrial').from('apontamentos')
        .select('*')
        .eq('op_id', lot.production_order_id);

      // Buscar movimentações associadas
      const { data: movements } = await supabase
        .schema('industrial').from('movimentacoes')
        .select('*')
        .eq('reference_id', lotId);

      // Buscar registros de qualidade
      const { data: qualityRecords } = await supabase
        .schema('industrial').from('qualidade')
        .select('*')
        .eq('lot_id', lotId);

      return {
        success: true,
        data: {
          lot,
          productionOrder,
          appointments,
          movements,
          qualityRecords
        }
      };
    } catch (error) {
      console.error('Erro ao buscar rastreabilidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista lotes próximos da data de validade
   */
  async listExpiringSoon(days: number = 30): Promise<ServiceResult<Lot[]>> {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      const { data, error } = await supabase
        .schema('industrial').from('lotes')
        .select(`
          *,
          products:product_id (name, sku, description)
        `)
        .lte('expiry_date', expiryDate.toISOString())
        .gt('expiry_date', new Date().toISOString())
        .eq('status', 'completed')
        .order('expiry_date', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as Lot[]
      };
    } catch (error) {
      console.error('Erro ao listar lotes próximos da validade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const lotService = new LotService();
