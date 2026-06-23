import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";

export interface WIPRecord {
  id: string;
  production_order_id: string;
  lot_id?: string;
  process_id?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  current_quantity: number;
  target_quantity: number;
  start_time?: string;
  end_time?: string;
  estimated_completion?: string;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWIPInput {
  production_order_id: string;
  lot_id?: string;
  process_id?: string;
  target_quantity: number;
  location?: string;
  notes?: string;
}

export interface UpdateWIPInput {
  status?: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  current_quantity?: number;
  start_time?: string;
  end_time?: string;
  estimated_completion?: string;
  location?: string;
  notes?: string;
}

export class WIPService {
  /**
   * Cria um novo registro de WIP
   */
  async create(input: CreateWIPInput): Promise<ServiceResult<WIPRecord>> {
    try {
      const { data, error } = await supabase
        .from('wip')
        .insert({
          ...input,
          status: 'pending',
          current_quantity: 0,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as WIPRecord
      };
    } catch (error) {
      console.error('Erro ao criar registro de WIP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza um registro de WIP
   */
  async update(id: string, input: UpdateWIPInput): Promise<ServiceResult<WIPRecord>> {
    try {
      const { data, error } = await supabase
        .from('wip')
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
        data: data as WIPRecord
      };
    } catch (error) {
      console.error('Erro ao atualizar registro de WIP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove um registro de WIP
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('wip')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover registro de WIP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca um registro de WIP por ID
   */
  async getById(id: string): Promise<ServiceResult<WIPRecord>> {
    try {
      const { data, error } = await supabase
        .from('wip')
        .select(`
          *,
          production_orders:production_order_id (order_number, product_id, quantity),
          lots:lot_id (lot_number, product_id),
          processes:process_id (name, operation)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as WIPRecord
      };
    } catch (error) {
      console.error('Erro ao buscar registro de WIP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista registros de WIP
   */
  async list(options?: { 
    production_order_id?: string;
    lot_id?: string;
    status?: WIPRecord['status'];
    location?: string;
  }): Promise<ServiceResult<WIPRecord[]>> {
    try {
      let query = supabase
        .from('wip')
        .select(`
          *,
          production_orders:production_order_id (order_number, product_id, quantity),
          lots:lot_id (lot_number, product_id),
          processes:process_id (name, operation)
        `);

      if (options?.production_order_id) {
        query = query.eq('production_order_id', options.production_order_id);
      }

      if (options?.lot_id) {
        query = query.eq('lot_id', options.lot_id);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.location) {
        query = query.eq('location', options.location);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as WIPRecord[]
      };
    } catch (error) {
      console.error('Erro ao listar registros de WIP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Inicia um processo de WIP
   */
  async startProcess(id: string, location?: string): Promise<ServiceResult<WIPRecord>> {
    try {
      return await this.update(id, {
        status: 'in_progress',
        start_time: new Date().toISOString(),
        location,
      });
    } catch (error) {
      console.error('Erro ao iniciar processo de WIP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza o progresso de WIP
   */
  async updateProgress(id: string, currentQuantity: number): Promise<ServiceResult<WIPRecord>> {
    try {
      const recordResult = await this.getById(id);
      if (!recordResult.success) {
        return {
          success: false,
          error: recordResult.error
        };
      }

      const record = recordResult.data;
      const isComplete = currentQuantity >= record.target_quantity;

      return await this.update(id, {
        current_quantity: currentQuantity,
        status: isComplete ? 'completed' : 'in_progress',
        end_time: isComplete ? new Date().toISOString() : undefined,
      });
    } catch (error) {
      console.error('Erro ao atualizar progresso de WIP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Coloca WIP em espera
   */
  async putOnHold(id: string, reason?: string): Promise<ServiceResult<WIPRecord>> {
    try {
      return await this.update(id, {
        status: 'on_hold',
        notes: reason,
      });
    } catch (error) {
      console.error('Erro ao colocar WIP em espera:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Retoma WIP de espera
   */
  async resumeFromHold(id: string): Promise<ServiceResult<WIPRecord>> {
    try {
      return await this.update(id, {
        status: 'in_progress',
      });
    } catch (error) {
      console.error('Erro ao retomar WIP de espera:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca WIP ativo por ordem de produção
   */
  async getActiveWIPByOrder(productionOrderId: string): Promise<ServiceResult<WIPRecord[]>> {
    try {
      const { data, error } = await supabase
        .from('wip')
        .select(`
          *,
          production_orders:production_order_id (order_number, product_id, quantity),
          lots:lot_id (lot_number, product_id),
          processes:process_id (name, operation)
        `)
        .eq('production_order_id', productionOrderId)
        .in('status', ['pending', 'in_progress', 'on_hold'])
        .order('created_at', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as WIPRecord[]
      };
    } catch (error) {
      console.error('Erro ao buscar WIP ativo por ordem:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula progresso geral de uma OP
   */
  async calculateOrderProgress(productionOrderId: string): Promise<ServiceResult<{ totalTarget: number; totalCurrent: number; percentage: number; completedProcesses: number; totalProcesses: number }>> {
    try {
      const wipResult = await this.list({ production_order_id: productionOrderId });
      if (!wipResult.success) {
        return {
          success: false,
          error: wipResult.error
        };
      }

      const wipRecords = wipResult.data;
      const totalTarget = wipRecords.reduce((sum, r) => sum + r.target_quantity, 0);
      const totalCurrent = wipRecords.reduce((sum, r) => sum + r.current_quantity, 0);
      const completedProcesses = wipRecords.filter(r => r.status === 'completed').length;
      const totalProcesses = wipRecords.length;
      const percentage = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

      return {
        success: true,
        data: {
          totalTarget,
          totalCurrent,
          percentage,
          completedProcesses,
          totalProcesses,
        }
      };
    } catch (error) {
      console.error('Erro ao calcular progresso da ordem:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista WIP por localização
   */
  async listByLocation(location: string): Promise<ServiceResult<WIPRecord[]>> {
    try {
      return await this.list({ location });
    } catch (error) {
      console.error('Erro ao listar WIP por localização:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula tempo em WIP por ordem
   */
  async calculateWIPTime(productionOrderId: string): Promise<ServiceResult<{ totalMinutes: number; averageMinutes: number }>> {
    try {
      const { data, error } = await supabase
        .from('wip')
        .select('start_time, end_time')
        .eq('production_order_id', productionOrderId)
        .not('start_time', 'is', null);

      if (error) throw error;

      const records = data || [];
      let totalMinutes = 0;
      let count = 0;

      records.forEach(record => {
        if (record.start_time && record.end_time) {
          const start = new Date(record.start_time).getTime();
          const end = new Date(record.end_time).getTime();
          totalMinutes += (end - start) / (1000 * 60);
          count++;
        } else if (record.start_time) {
          const start = new Date(record.start_time).getTime();
          const now = new Date().getTime();
          totalMinutes += (now - start) / (1000 * 60);
          count++;
        }
      });

      return {
        success: true,
        data: {
          totalMinutes,
          averageMinutes: count > 0 ? totalMinutes / count : 0,
        }
      };
    } catch (error) {
      console.error('Erro ao calcular tempo em WIP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const wipService = new WIPService();
