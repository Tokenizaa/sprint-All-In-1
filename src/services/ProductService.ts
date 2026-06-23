import { supabase } from "@/lib/supabase";
import type { ServiceResult, ServiceError } from "./types";

export interface Product {
  id: string;
  modelo: string;
  categoria?: string;
  largura_cm?: number;
  comprimento_cm?: number;
  altura_cm?: number;
  especificacoes?: Record<string, any>;
  observacoes?: string;
  densidade?: number;
  composicao?: string;
  linha?: string;
  colecao?: string;
  observacoes_tecnicas?: string;
  tipo_espuma?: string;
  altura_espuma_cm?: number;
  qtd_camadas?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateProductInput {
  modelo: string;
  categoria?: string;
  largura_cm?: number;
  comprimento_cm?: number;
  altura_cm?: number;
  especificacoes?: Record<string, any>;
  observacoes?: string;
  densidade?: number;
  composicao?: string;
  linha?: string;
  colecao?: string;
  observacoes_tecnicas?: string;
  tipo_espuma?: string;
  altura_espuma_cm?: number;
  qtd_camadas?: number;
}

export interface UpdateProductInput {
  modelo?: string;
  categoria?: string;
  largura_cm?: number;
  comprimento_cm?: number;
  altura_cm?: number;
  especificacoes?: Record<string, any>;
  observacoes?: string;
  densidade?: number;
  composicao?: string;
  linha?: string;
  colecao?: string;
  observacoes_tecnicas?: string;
  tipo_espuma?: string;
  altura_espuma_cm?: number;
  qtd_camadas?: number;
}

export class ProductService {
  /**
   * Cria um novo produto
   */
  async create(input: CreateProductInput): Promise<ServiceResult<Product>> {
    try {
      // Validar modelo único
      const { data: existingModel, error: modelError } = await supabase
        .schema('industrial').from('produtos')
        .select('id')
        .eq('modelo', input.modelo)
        .is('deleted_at', null)
        .single();

      if (existingModel && !modelError) {
        return {
          success: false,
          error: 'Modelo já existe no sistema'
        };
      }

      const { data, error } = await supabase
        .schema('industrial').from('produtos')
        .insert({
          modelo: input.modelo,
          categoria: input.categoria,
          largura_cm: input.largura_cm,
          comprimento_cm: input.comprimento_cm,
          altura_cm: input.altura_cm,
          especificacoes: input.especificacoes,
          observacoes: input.observacoes,
          densidade: input.densidade,
          composicao: input.composicao,
          linha: input.linha,
          colecao: input.colecao,
          observacoes_tecnicas: input.observacoes_tecnicas,
          tipo_espuma: input.tipo_espuma,
          altura_espuma_cm: input.altura_espuma_cm,
          qtd_camadas: input.qtd_camadas,
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
   * Atualiza um produto existente
   */
  async update(id: string, input: UpdateProductInput): Promise<ServiceResult<Product>> {
    try {
      // Se modelo for alterado, verificar unicidade
      if (input.modelo) {
        const { data: existingModel } = await supabase
          .schema('industrial').from('produtos')
          .select('id')
          .eq('modelo', input.modelo)
          .is('deleted_at', null)
          .neq('id', id)
          .single();

        if (existingModel) {
          return {
            success: false,
            error: 'Modelo já existe no sistema'
          };
        }
      }

      const { data, error } = await supabase
        .schema('industrial').from('produtos')
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
        .update({ deleted_at: new Date().toISOString() })
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
   * Busca um produto por ID
   */
  async getById(id: string): Promise<ServiceResult<Product>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('produtos')
        .select()
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
   * Lista todos os produtos ativos
   */
  async list(options?: { search?: string; category?: string }): Promise<ServiceResult<Product[]>> {
    try {
      let query = supabase
        .schema('industrial').from('produtos')
        .select()
        .is('deleted_at', null);

      if (options?.search) {
        query = query.or(`modelo.ilike.%${options.search}%,observacoes.ilike.%${options.search}%`);
      }

      if (options?.category) {
        query = query.eq('categoria', options.category);
      }

      const { data, error } = await query.order('modelo', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as Product[]
      };
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula o custo total do produto baseado na BOM
   */
  async calculateCost(productId: string): Promise<ServiceResult<number>> {
    try {
      // Buscar BOM do produto
      const { data: bomItems, error: bomError } = await supabase
        .schema('industrial').from('bill_of_materials')
        .select(`
          quantidade,
          componente_id,
          componente_id!inner(
            nome,
            especificacoes
          )
        `)
        .eq('produto_id', productId)
        .is('deleted_at', null);

      if (bomError) throw bomError;

      if (!bomItems || bomItems.length === 0) {
        return {
          success: true,
          data: 0
        };
      }

      // Calcular custo total (simplificado - precisa implementar lógica real)
      const totalCost = bomItems.reduce((sum: number, item: any) => {
        // TODO: Implementar cálculo real baseado em custo dos componentes
        return sum + (item.quantidade || 0);
      }, 0);

      return {
        success: true,
        data: totalCost
      };
    } catch (error) {
      console.error('Erro ao calcular custo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza o custo do produto
   */
  async updateCost(productId: string): Promise<ServiceResult<Product>> {
    try {
      const costResult = await this.calculateCost(productId);
      if (!costResult.success) {
        return {
          success: false,
          error: costResult.error
        };
      }

      // TODO: Implementar armazenamento de custo quando o campo for adicionado à tabela
      // Por enquanto, apenas retorna o produto atual
      return this.getById(productId);
    } catch (error) {
      console.error('Erro ao atualizar custo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verifica se o produto pode ser usado em produção
   */
  async canProduce(productId: string, quantity: number): Promise<ServiceResult<{ canProduce: boolean; reasons: string[] }>> {
    try {
      const reasons: string[] = [];

      // Buscar BOM do produto
      const { data: bomItems, error: bomError } = await supabase
        .schema('industrial').from('bill_of_materials')
        .select(`
          quantidade,
          componente_id
        `)
        .eq('produto_id', productId)
        .is('deleted_at', null);

      if (bomError) throw bomError;

      if (!bomItems || bomItems.length === 0) {
        reasons.push('Produto não possui BOM definida');
        return {
          success: true,
          data: { canProduce: false, reasons }
        };
      }

      // Verificar disponibilidade de componentes
      for (const item of bomItems) {
        const requiredQuantity = item.quantidade * quantity;

        if (item.componente_id) {
          // Buscar estoque por nome do componente (simplificado)
          const { data: component } = await supabase
            .schema('industrial').from('componentes')
            .select('nome')
            .eq('id', item.componente_id)
            .single();

          if (component) {
            const { data: stock } = await supabase
              .schema('industrial').from('estoque_industrial')
              .select('saldo_atual')
              .eq('nome', component.nome)
              .is('deleted_at', null)
              .single();

            if (!stock || stock.saldo_atual < requiredQuantity) {
              reasons.push(`Componente insuficiente: ${component.nome} - necessita ${requiredQuantity}, disponível ${stock?.saldo_atual || 0}`);
            }
          }
        }
      }

      return {
        success: true,
        data: {
          canProduce: reasons.length === 0,
          reasons
        }
      };
    } catch (error) {
      console.error('Erro ao verificar produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const productService = new ProductService();
