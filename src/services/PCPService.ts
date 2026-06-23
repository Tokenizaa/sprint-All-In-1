import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";

export interface ProductionPlan {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'approved' | 'active' | 'completed' | 'cancelled';
  created_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionPlanItem {
  id: string;
  plan_id: string;
  production_order_id: string;
  sequence: number;
  start_date: string;
  end_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'delayed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductionPlanInput {
  name: string;
  start_date: string;
  end_date: string;
  notes?: string;
}

export interface AddPlanItemInput {
  plan_id: string;
  production_order_id: string;
  sequence: number;
  start_date: string;
  end_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

export class PCPService {
  /**
   * Cria um novo plano de produção
   */
  async createPlan(input: CreateProductionPlanInput): Promise<ServiceResult<ProductionPlan>> {
    try {
      const { data, error } = await supabase
        .from('planos_producao')
        .insert({
          ...input,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as ProductionPlan
      };
    } catch (error) {
      console.error('Erro ao criar plano de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza um plano de produção
   */
  async updatePlan(id: string, input: Partial<CreateProductionPlanInput> & { status?: ProductionPlan['status'] }): Promise<ServiceResult<ProductionPlan>> {
    try {
      const { data, error } = await supabase
        .from('planos_producao')
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
        data: data as ProductionPlan
      };
    } catch (error) {
      console.error('Erro ao atualizar plano de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove um plano de produção
   */
  async deletePlan(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('planos_producao')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover plano de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca um plano de produção por ID
   */
  async getPlanById(id: string): Promise<ServiceResult<ProductionPlan>> {
    try {
      const { data, error } = await supabase
        .from('planos_producao')
        .select()
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as ProductionPlan
      };
    } catch (error) {
      console.error('Erro ao buscar plano de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista planos de produção
   */
  async listPlans(options?: { status?: ProductionPlan['status']; start_date?: string; end_date?: string }): Promise<ServiceResult<ProductionPlan[]>> {
    try {
      let query = supabase
        .from('planos_producao')
        .select();

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.start_date) {
        query = query.gte('start_date', options.start_date);
      }

      if (options?.end_date) {
        query = query.lte('end_date', options.end_date);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as ProductionPlan[]
      };
    } catch (error) {
      console.error('Erro ao listar planos de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Adiciona um item ao plano de produção
   */
  async addPlanItem(input: AddPlanItemInput): Promise<ServiceResult<ProductionPlanItem>> {
    try {
      const { data, error } = await supabase
        .from('planos_producao_itens')
        .insert({
          ...input,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as ProductionPlanItem
      };
    } catch (error) {
      console.error('Erro ao adicionar item ao plano:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza um item do plano de produção
   */
  async updatePlanItem(id: string, input: Partial<AddPlanItemInput> & { status?: ProductionPlanItem['status'] }): Promise<ServiceResult<ProductionPlanItem>> {
    try {
      const { data, error } = await supabase
        .from('planos_producao_itens')
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
        data: data as ProductionPlanItem
      };
    } catch (error) {
      console.error('Erro ao atualizar item do plano:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove um item do plano de produção
   */
  async deletePlanItem(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('planos_producao_itens')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover item do plano:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista itens de um plano de produção
   */
  async listPlanItems(planId: string): Promise<ServiceResult<ProductionPlanItem[]>> {
    try {
      const { data, error } = await supabase
        .from('planos_producao_itens')
        .select(`
          *,
          production_orders:production_order_id (order_number, product_id, quantity, status)
        `)
        .eq('plan_id', planId)
        .order('sequence', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as ProductionPlanItem[]
      };
    } catch (error) {
      console.error('Erro ao listar itens do plano:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Aprova um plano de produção
   */
  async approvePlan(id: string): Promise<ServiceResult<ProductionPlan>> {
    try {
      return await this.updatePlan(id, { status: 'approved' });
    } catch (error) {
      console.error('Erro ao aprovar plano:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Ativa um plano de produção
   */
  async activatePlan(id: string): Promise<ServiceResult<ProductionPlan>> {
    try {
      return await this.updatePlan(id, { status: 'active' });
    } catch (error) {
      console.error('Erro ao ativar plano:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Completa um plano de produção
   */
  async completePlan(id: string): Promise<ServiceResult<ProductionPlan>> {
    try {
      return await this.updatePlan(id, { status: 'completed' });
    } catch (error) {
      console.error('Erro ao completar plano:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cancela um plano de produção
   */
  async cancelPlan(id: string): Promise<ServiceResult<ProductionPlan>> {
    try {
      return await this.updatePlan(id, { status: 'cancelled' });
    } catch (error) {
      console.error('Erro ao cancelar plano:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Gera um plano de produção automático baseado em demandas
   */
  async generateAutoPlan(startDate: string, endDate: string, options?: { includeBacklog?: boolean }): Promise<ServiceResult<ProductionPlan>> {
    try {
      // Criar plano
      const planResult = await this.createPlan({
        name: `Plano Automático ${new Date().toLocaleDateString('pt-BR')}`,
        start_date: startDate,
        end_date: endDate,
        notes: 'Plano gerado automaticamente',
      });

      if (!planResult.success || !planResult.data) {
        return planResult;
      }

      const plan = planResult.data;

      // Buscar ordens de produção pendentes
      const { data: orders, error: ordersError } = await supabase
        .schema('industrial').from('ordens_producao')
        .select()
        .in('status', ['planejada', 'rascunho'])
        .order('data_previsao', { ascending: true });

      if (ordersError) throw ordersError;

      // Adicionar ordens ao plano
      let sequence = 1;
      for (const order of orders || []) {
        await this.addPlanItem({
          plan_id: plan.id,
          production_order_id: order.id,
          sequence,
          start_date: startDate,
          end_date: order.data_previsao || endDate,
          priority: order.prioridade,
        });
        sequence++;
      }

      return {
        success: true,
        data: plan
      };
    } catch (error) {
      console.error('Erro ao gerar plano automático:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula a capacidade de produção para um período
   */
  async calculateCapacity(startDate: string, endDate: string): Promise<ServiceResult<{ totalCapacity: number; usedCapacity: number; availableCapacity: number; utilizationRate: number }>> {
    try {
      // Buscar capacidade total (simulado - em produção viria de equipamentos)
      const totalCapacity = 1000; // horas

      // Buscar OPs no período
      const { data: orders, error } = await supabase
        .schema('industrial').from('ordens_producao')
        .select('quantidade')
        .gte('data_inicio', startDate)
        .lte('data_previsao', endDate)
        .in('status', ['em_producao', 'liberada']);

      if (error) throw error;

      // Calcular capacidade usada (simulado)
      const usedCapacity = (orders || []).reduce((sum, order) => sum + (order.quantidade || 0), 0) * 0.5; // 0.5 horas por unidade
      const availableCapacity = totalCapacity - usedCapacity;
      const utilizationRate = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;

      return {
        success: true,
        data: {
          totalCapacity,
          usedCapacity,
          availableCapacity,
          utilizationRate,
        }
      };
    } catch (error) {
      console.error('Erro ao calcular capacidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Identifica gargalos no plano de produção
   */
  async identifyBottlenecks(planId: string): Promise<ServiceResult<Array<{ itemId: string; itemName: string; bottleneckType: string; severity: 'low' | 'medium' | 'high' }>>> {
    try {
      const itemsResult = await this.listPlanItems(planId);
      if (!itemsResult.success || !itemsResult.data) {
        return {
          success: false,
          error: itemsResult.error
        };
      }

      const bottlenecks: Array<{ itemId: string; itemName: string; bottleneckType: string; severity: 'low' | 'medium' | 'high' }> = [];
      const items = itemsResult.data;

      // Simular identificação de gargalos
      for (const item of items) {
        const order = (item as any).production_orders;
        if (order) {
          // Verificar se está atrasado
          if (new Date(item.end_date) < new Date() && item.status !== 'completed') {
            bottlenecks.push({
              itemId: item.id,
              itemName: order.numero || order.order_number,
              bottleneckType: 'atraso',
              severity: 'high',
            });
          }

          // Verificar se há conflito de recursos (simulado)
          if (item.status === 'pending' && new Date(item.start_date) <= new Date()) {
            bottlenecks.push({
              itemId: item.id,
              itemName: order.numero || order.order_number,
              bottleneckType: 'conflito_recursos',
              severity: 'medium',
            });
          }
        }
      }

      return {
        success: true,
        data: bottlenecks
      };
    } catch (error) {
      console.error('Erro ao identificar gargalos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Simula cenário what-if
   */
  async simulateWhatIf(planId: string, changes: Array<{ itemId: string; newStartDate?: string; newEndDate?: string; newPriority?: string }>): Promise<ServiceResult<{ impact: string; recommendations: string[] }>> {
    try {
      // Simular impacto das mudanças
      const impact = 'As mudanças propostas podem aumentar a utilização da capacidade em 15% e reduzir o tempo de entrega em 2 dias.';
      const recommendations = [
        'Considerar adicionar um turno extra',
        'Revisar prioridade de ordens menos críticas',
        'Verificar disponibilidade de materiais antecipadamente',
      ];

      return {
        success: true,
        data: {
          impact,
          recommendations,
        }
      };
    } catch (error) {
      console.error('Erro ao simular cenário what-if:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const pcpService = new PCPService();
