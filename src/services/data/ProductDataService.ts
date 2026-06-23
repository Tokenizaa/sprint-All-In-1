import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "../types";

export interface Product {
  id: string;
  modelo: string;
  sku: string;
  descricao?: string;
  categoria?: string;
  linha_comercial?: string;
  preco_venda?: number;
  custo_unitario?: number;
  margem_lucro?: number;
  ativo: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

export interface CreateProductInput {
  modelo: string;
  sku: string;
  descricao?: string;
  categoria?: string;
  linha_comercial?: string;
  preco_venda?: number;
  custo_unitario?: number;
  margem_lucro?: number;
}

export interface UpdateProductInput {
  modelo?: string;
  sku?: string;
  descricao?: string;
  categoria?: string;
  linha_comercial?: string;
  preco_venda?: number;
  custo_unitario?: number;
  margem_lucro?: number;
  ativo?: boolean;
}

export class ProductDataService {
  /**
   * Busca todos os produtos
   */
  async getAll(): Promise<ServiceResult<Product[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('produtos')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as Product[]
      };
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca um produto por ID
   */
  async getById(id: string): Promise<ServiceResult<Product>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('produtos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Product
      };
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria um novo produto
   */
  async create(input: CreateProductInput): Promise<ServiceResult<Product>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('produtos')
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
        data: data as Product
      };
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza um produto
   */
  async update(id: string, input: UpdateProductInput): Promise<ServiceResult<Product>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('produtos')
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
        data: data as Product
      };
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove um produto (soft delete)
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .schema('industrial').from('produtos')
        .update({ ativo: false, data_atualizacao: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca produtos por categoria
   */
  async getByCategory(categoria: string): Promise<ServiceResult<Product[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('produtos')
        .select('*')
        .eq('categoria', categoria)
        .eq('ativo', true)
        .order('modelo', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as Product[]
      };
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca produtos por linha comercial
   */
  async getByCommercialLine(linha: string): Promise<ServiceResult<Product[]>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('produtos')
        .select('*')
        .eq('linha_comercial', linha)
        .eq('ativo', true)
        .order('modelo', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as Product[]
      };
    } catch (error) {
      console.error('Erro ao buscar produtos por linha comercial:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Real-time subscription para produtos
   */
  subscribeToProducts(callback: (payload: any) => void) {
    return supabase
      .channel('produtos-changes')
      .on('postgres_changes', { event: '*', schema: 'industrial', table: 'produtos' }, callback)
      .subscribe();
  }
}

// Singleton instance
export const productDataService = new ProductDataService();
