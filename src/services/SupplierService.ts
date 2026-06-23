import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";

export interface Supplier {
  id: string;
  name: string;
  cnpj?: string;
  contato?: string;
  email?: string;
  leadtime?: number;
  condicao?: string;
  avaliacao?: number;
  categoria?: string;
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateSupplierInput {
  name: string;
  cnpj?: string;
  contato?: string;
  email?: string;
  leadtime?: number;
  condicao?: string;
  avaliacao?: number;
  categoria?: string;
}

export interface UpdateSupplierInput {
  name?: string;
  cnpj?: string;
  contato?: string;
  email?: string;
  leadtime?: number;
  condicao?: string;
  avaliacao?: number;
  categoria?: string;
}

export class SupplierService {
  /**
   * Cria um novo fornecedor
   */
  async create(input: CreateSupplierInput): Promise<ServiceResult<Supplier>> {
    try {
      const meta: Record<string, any> = {};
      
      if (input.cnpj) meta.cnpj = input.cnpj;
      if (input.contato) meta.contato = input.contato;
      if (input.email) meta.email = input.email;
      if (input.leadtime !== undefined) meta.leadtime = input.leadtime;
      if (input.condicao) meta.condicao = input.condicao;
      if (input.avaliacao !== undefined) meta.avaliacao = input.avaliacao;
      if (input.categoria) meta.categoria = input.categoria;

      const { data, error } = await supabase
        .schema('industrial').from('fornecedores')
        .insert({
          name: input.name,
          meta,
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
      const currentResult = await this.getById(id);
      if (!currentResult.success || !currentResult.data) {
        return {
          success: false,
          error: 'Fornecedor não encontrado'
        };
      }

      const meta = { ...currentResult.data.meta };
      
      if (input.cnpj !== undefined) meta.cnpj = input.cnpj;
      if (input.contato !== undefined) meta.contato = input.contato;
      if (input.email !== undefined) meta.email = input.email;
      if (input.leadtime !== undefined) meta.leadtime = input.leadtime;
      if (input.condicao !== undefined) meta.condicao = input.condicao;
      if (input.avaliacao !== undefined) meta.avaliacao = input.avaliacao;
      if (input.categoria !== undefined) meta.categoria = input.categoria;

      const { data, error } = await supabase
        .schema('industrial').from('fornecedores')
        .update({
          name: input.name,
          meta,
          updated_at: new Date().toISOString(),
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
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
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
   * Busca um fornecedor por ID
   */
  async getById(id: string): Promise<ServiceResult<Supplier>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('fornecedores')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
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
   * Lista fornecedores
   */
  async list(options?: {
    search?: string;
    categoria?: string;
    topRated?: boolean;
  }): Promise<ServiceResult<Supplier[]>> {
    try {
      let query = supabase
        .schema('industrial').from('fornecedores')
        .select('*')
        .is('deleted_at', null);

      if (options?.search) {
        query = query.ilike('name', `%${options.search}%`);
      }

      if (options?.categoria) {
        query = query.contains('meta', { categoria: options.categoria });
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      let suppliers = data as Supplier[];

      if (options?.topRated) {
        suppliers = suppliers.filter(supplier => {
          const avaliacao = Number(supplier.meta?.avaliacao || 0);
          return avaliacao >= 4;
        });
      }

      return {
        success: true,
        data: suppliers
      };
    } catch (error) {
      console.error('Erro ao listar fornecedores:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca fornecedores por categoria
   */
  async getByCategory(categoria: string): Promise<ServiceResult<Supplier[]>> {
    return this.list({ categoria });
  }

  /**
   * Busca fornecedores top rated
   */
  async getTopRatedSuppliers(): Promise<ServiceResult<Supplier[]>> {
    return this.list({ topRated: true });
  }

  /**
   * Calcula lead time médio por categoria
   */
  async getAverageLeadTimeByCategory(): Promise<ServiceResult<Array<{ categoria: string; averageLeadTime: number }>>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('fornecedores')
        .select('meta')
        .is('deleted_at', null);

      if (error) throw error;

      const categoryMap = new Map<string, { total: number; count: number }>();

      (data as Supplier[]).forEach(supplier => {
        const categoria = supplier.meta?.categoria || 'Outros';
        const leadtime = Number(supplier.meta?.leadtime || 0);

        if (leadtime > 0) {
          if (!categoryMap.has(categoria)) {
            categoryMap.set(categoria, { total: 0, count: 0 });
          }
          const current = categoryMap.get(categoria)!;
          current.total += leadtime;
          current.count += 1;
        }
      });

      const result = Array.from(categoryMap.entries()).map(([categoria, data]) => ({
        categoria,
        averageLeadTime: data.count > 0 ? Math.round(data.total / data.count) : 0
      }));

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Erro ao calcular lead time médio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza avaliação de fornecedor
   */
  async updateRating(id: string, rating: number): Promise<ServiceResult<Supplier>> {
    try {
      if (rating < 1 || rating > 5) {
        return {
          success: false,
          error: 'Avaliação deve estar entre 1 e 5'
        };
      }

      const currentResult = await this.getById(id);
      if (!currentResult.success || !currentResult.data) {
        return {
          success: false,
          error: 'Fornecedor não encontrado'
        };
      }

      const meta = { ...currentResult.data.meta };
      meta.avaliacao = rating;

      const { data, error } = await supabase
        .schema('industrial').from('fornecedores')
        .update({
          meta,
          updated_at: new Date().toISOString(),
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
      console.error('Erro ao atualizar avaliação:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca fornecedores críticos (lead time alto ou avaliação baixa)
   */
  async getCriticalSuppliers(): Promise<ServiceResult<Array<{ supplier: Supplier; issue: string; severity: 'high' | 'medium' | 'low' }>>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('fornecedores')
        .select('*')
        .is('deleted_at', null);

      if (error) throw error;

      const criticalSuppliers: Array<{ supplier: Supplier; issue: string; severity: 'high' | 'medium' | 'low' }> = [];

      (data as Supplier[]).forEach(supplier => {
        const leadtime = Number(supplier.meta?.leadtime || 0);
        const avaliacao = Number(supplier.meta?.avaliacao || 0);

        if (leadtime > 14) {
          criticalSuppliers.push({
            supplier,
            issue: 'Lead time acima de 14 dias',
            severity: 'high'
          });
        } else if (leadtime > 10) {
          criticalSuppliers.push({
            supplier,
            issue: 'Lead time acima de 10 dias',
            severity: 'medium'
          });
        }

        if (avaliacao > 0 && avaliacao < 3) {
          criticalSuppliers.push({
            supplier,
            issue: 'Avaliação baixa',
            severity: 'high'
          });
        } else if (avaliacao > 0 && avaliacao < 4) {
          criticalSuppliers.push({
            supplier,
            issue: 'Avaliação abaixo da média',
            severity: 'medium'
          });
        }
      });

      return {
        success: true,
        data: criticalSuppliers
      };
    } catch (error) {
      console.error('Erro ao buscar fornecedores críticos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca fornecedores por material fornecido
   */
  async getByMaterial(materialId: string): Promise<ServiceResult<Supplier[]>> {
    try {
      // Buscar materiais para encontrar fornecedores associados
      const { data: materials, error } = await supabase
        .schema('industrial').from('materiais')
        .select('meta')
        .eq('id', materialId)
        .is('deleted_at', null)
        .single();

      if (error) throw error;

      const fornecedorNome = (materials as any)?.meta?.fornecedor;
      if (!fornecedorNome) {
        return {
          success: true,
          data: []
        };
      }

      // Buscar fornecedor pelo nome
      const { data: suppliers } = await supabase
        .schema('industrial').from('fornecedores')
        .select('*')
        .ilike('name', `%${fornecedorNome}%`)
        .is('deleted_at', null);

      return {
        success: true,
        data: suppliers as Supplier[]
      };
    } catch (error) {
      console.error('Erro ao buscar fornecedores por material:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const supplierService = new SupplierService();
