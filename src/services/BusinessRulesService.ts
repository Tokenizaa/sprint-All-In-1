import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";
import { bomService } from "./BOMService";
import { inventoryService } from "./InventoryService";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class BusinessRulesService {
  /**
   * Valida uma ordem de produção antes de liberar
   */
  async validateProductionOrder(orderId: string): Promise<ServiceResult<ValidationResult>> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Buscar ordem de produção
      const { data: order, error: orderError } = await supabase
        .schema('industrial').from('ordens_producao')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return {
          success: false,
          error: 'Ordem de produção não encontrada'
        };
      }

      // Validar BOM
      const bomResult = await bomService.getByProduct(order.product_id);
      if (!bomResult.success || bomResult.data.length === 0) {
        errors.push('Produto não possui BOM definida');
      } else {
        // Validar completude da BOM
        const bomComplete = await bomService.isComplete(order.product_id);
        if (!bomComplete.success || !bomComplete.data.complete) {
          warnings.push(...bomComplete.data.missingItems);
        }
      }

      // Validar disponibilidade de materiais
      const canProduceResult = await this.checkMaterialAvailability(order.product_id, order.quantity);
      if (!canProduceResult.success) {
        errors.push('Erro ao verificar disponibilidade de materiais');
      } else if (!canProduceResult.data.canProduce) {
        errors.push(...canProduceResult.data.reasons);
      }

      // Validar capacidade
      const capacityResult = await this.checkCapacity(order.product_id, order.quantity, order.start_date, order.due_date);
      if (!capacityResult.success) {
        warnings.push('Não foi possível verificar capacidade produtiva');
      } else if (!capacityResult.data.hasCapacity) {
        warnings.push(...capacityResult.data.reasons);
      }

      return {
        success: true,
        data: {
          valid: errors.length === 0,
          errors,
          warnings
        }
      };
    } catch (error) {
      console.error('Erro ao validar ordem de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verifica disponibilidade de materiais para produção
   */
  async checkMaterialAvailability(productId: string, quantity: number): Promise<ServiceResult<{ canProduce: boolean; reasons: string[] }>> {
    try {
      const reasons: string[] = [];

      // Buscar BOM do produto
      const bomResult = await bomService.getByProduct(productId);
      if (!bomResult.success) {
        return {
          success: false,
          error: bomResult.error
        };
      }

      if (bomResult.data.length === 0) {
        reasons.push('Produto não possui BOM definida');
        return {
          success: true,
          data: { canProduce: false, reasons }
        };
      }

      // Verificar disponibilidade de cada material
      for (const bomItem of bomResult.data) {
        const requiredQuantity = bomItem.quantidade * quantity;

        if (bomItem.componente_id) {
          const { data: stock } = await supabase
            .schema('industrial').from('estoque_industrial')
            .select('quantity, min_quantity')
            .eq('component_id', bomItem.componente_id)
            .single();

          const currentQty = stock ? (stock as any).quantity || 0 : 0;
          const minQty = stock ? (stock as any).min_quantity || 0 : 0;
          const availableQuantity = Math.max(0, currentQty - minQty);
          if (availableQuantity < requiredQuantity) {
            reasons.push(`Componente insuficiente: necessita ${requiredQuantity}, disponível ${availableQuantity}`);
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
      console.error('Erro ao verificar disponibilidade de materiais:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verifica capacidade produtiva
   */
  async checkCapacity(productId: string, quantity: number, startDate?: string, dueDate?: string): Promise<ServiceResult<{ hasCapacity: boolean; reasons: string[] }>> {
    try {
      const reasons: string[] = [];

      // Buscar processos do produto
      const { data: processes } = await supabase
        .schema('industrial').from('processos')
        .select('tempo_padrao, equipamento_id')
        .eq('produto_id', productId);

      if (!processes || processes.length === 0) {
        reasons.push('Produto não possui processos definidos');
        return {
          success: true,
          data: { hasCapacity: false, reasons }
        };
      }

      // Calcular tempo total de produção
      const totalTime = processes.reduce((sum, process) => {
        return sum + (process.tempo_padrao || 0) * quantity;
      }, 0);

      // Converter para horas
      const totalHours = totalTime / 60;

      // Verificar se há tempo suficiente
      if (startDate && dueDate) {
        const availableTime = (new Date(dueDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60);
        if (totalHours > availableTime) {
          reasons.push(`Tempo insuficiente: necessita ${totalHours.toFixed(2)}h, disponível ${availableTime.toFixed(2)}h`);
        }
      }

      // Verificar disponibilidade de equipamentos
      const equipmentIds = [...new Set(processes.map(p => p.equipamento_id).filter(Boolean))];
      for (const equipmentId of equipmentIds) {
        const { data: equipment } = await supabase
          .schema('industrial').from('equipamentos')
          .select('nome, disponibilidade')
          .eq('id', equipmentId)
          .single();

        if (equipment && equipment.disponibilidade !== 'disponivel') {
          reasons.push(`Equipamento ${equipment.nome} não está disponível`);
        }
      }

      return {
        success: true,
        data: {
          hasCapacity: reasons.length === 0,
          reasons
        }
      };
    } catch (error) {
      console.error('Erro ao verificar capacidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula o consumo de materiais baseado na BOM
   */
  async calculateMaterialConsumption(productId: string, quantity: number): Promise<ServiceResult<Array<{ materialId?: string; componentId?: string; quantity: number }>>> {
    try {
      const bomResult = await bomService.getByProduct(productId);
      if (!bomResult.success) {
        return {
          success: false,
          error: bomResult.error
        };
      }

      const consumption = bomResult.data.map(item => ({
        componentId: item.componente_id,
        quantity: item.quantidade * quantity,
      }));

      return {
        success: true,
        data: consumption
      };
    } catch (error) {
      console.error('Erro ao calcular consumo de materiais:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza automaticamente o estoque após consumo
   */
  async updateStockAfterConsumption(productId: string, quantity: number, referenceId: string): Promise<ServiceResult<void>> {
    try {
      const consumptionResult = await this.calculateMaterialConsumption(productId, quantity);
      if (!consumptionResult.success) {
        return {
          success: false,
          error: consumptionResult.error
        };
      }

      for (const item of consumptionResult.data) {
        if (item.materialId) {
          const inventoryResult = await inventoryService.list({ material_id: item.materialId });
          if (inventoryResult.success && inventoryResult.data.length > 0) {
            await inventoryService.registerMovement({
              inventory_id: inventoryResult.data[0].id,
              type: 'consumption',
              quantity: item.quantity,
              reason: 'Consumo na produção',
              reference_id: referenceId,
            });
          }
        }

        if (item.componentId) {
          const inventoryResult = await inventoryService.list({ component_id: item.componentId });
          if (inventoryResult.success && inventoryResult.data.length > 0) {
            await inventoryService.registerMovement({
              inventory_id: inventoryResult.data[0].id,
              type: 'consumption',
              quantity: item.quantity,
              reason: 'Consumo na produção',
              reference_id: referenceId,
            });
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar estoque após consumo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula a eficiência de produção
   */
  async calculateProductionEfficiency(orderId: string): Promise<ServiceResult<{ efficiency: number; targetEfficiency: number; variance: number }>> {
    try {
      // Buscar apontamentos da ordem
      const { data: appointments, error } = await supabase
        .schema('industrial').from('apontamentos')
        .select('eficiencia, quantidade_produzida, tempo_producao')
        .eq('op_id', orderId);

      if (error) throw error;

      if (!appointments || appointments.length === 0) {
        return {
          success: true,
          data: { efficiency: 0, targetEfficiency: 85, variance: -85 }
        };
      }

      // Calcular eficiência média ponderada
      let totalEfficiency = 0;
      let totalWeight = 0;

      for (const appt of appointments) {
        const weight = appt.tempo_producao || 1;
        const eff = appt.eficiencia || 0;
        totalEfficiency += eff * weight;
        totalWeight += weight;
      }

      const averageEfficiency = totalWeight > 0 ? totalEfficiency / totalWeight : 0;
      const targetEfficiency = 85; // Meta de 85%
      const variance = averageEfficiency - targetEfficiency;

      return {
        success: true,
        data: {
          efficiency: averageEfficiency,
          targetEfficiency,
          variance
        }
      };
    } catch (error) {
      console.error('Erro ao calcular eficiência de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Valida se um produto pode ser excluído
   */
  async canDeleteProduct(productId: string): Promise<ServiceResult<{ canDelete: boolean; reasons: string[] }>> {
    try {
      const reasons: string[] = [];

      // Verificar se há BOM associada
      const { data: bom } = await supabase
        .schema('industrial').from('bom')
        .select('id')
        .eq('produto_id', productId)
        .limit(1);

      if (bom && bom.length > 0) {
        reasons.push('Produto possui BOM associada');
      }

      // Verificar se há ordens de produção
      const { data: orders } = await supabase
        .schema('industrial').from('ordens_producao')
        .select('id')
        .eq('produto', productId)
        .in('status', ['rascunho', 'planejada', 'liberada', 'em_producao'])
        .limit(1);

      if (orders && orders.length > 0) {
        reasons.push('Produto possui ordens de produção em andamento');
      }

      // Verificar se há lotes
      const { data: lots } = await supabase
        .from('lotes')
        .select('id')
        .eq('product_id', productId)
        .in('status', ['in_progress', 'completed'])
        .limit(1);

      if (lots && lots.length > 0) {
        reasons.push('Produto possui lotes associados');
      }

      return {
        success: true,
        data: {
          canDelete: reasons.length === 0,
          reasons
        }
      };
    } catch (error) {
      console.error('Erro ao validar exclusão de produto:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Valida se um material pode ser excluído
   */
  async canDeleteMaterial(materialId: string): Promise<ServiceResult<{ canDelete: boolean; reasons: string[] }>> {
    try {
      const reasons: string[] = [];

      // Verificar se há BOM associada
      const { data: bom } = await supabase
        .schema('industrial').from('bom')
        .select('id')
        .eq('material_id', materialId)
        .limit(1);

      if (bom && bom.length > 0) {
        reasons.push('Material está sendo usado em BOM');
      }

      // Verificar se há estoque
      const { data: inventory } = await supabase
        .schema('industrial').from('materiais')
        .select('quantidade')
        .eq('id', materialId)
        .single();

      if (inventory && (inventory.quantidade || 0) > 0) {
        reasons.push('Material possui saldo em estoque');
      }

      return {
        success: true,
        data: {
          canDelete: reasons.length === 0,
          reasons
        }
      };
    } catch (error) {
      console.error('Erro ao validar exclusão de material:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Gera alertas de estoque baixo
   */
  async generateLowStockAlerts(): Promise<ServiceResult<Array<{ inventoryId: string; itemName: string; itemType: string; current: number; min: number; deficit: number; priority: 'low' | 'medium' | 'high' }>>> {
    try {
      const lowStockResult = await inventoryService.listLowStock();
      if (!lowStockResult.success) {
        return {
          success: false,
          error: lowStockResult.error
        };
      }

      const alerts = lowStockResult.data.map(item => {
        const minQty = item.min_quantity || 0;
        const currentQty = item.quantity || 0;
        const deficit = minQty - currentQty;
        const priority = (deficit > minQty * 0.5 ? 'high' : deficit > minQty * 0.25 ? 'medium' : 'low') as "high" | "medium" | "low";
        
        let itemType = 'desconhecido';
        let itemName = 'Item desconhecido';
        
        if (item.material_id) {
          itemType = 'material';
          itemName = (item as any).materiais?.nome || item.material_id;
        } else if (item.component_id) {
          itemType = 'componente';
          itemName = (item as any).componentes?.nome || item.component_id;
        } else if (item.product_id) {
          itemType = 'produto';
          itemName = (item as any).produtos?.modelo || item.product_id;
        }

        return {
          inventoryId: item.id,
          itemName,
          itemType,
          current: currentQty,
          min: minQty,
          deficit,
          priority,
        };
      });

      return {
        success: true,
        data: alerts
      };
    } catch (error) {
      console.error('Erro ao gerar alertas de estoque baixo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Gera alertas de lotes próximos da validade
   */
  async generateExpiryAlerts(days: number = 30): Promise<ServiceResult<Array<{ lotId: string; lotNumber: string; expiryDate: string; productName: string }>>> {
    try {
      const { data: lots, error } = await supabase
        .schema('industrial').from('lotes')
        .select(`
          id,
          codigo,
          data_validade,
          produtos:produto_id (modelo)
        `)
        .lte('data_validade', new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString())
        .gt('data_validade', new Date().toISOString())
        .eq('status', 'concluido');

      if (error) throw error;

      const alerts = (lots || []).map(lot => ({
        lotId: lot.id,
        lotNumber: lot.codigo,
        expiryDate: lot.data_validade,
        productName: lot.produtos?.modelo || 'Produto desconhecido',
      }));

      return {
        success: true,
        data: alerts
      };
    } catch (error) {
      console.error('Erro ao gerar alertas de validade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const businessRulesService = new BusinessRulesService();
