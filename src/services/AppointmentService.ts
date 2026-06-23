import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";

export interface Appointment {
  id: string;
  production_order_id: string;
  equipment_id?: string;
  employee_id?: string;
  operation_id?: string;
  start_time: string;
  end_time?: string;
  setup_time?: number;
  production_time?: number;
  quantity_produced?: number;
  quantity_rejected?: number;
  efficiency?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentInput {
  production_order_id: string;
  equipment_id?: string;
  employee_id?: string;
  operation_id?: string;
  start_time: string;
  setup_time?: number;
  production_time?: number;
  notes?: string;
}

export interface UpdateAppointmentInput {
  equipment_id?: string;
  employee_id?: string;
  operation_id?: string;
  end_time?: string;
  setup_time?: number;
  production_time?: number;
  quantity_produced?: number;
  quantity_rejected?: number;
  efficiency?: number;
  notes?: string;
}

export class AppointmentService {
  /**
   * Cria um novo apontamento
   */
  async create(input: CreateAppointmentInput): Promise<ServiceResult<Appointment>> {
    try {
      const { data, error } = await supabase
        .from('apontamentos')
        .insert(input)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Appointment
      };
    } catch (error) {
      console.error('Erro ao criar apontamento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza um apontamento
   */
  async update(id: string, input: UpdateAppointmentInput): Promise<ServiceResult<Appointment>> {
    try {
      const { data, error } = await supabase
        .from('apontamentos')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Calcular eficiência automaticamente se necessário
      if (input.quantity_produced !== undefined || input.production_time !== undefined) {
        await this.calculateEfficiency(id);
      }

      return {
        success: true,
        data: data as Appointment
      };
    } catch (error) {
      console.error('Erro ao atualizar apontamento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove um apontamento
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('apontamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover apontamento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca um apontamento por ID
   */
  async getById(id: string): Promise<ServiceResult<Appointment>> {
    try {
      const { data, error } = await supabase
        .from('apontamentos')
        .select(`
          *,
          production_orders:production_order_id (order_number, product_id, quantity),
          equipment:equipment_id (name, code),
          employees:employee_id (name, function),
          operations:operation_id (name, standard_time)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Appointment
      };
    } catch (error) {
      console.error('Erro ao buscar apontamento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista apontamentos
   */
  async list(options?: { 
    production_order_id?: string;
    equipment_id?: string;
    employee_id?: string;
    date?: string;
  }): Promise<ServiceResult<Appointment[]>> {
    try {
      let query = supabase
        .from('apontamentos')
        .select(`
          *,
          production_orders:production_order_id (order_number, product_id, quantity),
          equipment:equipment_id (name, code),
          employees:employee_id (name, function),
          operations:operation_id (name, standard_time)
        `);

      if (options?.production_order_id) {
        query = query.eq('production_order_id', options.production_order_id);
      }

      if (options?.equipment_id) {
        query = query.eq('equipment_id', options.equipment_id);
      }

      if (options?.employee_id) {
        query = query.eq('employee_id', options.employee_id);
      }

      if (options?.date) {
        query = query.gte('start_time', options.date)
                    .lt('start_time', new Date(new Date(options.date).getTime() + 24 * 60 * 60 * 1000).toISOString());
      }

      const { data, error } = await query.order('start_time', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as Appointment[]
      };
    } catch (error) {
      console.error('Erro ao listar apontamentos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Inicia um apontamento (timer)
   */
  async start(input: CreateAppointmentInput): Promise<ServiceResult<Appointment>> {
    try {
      return await this.create(input);
    } catch (error) {
      console.error('Erro ao iniciar apontamento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Para um apontamento (timer)
   */
  async stop(id: string, quantityProduced?: number, quantityRejected?: number): Promise<ServiceResult<Appointment>> {
    try {
      const appointmentResult = await this.getById(id);
      if (!appointmentResult.success) {
        return {
          success: false,
          error: appointmentResult.error
        };
      }

      const appointment = appointmentResult.data;
      const endTime = new Date().toISOString();
      const startTime = new Date(appointment.start_time);
      const totalTime = (new Date(endTime).getTime() - startTime.getTime()) / 1000 / 60; // em minutos

      const updateResult = await this.update(id, {
        end_time: endTime,
        production_time: totalTime,
        quantity_produced: quantityProduced,
        quantity_rejected: quantityRejected,
      });

      return updateResult;
    } catch (error) {
      console.error('Erro ao parar apontamento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula a eficiência de um apontamento
   */
  async calculateEfficiency(id: string): Promise<ServiceResult<number>> {
    try {
      const appointmentResult = await this.getById(id);
      if (!appointmentResult.success) {
        return {
          success: false,
          error: appointmentResult.error
        };
      }

      const appointment = appointmentResult.data;

      if (!appointment.production_time || !appointment.quantity_produced) {
        return {
          success: true,
          data: 0
        };
      }

      // Buscar tempo padrão da operação
      let standardTime = 0;
      if (appointment.operation_id) {
        const { data: operation } = await supabase
          .from('processos')
          .select('standard_time')
          .eq('id', appointment.operation_id)
          .single();

        if (operation) {
          standardTime = operation.standard_time || 0;
        }
      }

      // Se não tiver tempo padrão, usar uma estimativa simples
      if (standardTime === 0) {
        standardTime = appointment.production_time / (appointment.quantity_produced || 1);
      }

      // Calcular eficiência: (tempo padrão * quantidade) / tempo real
      const expectedTime = standardTime * (appointment.quantity_produced || 1);
      const efficiency = expectedTime > 0 ? (expectedTime / appointment.production_time) * 100 : 0;

      // Atualizar eficiência no apontamento
      await supabase
        .from('apontamentos')
        .update({ efficiency })
        .eq('id', id);

      return {
        success: true,
        data: Math.min(efficiency, 100) // Limitar a 100%
      };
    } catch (error) {
      console.error('Erro ao calcular eficiência:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula o OEE (Overall Equipment Effectiveness) de um equipamento
   */
  async calculateOEE(equipmentId: string, startDate: string, endDate: string): Promise<ServiceResult<{ availability: number; performance: number; quality: number; oee: number }>> {
    try {
      // Buscar apontamentos do período
      const { data: appointments, error } = await supabase
        .from('apontamentos')
        .select('*')
        .eq('equipment_id', equipmentId)
        .gte('start_time', startDate)
        .lte('start_time', endDate);

      if (error) throw error;

      if (!appointments || appointments.length === 0) {
        return {
          success: true,
          data: { availability: 0, performance: 0, quality: 0, oee: 0 }
        };
      }

      // Calcular disponibilidade
      const totalTime = appointments.reduce((sum, appt) => {
        const start = new Date(appt.start_time).getTime();
        const end = appt.end_time ? new Date(appt.end_time).getTime() : Date.now();
        return sum + (end - start);
      }, 0);

      const plannedTime = (new Date(endDate).getTime() - new Date(startDate).getTime());
      const availability = plannedTime > 0 ? (totalTime / plannedTime) * 100 : 0;

      // Calcular performance
      const totalProduced = appointments.reduce((sum, appt) => sum + (appt.quantity_produced || 0), 0);
      const totalStandardTime = appointments.reduce((sum, appt) => {
        const standardTime = appt.production_time || 0;
        return sum + (standardTime * (appt.quantity_produced || 1));
      }, 0);
      const actualProductionTime = appointments.reduce((sum, appt) => sum + (appt.production_time || 0), 0);
      const performance = actualProductionTime > 0 ? (totalStandardTime / actualProductionTime) * 100 : 0;

      // Calcular qualidade
      const totalRejected = appointments.reduce((sum, appt) => sum + (appt.quantity_rejected || 0), 0);
      const quality = (totalProduced + totalRejected) > 0 ? (totalProduced / (totalProduced + totalRejected)) * 100 : 0;

      // Calcular OEE
      const oee = (availability * performance * quality) / 10000;

      return {
        success: true,
        data: {
          availability: Math.min(availability, 100),
          performance: Math.min(performance, 100),
          quality: Math.min(quality, 100),
          oee: Math.min(oee, 100)
        }
      };
    } catch (error) {
      console.error('Erro ao calcular OEE:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca apontamentos ativos (em andamento)
   */
  async getActiveAppointments(): Promise<ServiceResult<Appointment[]>> {
    try {
      const { data, error } = await supabase
        .from('apontamentos')
        .select(`
          *,
          production_orders:production_order_id (order_number, product_id, quantity),
          equipment:equipment_id (name, code),
          employees:employee_id (name, function)
        `)
        .is('end_time', null)
        .order('start_time', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as Appointment[]
      };
    } catch (error) {
      console.error('Erro ao buscar apontamentos ativos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const appointmentService = new AppointmentService();
