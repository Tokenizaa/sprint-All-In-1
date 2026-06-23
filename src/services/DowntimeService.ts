import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";

export interface DowntimeRecord {
  id: string;
  equipment_id?: string;
  production_order_id?: string;
  appointment_id?: string;
  downtime_type: 'planned' | 'unplanned' | 'breakdown' | 'maintenance' | 'setup' | 'material_shortage' | 'other';
  status: 'active' | 'resolved';
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  reason?: string;
  resolved_by?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDowntimeInput {
  equipment_id?: string;
  production_order_id?: string;
  appointment_id?: string;
  downtime_type: 'planned' | 'unplanned' | 'breakdown' | 'maintenance' | 'setup' | 'material_shortage' | 'other';
  reason?: string;
}

export interface UpdateDowntimeInput {
  end_time?: string;
  status?: 'active' | 'resolved';
  resolved_by?: string;
  resolution_notes?: string;
}

export class DowntimeService {
  /**
   * Cria um novo registro de parada
   */
  async create(input: CreateDowntimeInput): Promise<ServiceResult<DowntimeRecord>> {
    try {
      const { data, error } = await supabase
        .from('paradas')
        .insert({
          ...input,
          status: 'active',
          start_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as DowntimeRecord
      };
    } catch (error) {
      console.error('Erro ao criar registro de parada:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza um registro de parada
   */
  async update(id: string, input: UpdateDowntimeInput): Promise<ServiceResult<DowntimeRecord>> {
    try {
      let updateData = { ...input, updated_at: new Date().toISOString() } as any;

      // Se end_time for fornecido, calcular duração
      if (input.end_time) {
        const recordResult = await this.getById(id);
        if (recordResult.success && recordResult.data) {
          const startTime = new Date(recordResult.data.start_time).getTime();
          const endTime = new Date(input.end_time).getTime();
          updateData.duration_minutes = (endTime - startTime) / (1000 * 60);
        }
      }

      const { data, error } = await supabase
        .from('paradas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as DowntimeRecord
      };
    } catch (error) {
      console.error('Erro ao atualizar registro de parada:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove um registro de parada
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('paradas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover registro de parada:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca um registro de parada por ID
   */
  async getById(id: string): Promise<ServiceResult<DowntimeRecord>> {
    try {
      const { data, error } = await supabase
        .from('paradas')
        .select(`
          *,
          equipment:equipment_id (name, code),
          production_orders:production_order_id (order_number, product_id),
          appointments:appointment_id (id, start_time, end_time)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as DowntimeRecord
      };
    } catch (error) {
      console.error('Erro ao buscar registro de parada:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista registros de parada
   */
  async list(options?: { 
    equipment_id?: string;
    production_order_id?: string;
    appointment_id?: string;
    downtime_type?: DowntimeRecord['downtime_type'];
    status?: DowntimeRecord['status'];
    start_date?: string;
    end_date?: string;
  }): Promise<ServiceResult<DowntimeRecord[]>> {
    try {
      let query = supabase
        .from('paradas')
        .select(`
          *,
          equipment:equipment_id (name, code),
          production_orders:production_order_id (order_number, product_id),
          appointments:appointment_id (id, start_time, end_time)
        `);

      if (options?.equipment_id) {
        query = query.eq('equipment_id', options.equipment_id);
      }

      if (options?.production_order_id) {
        query = query.eq('production_order_id', options.production_order_id);
      }

      if (options?.appointment_id) {
        query = query.eq('appointment_id', options.appointment_id);
      }

      if (options?.downtime_type) {
        query = query.eq('downtime_type', options.downtime_type);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.start_date) {
        query = query.gte('start_time', options.start_date);
      }

      if (options?.end_date) {
        query = query.lte('start_time', options.end_date);
      }

      const { data, error } = await query.order('start_time', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as DowntimeRecord[]
      };
    } catch (error) {
      console.error('Erro ao listar registros de parada:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Registra início de parada
   */
  async startDowntime(input: CreateDowntimeInput): Promise<ServiceResult<DowntimeRecord>> {
    try {
      return await this.create(input);
    } catch (error) {
      console.error('Erro ao iniciar parada:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Registra fim de parada
   */
  async endDowntime(id: string, resolvedBy: string, resolutionNotes?: string): Promise<ServiceResult<DowntimeRecord>> {
    try {
      return await this.update(id, {
        end_time: new Date().toISOString(),
        status: 'resolved',
        resolved_by: resolvedBy,
        resolution_notes: resolutionNotes,
      });
    } catch (error) {
      console.error('Erro ao finalizar parada:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca paradas ativas
   */
  async getActiveDowntimes(): Promise<ServiceResult<DowntimeRecord[]>> {
    try {
      const { data, error } = await supabase
        .from('paradas')
        .select(`
          *,
          equipment:equipment_id (name, code),
          production_orders:production_order_id (order_number, product_id)
        `)
        .eq('status', 'active')
        .order('start_time', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as DowntimeRecord[]
      };
    } catch (error) {
      console.error('Erro ao buscar paradas ativas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula tempo total de parada por equipamento
   */
  async calculateDowntimeByEquipment(equipmentId: string, startDate: string, endDate: string): Promise<ServiceResult<{ totalMinutes: number; totalHours: number; breakdownCount: number }>> {
    try {
      const { data, error } = await supabase
        .from('paradas')
        .select('duration_minutes, downtime_type')
        .eq('equipment_id', equipmentId)
        .gte('start_time', startDate)
        .lte('start_time', endDate)
        .eq('status', 'resolved');

      if (error) throw error;

      const totalMinutes = (data || []).reduce((sum, r) => sum + (r.duration_minutes || 0), 0);
      const breakdownCount = (data || []).filter(r => r.downtime_type === 'breakdown').length;

      return {
        success: true,
        data: {
          totalMinutes,
          totalHours: totalMinutes / 60,
          breakdownCount,
        }
      };
    } catch (error) {
      console.error('Erro ao calcular tempo de parada:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula disponibilidade de equipamento
   */
  async calculateAvailability(equipmentId: string, startDate: string, endDate: string): Promise<ServiceResult<{ availability: number; downtimePercentage: number }>> {
    try {
      const downtimeResult = await this.calculateDowntimeByEquipment(equipmentId, startDate, endDate);
      if (!downtimeResult.success) {
        return {
          success: false,
          error: downtimeResult.error
        };
      }

      const totalPeriodMinutes = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60);
      const downtimePercentage = totalPeriodMinutes > 0 ? (downtimeResult.data.totalMinutes / totalPeriodMinutes) * 100 : 0;
      const availability = 100 - downtimePercentage;

      return {
        success: true,
        data: {
          availability: Math.max(0, availability),
          downtimePercentage,
        }
      };
    } catch (error) {
      console.error('Erro ao calcular disponibilidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista causas mais comuns de parada
   */
  async listCommonCauses(limit: number = 10): Promise<ServiceResult<Array<{ cause: string; count: number; type: string }>>> {
    try {
      const { data, error } = await supabase
        .from('paradas')
        .select('downtime_type, reason')
        .not('reason', 'is', null);

      if (error) throw error;

      const causeCounts = new Map<string, { count: number; type: string }>();
      (data || []).forEach(record => {
        const key = record.reason || record.downtime_type;
        const existing = causeCounts.get(key) || { count: 0, type: record.downtime_type };
        causeCounts.set(key, { count: existing.count + 1, type: record.downtime_type });
      });

      const sorted = Array.from(causeCounts.entries())
        .map(([cause, data]) => ({ cause, count: data.count, type: data.type }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return {
        success: true,
        data: sorted
      };
    } catch (error) {
      console.error('Erro ao listar causas comuns:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const downtimeService = new DowntimeService();
