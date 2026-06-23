import { productionOrderService, type ProductionOrder, type CreateProductionOrderInput } from "./ProductionOrderService";
import { inventoryService } from "./InventoryService";
import { lotService } from "./LotService";
import { appointmentService } from "./AppointmentService";
import { businessRulesService } from "./BusinessRulesService";
import { bomService } from "./BOMService";
import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";

export interface CreateProductionWorkflowInput {
  product_id: string;
  quantity: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  due_date?: string;
  notes?: string;
  auto_release?: boolean;
  auto_lot?: boolean;
}

export interface WorkflowStep {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message?: string;
  timestamp?: string;
}

export interface WorkflowResult {
  success: boolean;
  order?: ProductionOrder;
  lot?: any;
  steps: WorkflowStep[];
  errors: string[];
}

export class ProductionWorkflowService {
  /**
   * Cria e executa o fluxo completo de produção
   */
  async executeProductionWorkflow(input: CreateProductionWorkflowInput): Promise<ServiceResult<WorkflowResult>> {
    const steps: WorkflowStep[] = [];
    const errors: string[] = [];

    try {
      // Step 1: Validar produto e BOM
      steps.push({ step: 'validate_product', status: 'in_progress', timestamp: new Date().toISOString() });
      const validationResult = await this.validateProduct(input.product_id);
      if (!validationResult.success) {
        steps.push({ step: 'validate_product', status: 'failed', message: validationResult.error, timestamp: new Date().toISOString() });
        return {
          success: false,
          data: { success: false, steps, errors: [validationResult.error || 'Erro ao validar produto'] }
        };
      }
      steps.push({ step: 'validate_product', status: 'completed', timestamp: new Date().toISOString() });

      // Step 2: Criar ordem de produção
      steps.push({ step: 'create_order', status: 'in_progress', timestamp: new Date().toISOString() });
      const priorityMap: Record<string, 'normal' | 'alta' | 'baixa' | 'urgente'> = {
        low: 'baixa',
        medium: 'normal',
        high: 'alta',
        urgent: 'urgente'
      };
      const orderInput: CreateProductionOrderInput = {
        product_id: input.product_id,
        quantity: input.quantity,
        priority: input.priority ? priorityMap[input.priority] : 'normal',
        start_date: input.start_date,
        due_date: input.due_date,
        notes: input.notes,
      };
      const orderResult = await productionOrderService.create(orderInput);
      if (!orderResult.success) {
        steps.push({ step: 'create_order', status: 'failed', message: orderResult.error, timestamp: new Date().toISOString() });
        return {
          success: false,
          data: { success: false, steps, errors: [orderResult.error || 'Erro ao criar ordem de produção'] }
        };
      }
      const order = orderResult.data!;
      steps.push({ step: 'create_order', status: 'completed', message: `OP ${order.order_number} criada`, timestamp: new Date().toISOString() });

      // Step 3: Validar ordem de produção
      steps.push({ step: 'validate_order', status: 'in_progress', timestamp: new Date().toISOString() });
      const orderValidation = await productionOrderService.validate(order.id);
      if (!orderValidation.success || !orderValidation.data.valid) {
        steps.push({ step: 'validate_order', status: 'failed', message: orderValidation.data.issues.join(', '), timestamp: new Date().toISOString() });
        return {
          success: false,
          data: { success: false, order, steps, errors: orderValidation.data.issues }
        };
      }
      steps.push({ step: 'validate_order', status: 'completed', timestamp: new Date().toISOString() });

      // Step 4: Liberar OP (se auto_release)
      if (input.auto_release) {
        steps.push({ step: 'release_order', status: 'in_progress', timestamp: new Date().toISOString() });
        const releaseResult = await productionOrderService.release(order.id);
        if (!releaseResult.success) {
          steps.push({ step: 'release_order', status: 'failed', message: releaseResult.error, timestamp: new Date().toISOString() });
          errors.push(releaseResult.error || 'Erro ao liberar OP');
        } else {
          steps.push({ step: 'release_order', status: 'completed', timestamp: new Date().toISOString() });
        }
      }

      // Step 5: Gerar lote (se auto_lot)
      let lot: any = null;
      if (input.auto_lot) {
        steps.push({ step: 'create_lot', status: 'in_progress', timestamp: new Date().toISOString() });
        const lotResult = await this.createLotForOrder(order);
        if (!lotResult.success) {
          steps.push({ step: 'create_lot', status: 'failed', message: lotResult.error, timestamp: new Date().toISOString() });
          errors.push(lotResult.error || 'Erro ao criar lote');
        } else {
          lot = lotResult.data;
          steps.push({ step: 'create_lot', status: 'completed', message: `Lote ${lot.lot_number} criado`, timestamp: new Date().toISOString() });
        }
      }

      return {
        success: errors.length === 0,
        data: {
          success: errors.length === 0,
          order,
          lot,
          steps,
          errors
        }
      };
    } catch (error) {
      console.error('Erro no fluxo de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Valida produto e BOM antes de criar OP
   */
  private async validateProduct(productId: string): Promise<ServiceResult<void>> {
    try {
      // Verificar se BOM existe
      const bomResult = await bomService.getByProduct(productId);
      if (!bomResult.success || bomResult.data.length === 0) {
        return {
          success: false,
          error: 'Produto não possui BOM definida'
        };
      }

      // Verificar se BOM está completa
      const bomComplete = await bomService.isComplete(productId);
      if (!bomComplete.success || !bomComplete.data.complete) {
        return {
          success: false,
          error: `BOM incompleta: ${bomComplete.data.missingItems.join(', ')}`
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao validar produto:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria lote para uma ordem de produção
   */
  private async createLotForOrder(order: ProductionOrder): Promise<ServiceResult<any>> {
    try {
      const lotNumber = await lotService.generateLotNumber(order.product_id);
      
      const lotResult = await lotService.create({
        lot_number: lotNumber,
        production_order_id: order.id,
        product_id: order.product_id,
        quantity: order.quantity,
        production_date: new Date().toISOString(),
      });

      return lotResult;
    } catch (error) {
      console.error('Erro ao criar lote:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Inicia produção de uma OP
   */
  async startProduction(orderId: string, equipmentId?: string, employeeId?: string): Promise<ServiceResult<any>> {
    try {
      const steps: WorkflowStep[] = [];
      const errors: string[] = [];

      // Step 1: Iniciar OP
      steps.push({ step: 'start_order', status: 'in_progress', timestamp: new Date().toISOString() });
      const startResult = await productionOrderService.start(orderId);
      if (!startResult.success) {
        steps.push({ step: 'start_order', status: 'failed', message: startResult.error, timestamp: new Date().toISOString() });
        return {
          success: false,
          error: startResult.error
        };
      }
      steps.push({ step: 'start_order', status: 'completed', timestamp: new Date().toISOString() });

      // Step 2: Criar apontamento inicial
      if (equipmentId || employeeId) {
        steps.push({ step: 'create_appointment', status: 'in_progress', timestamp: new Date().toISOString() });
        const apptResult = await appointmentService.create({
          production_order_id: orderId,
          equipment_id: equipmentId,
          employee_id: employeeId,
          start_time: new Date().toISOString(),
        });
        if (!apptResult.success) {
          steps.push({ step: 'create_appointment', status: 'failed', message: apptResult.error, timestamp: new Date().toISOString() });
          errors.push(apptResult.error || 'Erro ao criar apontamento');
        } else {
          steps.push({ step: 'create_appointment', status: 'completed', timestamp: new Date().toISOString() });
        }
      }

      return {
        success: errors.length === 0,
        data: { success: errors.length === 0, steps, errors }
      };
    } catch (error) {
      console.error('Erro ao iniciar produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Finaliza produção de uma OP
   */
  async completeProduction(orderId: string, finalQuantity: number, qualityChecks?: any): Promise<ServiceResult<any>> {
    try {
      const steps: WorkflowStep[] = [];
      const errors: string[] = [];

      // Step 1: Parar apontamentos ativos
      steps.push({ step: 'stop_appointments', status: 'in_progress', timestamp: new Date().toISOString() });
      const activeAppointments = await appointmentService.getActiveAppointments();
      for (const appt of activeAppointments.data || []) {
        if (appt.production_order_id === orderId && !appt.end_time) {
          await appointmentService.stop(appt.id, finalQuantity, 0);
        }
      }
      steps.push({ step: 'stop_appointments', status: 'completed', timestamp: new Date().toISOString() });

      // Step 2: Completar OP
      steps.push({ step: 'complete_order', status: 'in_progress', timestamp: new Date().toISOString() });
      const completeResult = await productionOrderService.complete(orderId);
      if (!completeResult.success) {
        steps.push({ step: 'complete_order', status: 'failed', message: completeResult.error, timestamp: new Date().toISOString() });
        return {
          success: false,
          error: completeResult.error
        };
      }
      steps.push({ step: 'complete_order', status: 'completed', timestamp: new Date().toISOString() });

      // Step 3: Consumir materiais
      steps.push({ step: 'consume_materials', status: 'in_progress', timestamp: new Date().toISOString() });
      const orderResult = await productionOrderService.getById(orderId);
      if (orderResult.success && orderResult.data) {
        const consumeResult = await businessRulesService.updateStockAfterConsumption(
          orderResult.data.product_id,
          finalQuantity,
          orderId
        );
        if (!consumeResult.success) {
          steps.push({ step: 'consume_materials', status: 'failed', message: consumeResult.error, timestamp: new Date().toISOString() });
          errors.push(consumeResult.error || 'Erro ao consumir materiais');
        } else {
          steps.push({ step: 'consume_materials', status: 'completed', timestamp: new Date().toISOString() });
        }
      }

      // Step 4: Completar lote (se existir)
      steps.push({ step: 'complete_lot', status: 'in_progress', timestamp: new Date().toISOString() });
      const lotResult = await lotService.list({ production_order_id: orderId });
      if (lotResult.success && lotResult.data.length > 0) {
        const lot = lotResult.data[0];
        await lotService.complete(lot.id, finalQuantity);
      }
      steps.push({ step: 'complete_lot', status: 'completed', timestamp: new Date().toISOString() });

      // Step 5: Atualizar estoque de produto
      steps.push({ step: 'update_product_stock', status: 'in_progress', timestamp: new Date().toISOString() });
      if (orderResult.success && orderResult.data) {
        const inventoryResult = await inventoryService.list({ product_id: orderResult.data.product_id });
        if (inventoryResult.success && inventoryResult.data.length > 0) {
          await inventoryService.registerMovement({
            inventory_id: inventoryResult.data[0].id,
            type: 'production',
            quantity: finalQuantity,
            reason: 'Produção finalizada',
            reference_id: orderId,
          });
        }
      }
      steps.push({ step: 'update_product_stock', status: 'completed', timestamp: new Date().toISOString() });

      return {
        success: errors.length === 0,
        data: { steps, errors }
      };
    } catch (error) {
      console.error('Erro ao completar produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca o status atual do fluxo de produção de uma OP
   */
  async getWorkflowStatus(orderId: string): Promise<ServiceResult<any>> {
    try {
      const orderResult = await productionOrderService.getById(orderId);
      if (!orderResult.success) {
        return {
          success: false,
          error: orderResult.error
        };
      }

      const order = orderResult.data;
      const progressResult = await productionOrderService.getProgress(orderId);
      const lotResult = await lotService.list({ production_order_id: orderId });
      const appointmentsResult = await appointmentService.list({ production_order_id: orderId });

      return {
        success: true,
        data: {
          order,
          progress: progressResult.data,
          lot: lotResult.data?.[0] || null,
          appointments: appointmentsResult.data || [],
        }
      };
    } catch (error) {
      console.error('Erro ao buscar status do fluxo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula o tempo estimado de produção
   */
  async estimateProductionTime(productId: string, quantity: number): Promise<ServiceResult<{ totalMinutes: number; totalHours: number }>> {
    try {
      // Buscar processos do produto
      const { data: processes } = await supabase
        .from('processos')
        .select('standard_time')
        .eq('product_id', productId);

      if (!processes || processes.length === 0) {
        return {
          success: true,
          data: { totalMinutes: 0, totalHours: 0 }
        };
      }

      const totalTime = processes.reduce((sum, process) => {
        return sum + (process.standard_time || 0) * quantity;
      }, 0);

      return {
        success: true,
        data: {
          totalMinutes: totalTime,
          totalHours: totalTime / 60
        }
      };
    } catch (error) {
      console.error('Erro ao estimar tempo de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const productionWorkflowService = new ProductionWorkflowService();
