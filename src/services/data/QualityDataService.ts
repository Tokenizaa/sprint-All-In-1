import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "../types";

export interface QualityRecord {
  id: string;
  lote_id?: string;
  op_id?: string;
  inspetor_id?: string;
  tipo_inspecao: 'entrada' | 'processo' | 'final';
  status: 'pendente' | 'aprovado' | 'reprovado' | 'em_retrabalho';
  quantidade_inspecionada: number;
  quantidade_aprovada: number;
  quantidade_reprovada: number;
  quantidade_retrabalho: number;
  defeitos?: string[];
  observacoes?: string;
  data_inspecao: string;
  data_criacao: string;
  data_atualizacao: string;
}

export interface CreateQualityRecordInput {
  lote_id?: string;
  op_id?: string;
  inspetor_id?: string;
  tipo_inspecao: 'entrada' | 'processo' | 'final';
  quantidade_inspecionada: number;
  quantidade_aprovada?: number;
  quantidade_reprovada?: number;
  quantidade_retrabalho?: number;
  defeitos?: string[];
  observacoes?: string;
}

export interface UpdateQualityRecordInput {
  status?: QualityRecord['status'];
  quantidade_aprovada?: number;
  quantidade_reprovada?: number;
  quantidade_retrabalho?: number;
  defeitos?: string[];
  observacoes?: string;
}

export class QualityDataService {
  /**
   * Busca todos os registros de qualidade
   */
  async getAll(): Promise<ServiceResult<QualityRecord[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('qualidade')
        .select(`
          *,
          lotes:lote_id (codigo),
          ordens_producao:op_id (numero),
          funcionarios:inspetor_id (nome)
        `)
        .order('data_inspecao', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as QualityRecord[]
      };
    } catch (error) {
      console.error('Erro ao buscar registros de qualidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca um registro de qualidade por ID
   */
  async getById(id: string): Promise<ServiceResult<QualityRecord>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('qualidade')
        .select(`
          *,
          lotes:lote_id (codigo),
          ordens_producao:op_id (numero),
          funcionarios:inspetor_id (nome)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as QualityRecord
      };
    } catch (error) {
      console.error('Erro ao buscar registro de qualidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria um novo registro de qualidade
   */
  async create(input: CreateQualityRecordInput): Promise<ServiceResult<QualityRecord>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('qualidade')
        .insert({
          ...input,
          status: 'pendente',
          quantidade_aprovada: input.quantidade_aprovada || 0,
          quantidade_reprovada: input.quantidade_reprovada || 0,
          quantidade_retrabalho: input.quantidade_retrabalho || 0,
          data_inspecao: new Date().toISOString(),
          data_criacao: new Date().toISOString(),
          data_atualizacao: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as QualityRecord
      };
    } catch (error) {
      console.error('Erro ao criar registro de qualidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza um registro de qualidade
   */
  async update(id: string, input: UpdateQualityRecordInput): Promise<ServiceResult<QualityRecord>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('qualidade')
        .update({
          ...input,
          data_atualizacao: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as QualityRecord
      };
    } catch (error) {
      console.error('Erro ao atualizar registro de qualidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove um registro de qualidade
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .schema('industrial').from('qualidade')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover registro de qualidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista registros por tipo de inspeção
   */
  async getByInspectionType(tipo: QualityRecord['tipo_inspecao']): Promise<ServiceResult<QualityRecord[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('qualidade')
        .select(`
          *,
          lotes:lote_id (codigo),
          ordens_producao:op_id (numero),
          funcionarios:inspetor_id (nome)
        `)
        .eq('tipo_inspecao', tipo)
        .order('data_inspecao', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as QualityRecord[]
      };
    } catch (error) {
      console.error('Erro ao buscar registros por tipo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista registros por lote
   */
  async getByLot(loteId: string): Promise<ServiceResult<QualityRecord[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('qualidade')
        .select('*')
        .eq('lote_id', loteId)
        .order('data_inspecao', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as QualityRecord[]
      };
    } catch (error) {
      console.error('Erro ao buscar registros por lote:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Real-time subscription para qualidade
   */
  subscribeToQuality(callback: (payload: any) => void) {
    return supabase
      .channel('qualidade-changes')
      .on('postgres_changes', { event: '*', schema: 'industrial', table: 'qualidade' }, callback)
      .subscribe();
  }
}

// Singleton instance
export const qualityDataService = new QualityDataService();
