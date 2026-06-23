import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";
import { bomService } from "./BOMService";

export interface ProductCost {
  productId: string;
  productName: string;
  productSku: string;
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  overheadCost: number;
  totalCost: number;
  unitCost: number;
  margin: number;
  sellingPrice: number;
  profit: number;
  costBreakdown: CostBreakdown[];
}

export interface CostBreakdown {
  type: 'material' | 'labor' | 'equipment' | 'overhead';
  name: string;
  cost: number;
  percentage: number;
}

export interface ProductionCost {
  productionOrderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  estimatedCost: number;
  actualCost: number;
  variance: number;
  variancePercentage: number;
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  overheadCost: number;
  startTime: string;
  endTime: string;
  duration: number; // em horas
}

export interface LaborCost {
  id?: string;
  employeeId: string;
  employeeName: string;
  hourlyRate: number;
  hoursWorked: number;
  totalCost: number;
  date: string;
  taskId?: string;
  taskType?: string;
}

export interface EquipmentCost {
  id?: string;
  equipmentId: string;
  equipmentName: string;
  hourlyRate: number;
  hoursUsed: number;
  totalCost: number;
  date: string;
  productionOrderId?: string;
}

export class CostService {
  /**
   * Calcula custo de produto baseado na BOM
   */
  async calculateProductCost(productId: string, quantity: number = 1): Promise<ServiceResult<ProductCost>> {
    try {
      // Buscar produto
      const { data: product, error: productError } = await supabase
        .schema('industrial').from('produtos')
        .select('modelo, sku, preco_venda')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      // Buscar BOM
      const bomResult = await bomService.getByProduct(productId);
      if (!bomResult.success) {
        return {
          success: false,
          error: bomResult.error
        };
      }

      // Calcular custo de materiais
      let materialCost = 0;
      const costBreakdown: CostBreakdown[] = [];

      for (const bomItem of bomResult.data) {
        let itemCost = 0;
        
        if (bomItem.componente_id) {
          const { data: component } = await supabase
            .schema('industrial').from('componentes')
            .select('custo_unitario')
            .eq('id', bomItem.componente_id)
            .single();
          itemCost = (component?.custo_unitario || 0) * bomItem.quantidade;
        }

        materialCost += itemCost;
        costBreakdown.push({
          type: 'material',
          name: bomItem.componente_id || 'Item',
          cost: itemCost,
          percentage: 0, // Calculado depois
        });
      }

      // Calcular custo de mão de obra (simulado - 15% do custo de material)
      const laborCost = materialCost * 0.15;
      costBreakdown.push({
        type: 'labor',
        name: 'Mão de Obra',
        cost: laborCost,
        percentage: 0,
      });

      // Calcular custo de equipamentos (simulado - 10% do custo de material)
      const equipmentCost = materialCost * 0.10;
      costBreakdown.push({
        type: 'equipment',
        name: 'Equipamentos',
        cost: equipmentCost,
        percentage: 0,
      });

      // Calcular overhead (simulado - 20% do custo total direto)
      const directCost = materialCost + laborCost + equipmentCost;
      const overheadCost = directCost * 0.20;
      costBreakdown.push({
        type: 'overhead',
        name: 'Overhead',
        cost: overheadCost,
        percentage: 0,
      });

      // Custo total
      const totalCost = directCost + overheadCost;
      const unitCost = totalCost / quantity;

      // Calcular porcentagens
      const totalCostForPercentage = totalCost || 1;
      costBreakdown.forEach(item => {
        item.percentage = (item.cost / totalCostForPercentage) * 100;
      });

      // Calcular margem e lucro
      const sellingPrice = product?.selling_price || 0;
      const margin = sellingPrice > 0 ? ((sellingPrice - unitCost) / sellingPrice) * 100 : 0;
      const profit = sellingPrice - unitCost;

      return {
        success: true,
        data: {
          productId,
          productName: product?.name || '',
          productSku: product?.sku || '',
          materialCost,
          laborCost,
          equipmentCost,
          overheadCost,
          totalCost,
          unitCost,
          margin,
          sellingPrice,
          profit,
          costBreakdown,
        }
      };
    } catch (error) {
      console.error('Erro ao calcular custo do produto:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula custo de produção em tempo real
   */
  async calculateProductionCost(productionOrderId: string): Promise<ServiceResult<ProductionCost>> {
    try {
      // Buscar ordem de produção
      const { data: order, error: orderError } = await supabase
        .schema('industrial').from('ordens_producao')
        .select('numero, produto, quantidade, data_inicio, data_previsao')
        .eq('id', productionOrderId)
        .single();

      if (orderError) throw orderError;

      // Buscar produto
      const { data: product } = await supabase
        .schema('industrial').from('produtos')
        .select('modelo')
        .eq('id', order.produto)
        .single();

      // Calcular custo estimado
      const costResult = await this.calculateProductCost(order.produto, order.quantidade);
      if (!costResult.success) {
        return {
          success: false,
          error: costResult.error
        };
      }

      const estimatedCost = costResult.data.totalCost;

      // Calcular custo real (simulado baseado em apontamentos)
      const { data: appointments } = await supabase
        .schema('industrial').from('apontamentos')
        .select('data_inicio, data_fim')
        .eq('op_id', productionOrderId);

      let actualDuration = 0;
      if (appointments && appointments.length > 0) {
        for (const appointment of appointments) {
          if (appointment.data_inicio && appointment.data_fim) {
            actualDuration += (new Date(appointment.data_fim).getTime() - new Date(appointment.data_inicio).getTime()) / (1000 * 60 * 60);
          }
        }
      }

      // Custo real calculado proporcionalmente
      const actualCost = actualDuration > 0 ? (actualDuration / 8) * estimatedCost : estimatedCost; // Assumindo 8 horas padrão

      // Variância
      const variance = actualCost - estimatedCost;
      const variancePercentage = estimatedCost > 0 ? (variance / estimatedCost) * 100 : 0;

      // Distribuir custos (simulado)
      const materialCost = costResult.data.materialCost;
      const laborCost = costResult.data.laborCost * (actualDuration > 0 ? actualDuration / 8 : 1);
      const equipmentCost = costResult.data.equipmentCost * (actualDuration > 0 ? actualDuration / 8 : 1);
      const overheadCost = costResult.data.overheadCost;

      return {
        success: true,
        data: {
          productionOrderId,
          orderNumber: order.numero,
          productId: order.produto,
          productName: product?.name || '',
          quantity: order.quantidade,
          estimatedCost,
          actualCost,
          variance,
          variancePercentage,
          materialCost,
          laborCost,
          equipmentCost,
          overheadCost,
          startTime: order.data_inicio,
          endTime: order.data_previsao,
          duration: actualDuration,
        }
      };
    } catch (error) {
      console.error('Erro ao calcular custo de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Registra custo de mão de obra
   */
  async registerLaborCost(input: Omit<LaborCost, 'totalCost'>): Promise<ServiceResult<LaborCost>> {
    try {
      const totalCost = input.hourlyRate * input.hoursWorked;

      const { data, error } = await supabase
        .schema('industrial').from('custos_mao_obra')
        .insert({
          ...input,
          custo_total: totalCost,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          employeeId: data.funcionario_id,
          employeeName: data.nome_funcionario,
          hourlyRate: data.taxa_hora,
          hoursWorked: data.horas_trabalhadas,
          totalCost: data.custo_total,
          date: data.data,
          taskId: data.tarefa_id,
          taskType: data.tipo_tarefa,
        }
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
  async registerEquipmentCost(input: Omit<EquipmentCost, 'totalCost'>): Promise<ServiceResult<EquipmentCost>> {
    try {
      const totalCost = input.hourlyRate * input.hoursUsed;

      const { data, error } = await supabase
        .schema('industrial').from('custos_equipamentos')
        .insert({
          ...input,
          custo_total: totalCost,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          equipmentId: data.equipamento_id,
          equipmentName: data.nome_equipamento,
          hourlyRate: data.taxa_hora,
          hoursUsed: data.horas_utilizadas,
          totalCost: data.custo_total,
          date: data.data,
          productionOrderId: data.op_id,
        }
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
   * Lista custos de mão de obra
   */
  async listLaborCosts(options?: { employeeId?: string; date?: string; taskId?: string }): Promise<ServiceResult<LaborCost[]>> {
    try {
      let query = supabase
        .schema('industrial').from('custos_mao_obra')
        .select();

      if (options?.employeeId) {
        query = query.eq('funcionario_id', options.employeeId);
      }

      if (options?.date) {
        query = query.eq('data', options.date);
      }

      if (options?.taskId) {
        query = query.eq('tarefa_id', options.taskId);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data.map((item: any) => ({
          id: item.id,
          employeeId: item.funcionario_id,
          employeeName: item.nome_funcionario,
          hourlyRate: item.taxa_hora,
          hoursWorked: item.horas_trabalhadas,
          totalCost: item.custo_total,
          date: item.data,
          taskId: item.tarefa_id,
          taskType: item.tipo_tarefa,
        }))
      };
    } catch (error) {
      console.error('Erro ao listar custos de mão de obra:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista custos de equipamentos
   */
  async listEquipmentCosts(options?: { equipmentId?: string; date?: string; productionOrderId?: string }): Promise<ServiceResult<EquipmentCost[]>> {
    try {
      let query = supabase
        .schema('industrial').from('custos_equipamentos')
        .select();

      if (options?.equipmentId) {
        query = query.eq('equipamento_id', options.equipmentId);
      }

      if (options?.date) {
        query = query.eq('data', options.date);
      }

      if (options?.productionOrderId) {
        query = query.eq('op_id', options.productionOrderId);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data.map((item: any) => ({
          id: item.id,
          equipmentId: item.equipamento_id,
          equipmentName: item.nome_equipamento,
          hourlyRate: item.taxa_hora,
          hoursUsed: item.horas_utilizadas,
          totalCost: item.custo_total,
          date: item.data,
          productionOrderId: item.op_id,
        }))
      };
    } catch (error) {
      console.error('Erro ao listar custos de equipamentos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula custo total de produção por período
   */
  async calculateTotalProductionCost(startDate: string, endDate: string): Promise<ServiceResult<{ totalCost: number; materialCost: number; laborCost: number; equipmentCost: number; overheadCost: number }>> {
    try {
      // Buscar OPs no período
      const { data: orders, error } = await supabase
        .schema('industrial').from('ordens_producao')
        .select('id')
        .gte('data_inicio', startDate)
        .lte('data_previsao', endDate)
        .in('status', ['finalizada', 'em_producao']);

      if (error) throw error;

      let totalCost = 0;
      let materialCost = 0;
      let laborCost = 0;
      let equipmentCost = 0;
      let overheadCost = 0;

      for (const order of orders || []) {
        const costResult = await this.calculateProductionCost(order.id);
        if (costResult.success && costResult.data) {
          const cost = costResult.data;
          totalCost += cost.actualCost;
          materialCost += cost.materialCost;
          laborCost += cost.laborCost;
          equipmentCost += cost.equipmentCost;
          overheadCost += cost.overheadCost;
        }
      }

      return {
        success: true,
        data: {
          totalCost,
          materialCost,
          laborCost,
          equipmentCost,
          overheadCost,
        }
      };
    } catch (error) {
      console.error('Erro ao calcular custo total de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Analisa variação de custos
   */
  async analyzeCostVariance(productionOrderId: string): Promise<ServiceResult<{ materialVariance: number; laborVariance: number; equipmentVariance: number; totalVariance: number }>> {
    try {
      const costResult = await this.calculateProductionCost(productionOrderId);
      if (!costResult.success) {
        return {
          success: false,
          error: costResult.error
        };
      }

      const cost = costResult.data;
      
      // Calcular variâncias (simulado)
      const materialVariance = cost.materialCost * 0.05; // 5% variação
      const laborVariance = cost.laborCost * 0.10; // 10% variação
      const equipmentVariance = cost.equipmentCost * 0.08; // 8% variação
      const totalVariance = materialVariance + laborVariance + equipmentVariance;

      return {
        success: true,
        data: {
          materialVariance,
          laborVariance,
          equipmentVariance,
          totalVariance,
        }
      };
    } catch (error) {
      console.error('Erro ao analisar variação de custos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const costService = new CostService();
