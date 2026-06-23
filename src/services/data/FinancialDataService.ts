import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "../types";

export interface LaborCost {
  id: string;
  funcionario_id: string;
  nome_funcionario: string;
  taxa_hora: number;
  horas_trabalhadas: number;
  custo_total: number;
  data: string;
  tarefa_id?: string;
  tipo_tarefa?: string;
  data_registro: string;
}

export interface EquipmentCost {
  id: string;
  equipamento_id: string;
  nome_equipamento: string;
  taxa_hora: number;
  horas_utilizadas: number;
  custo_total: number;
  data: string;
  op_id?: string;
  data_registro: string;
}

export interface CreateLaborCostInput {
  funcionario_id: string;
  nome_funcionario: string;
  taxa_hora: number;
  horas_trabalhadas: number;
  data: string;
  tarefa_id?: string;
  tipo_tarefa?: string;
}

export interface CreateEquipmentCostInput {
  equipamento_id: string;
  nome_equipamento: string;
  taxa_hora: number;
  horas_utilizadas: number;
  data: string;
  op_id?: string;
}

export class FinancialDataService {
  /**
   * Busca todos os custos de mão de obra
   */
  async getAllLaborCosts(): Promise<ServiceResult<LaborCost[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('custos_mao_obra')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as LaborCost[]
      };
    } catch (error) {
      console.error('Erro ao buscar custos de mão de obra:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca todos os custos de equipamentos
   */
  async getAllEquipmentCosts(): Promise<ServiceResult<EquipmentCost[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('custos_equipamentos')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as EquipmentCost[]
      };
    } catch (error) {
      console.error('Erro ao buscar custos de equipamentos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Registra custo de mão de obra
   */
  async registerLaborCost(input: CreateLaborCostInput): Promise<ServiceResult<LaborCost>> {
    try {
      const custoTotal = input.taxa_hora * input.horas_trabalhadas;

      const { data, error } = await supabase
        .schema('industrial').from('custos_mao_obra')
        .insert({
          ...input,
          custo_total: custoTotal,
          data_registro: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as LaborCost
      };
    } catch (error) {
      console.error('Erro ao registrar custo de mão de obra:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Registra custo de equipamento
   */
  async registerEquipmentCost(input: CreateEquipmentCostInput): Promise<ServiceResult<EquipmentCost>> {
    try {
      const custoTotal = input.taxa_hora * input.horas_utilizadas;

      const { data, error } = await supabase
        .schema('industrial').from('custos_equipamentos')
        .insert({
          ...input,
          custo_total: custoTotal,
          data_registro: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as EquipmentCost
      };
    } catch (error) {
      console.error('Erro ao registrar custo de equipamento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca custos por período
   */
  async getLaborCostsByPeriod(startDate: string, endDate: string): Promise<ServiceResult<LaborCost[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('custos_mao_obra')
        .select('*')
        .gte('data', startDate)
        .lte('data', endDate)
        .order('data', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as LaborCost[]
      };
    } catch (error) {
      console.error('Erro ao buscar custos por período:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca custos de equipamentos por período
   */
  async getEquipmentCostsByPeriod(startDate: string, endDate: string): Promise<ServiceResult<EquipmentCost[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('custos_equipamentos')
        .select('*')
        .gte('data', startDate)
        .lte('data', endDate)
        .order('data', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as EquipmentCost[]
      };
    } catch (error) {
      console.error('Erro ao buscar custos de equipamentos por período:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Real-time subscription para custos de mão de obra
   */
  subscribeToLaborCosts(callback: (payload: any) => void) {
    return supabase
      .channel('custos-mao-obra-changes')
      .on('postgres_changes', { event: '*', schema: 'industrial', table: 'custos_mao_obra' }, callback)
      .subscribe();
  }

  /**
   * Real-time subscription para custos de equipamentos
   */
  subscribeToEquipmentCosts(callback: (payload: any) => void) {
    return supabase
      .channel('custos-equipamentos-changes')
      .on('postgres_changes', { event: '*', schema: 'industrial', table: 'custos_equipamentos' }, callback)
      .subscribe();
  }
}

// Singleton instance
export const financialDataService = new FinancialDataService();
