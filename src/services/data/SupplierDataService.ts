import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "../types";

export interface Supplier {
  id: string;
  nome: string;
  cnpj?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  lead_time_dias?: number;
  condicoes_pagamento?: string;
  ativo: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

export interface CreateSupplierInput {
  nome: string;
  cnpj?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  lead_time_dias?: number;
  condicoes_pagamento?: string;
}

export interface UpdateSupplierInput {
  nome?: string;
  cnpj?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  lead_time_dias?: number;
  condicoes_pagamento?: string;
  ativo?: boolean;
}

export class SupplierDataService {
  /**
   * Busca todos os fornecedores
   */
  async getAll(): Promise<ServiceResult<Supplier[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('fornecedores')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as Supplier[]
      };
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca um fornecedor por ID
   */
  async getById(id: string): Promise<ServiceResult<Supplier>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('fornecedores')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Supplier
      };
    } catch (error) {
      console.error('Erro ao buscar fornecedor:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria um novo fornecedor
   */
  async create(input: CreateSupplierInput): Promise<ServiceResult<Supplier>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('fornecedores')
        .insert({
          ...input,
          ativo: true,
          data_criacao: new Date().toISOString(),
          data_atualizacao: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Supplier
      };
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza um fornecedor
   */
  async update(id: string, input: UpdateSupplierInput): Promise<ServiceResult<Supplier>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('fornecedores')
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
        data: data as Supplier
      };
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove um fornecedor (soft delete)
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .schema('industrial').from('fornecedores')
        .update({ ativo: false, data_atualizacao: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover fornecedor:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca fornecedores ativos
   */
  async getActive(): Promise<ServiceResult<Supplier[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('fornecedores')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as Supplier[]
      };
    } catch (error) {
      console.error('Erro ao buscar fornecedores ativos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Real-time subscription para fornecedores
   */
  subscribeToSuppliers(callback: (payload: any) => void) {
    return supabase
      .channel('fornecedores-changes')
      .on('postgres_changes', { event: '*', schema: 'industrial', table: 'fornecedores' }, callback)
      .subscribe();
  }
}

// Singleton instance
export const supplierDataService = new SupplierDataService();
