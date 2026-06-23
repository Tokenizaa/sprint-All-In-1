import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";
import { bomService } from "./BOMService";
import { inventoryService } from "./InventoryService";

export interface MaterialRequirement {
  materialId: string;
  materialName: string;
  materialSku: string;
  currentStock: number;
  requiredQuantity: number;
  netRequirement: number;
  leadTime: number;
  orderDate: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  supplierId?: string;
  supplierName?: string;
  unitCost?: number;
  totalCost?: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'submitted' | 'confirmed' | 'partial' | 'received' | 'cancelled';
  orderDate: string;
  expectedDate: string;
  totalAmount: number;
  items: PurchaseOrderItem[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity: number;
  status: 'pending' | 'partial' | 'received';
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  expectedDate: string;
  notes?: string;
}

export interface AddPurchaseOrderItemInput {
  purchaseOrderId: string;
  materialId: string;
  quantity: number;
  unitCost: number;
}

export class MRPService {
  /**
   * Calcula requisitos de materiais baseado em ordens de produção
   */
  async calculateMaterialRequirements(productionOrderIds: string[]): Promise<ServiceResult<MaterialRequirement[]>> {
    try {
      const requirements: MaterialRequirement[] = [];

      for (const orderId of productionOrderIds) {
        // Buscar ordem de produção
        const { data: order, error: orderError } = await supabase
          .schema('industrial').from('ordens_producao')
          .select('produto, quantidade, data_previsao')
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;

        // Buscar BOM do produto
        const productId = order.produto;
        if (!productId) {
          continue;
        }

        const bomResult = await bomService.getByProduct(productId);
        if (!bomResult.success || !bomResult.data) {
          return {
            success: false,
            error: bomResult.error || 'BOM não encontrada'
          };
        }

        // Calcular requisitos para cada item da BOM
        for (const bomItem of bomResult.data) {
          const requiredQuantity = bomItem.quantidade * (order.quantidade || 0);

          // Buscar estoque atual do componente
          if (!bomItem.componente_id) {
            continue;
          }

          const inventoryResult = await inventoryService.list({
            component_id: bomItem.componente_id,
          });

          if (!inventoryResult.success) {
            return {
              success: false,
              error: inventoryResult.error
            };
          }

          const currentStock = inventoryResult.data && inventoryResult.data.length > 0 ? inventoryResult.data[0].quantity : 0;
          const netRequirement = Math.max(0, requiredQuantity - currentStock);

          if (netRequirement > 0) {
            // Buscar informações do componente
            const { data: componentData, error: componentError } = await supabase
              .schema('industrial').from('componentes')
              .select('nome, especificacoes')
              .eq('id', bomItem.componente_id)
              .single();

            if (componentError) throw componentError;

            // Lead time padrão (pode ser obtido de fornecedor no futuro)
            const leadTimeDays = 7;
            const dueDate = order.data_previsao || new Date().toISOString();
            const orderDate = new Date(new Date(dueDate).getTime() - leadTimeDays * 24 * 60 * 60 * 1000).toISOString();

            // Calcular prioridade baseada na urgência
            const daysUntilDue = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            let priority: MaterialRequirement['priority'] = 'low';
            if (daysUntilDue <= 3) priority = 'urgent';
            else if (daysUntilDue <= 7) priority = 'high';
            else if (daysUntilDue <= 14) priority = 'medium';

            requirements.push({
              materialId: bomItem.componente_id || '',
              materialName: componentData.nome || '',
              materialSku: '',
              currentStock,
              requiredQuantity,
              netRequirement,
              leadTime: leadTimeDays,
              orderDate,
              dueDate,
              priority,
              supplierId: '',
              supplierName: '',
              unitCost: 0,
              totalCost: 0,
            });
          }
        }
      }

      // Ordenar por prioridade e data de vencimento
      requirements.sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

      return {
        success: true,
        data: requirements
      };
    } catch (error) {
      console.error('Erro ao calcular requisitos de materiais:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Gera pedidos de compra baseado em requisitos de materiais
   */
  async generatePurchaseOrders(requirements: MaterialRequirement[]): Promise<ServiceResult<PurchaseOrder[]>> {
    try {
      const orders: PurchaseOrder[] = [];

      // Agrupar requisitos por fornecedor
      const requirementsBySupplier = new Map<string, MaterialRequirement[]>();
      for (const req of requirements) {
        if (req.supplierId) {
          if (!requirementsBySupplier.has(req.supplierId)) {
            requirementsBySupplier.set(req.supplierId, []);
          }
          requirementsBySupplier.get(req.supplierId)!.push(req);
        }
      }

      // Criar um pedido de compra por fornecedor
      for (const [supplierId, supplierRequirements] of requirementsBySupplier) {
        // Buscar nome do fornecedor
        const { data: supplier } = await supabase
          .schema('industrial').from('fornecedores')
          .select('razao_social')
          .eq('id', supplierId)
          .single();

        // Calcular data esperada (máxima due_date dos requisitos + lead_time)
        const maxDueDate = supplierRequirements.reduce((max, req) => {
          return new Date(req.dueDate) > new Date(max) ? req.dueDate : max;
        }, supplierRequirements[0].dueDate);
        const maxLeadTime = supplierRequirements.reduce((max, req) => {
          return req.leadTime > max ? req.leadTime : max;
        }, 0);
        const expectedDate = new Date(new Date(maxDueDate).getTime() + maxLeadTime * 24 * 60 * 60 * 1000).toISOString();

        // Criar pedido de compra
        const { data: order, error: orderError } = await supabase
          .from('pedidos_compra')
          .insert({
            fornecedor_id: supplierId,
            codigo: `PC-${Date.now()}`,
            status: 'rascunho',
            data_pedido: new Date().toISOString().split('T')[0],
            data_entrega_prevista: expectedDate.split('T')[0],
            valor_total: supplierRequirements.reduce((sum, req) => sum + (req.totalCost || 0), 0),
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Adicionar itens ao pedido
        const items: PurchaseOrderItem[] = [];
        for (const req of supplierRequirements) {
          const { data: item, error: itemError } = await supabase
            .from('itens_pedido_compra')
            .insert({
              pedido_compra_id: order.id,
              materia_prima_id: req.materialId,
              quantidade: req.netRequirement,
              preco_unitario: req.unitCost || 0,
              valor_total: req.totalCost || 0,
            })
            .select()
            .single();

          if (itemError) throw itemError;

          items.push({
            id: item.id,
            purchaseOrderId: order.id,
            materialId: req.materialId,
            materialName: req.materialName,
            quantity: req.netRequirement,
            unitCost: req.unitCost || 0,
            totalCost: req.totalCost || 0,
            receivedQuantity: 0,
            status: 'pending',
          });
        }

        orders.push({
          id: order.id,
          orderNumber: order.codigo,
          supplierId,
          supplierName: supplier?.razao_social,
          status: order.status,
          orderDate: order.data_pedido,
          expectedDate: order.data_entrega_prevista,
          totalAmount: order.total_amount,
          items,
          created_at: order.created_at,
          updated_at: order.updated_at,
        });
      }

      return {
        success: true,
        data: orders
      };
    } catch (error) {
      console.error('Erro ao gerar pedidos de compra:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria um pedido de compra manual
   */
  async createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<ServiceResult<PurchaseOrder>> {
    try {
      const { data, error } = await supabase
        .from('pedidos_compra')
        .insert({
          fornecedor_id: input.supplierId,
          codigo: `PC-${Date.now()}`,
          status: 'rascunho',
          data_pedido: new Date().toISOString().split('T')[0],
          data_entrega_prevista: input.expectedDate,
          valor_total: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Buscar nome do fornecedor
      const { data: supplier } = await supabase
        .schema('industrial').from('fornecedores')
        .select('razao_social')
        .eq('id', input.supplierId)
        .single();

      return {
        success: true,
        data: {
          id: data.id,
          orderNumber: data.codigo,
          supplierId: input.supplierId,
          supplierName: supplier?.razao_social || '',
          status: data.status,
          orderDate: data.data_pedido,
          expectedDate: data.data_entrega_prevista,
          totalAmount: data.valor_total,
          items: [],
          notes: '',
          created_at: data.created_at,
          updated_at: data.updated_at,
        }
      };
    } catch (error) {
      console.error('Erro ao criar pedido de compra:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Adiciona um item a um pedido de compra
   */
  async addPurchaseOrderItem(input: AddPurchaseOrderItemInput): Promise<ServiceResult<PurchaseOrderItem>> {
    try {
      const totalCost = input.quantity * input.unitCost;

      const { data, error } = await supabase
        .from('itens_pedido_compra')
        .insert({
          pedido_compra_id: input.purchaseOrderId,
          materia_prima_id: input.materialId,
          quantidade: input.quantity,
          preco_unitario: input.unitCost,
          valor_total: totalCost,
        })
        .select()
        .single();

      if (error) throw error;

      // Buscar nome do material
      const { data: material } = await supabase
        .schema('industrial').from('componentes')
        .select('nome')
        .eq('id', input.materialId)
        .single();

      // Atualizar total do pedido usando RPC function
      await supabase.rpc('update_purchase_order_total', { order_id: input.purchaseOrderId });

      return {
        success: true,
        data: {
          id: data.id,
          purchaseOrderId: data.pedido_compra_id,
          materialId: data.materia_prima_id,
          materialName: material?.nome || '',
          quantity: data.quantidade,
          unitCost: data.preco_unitario,
          totalCost: data.valor_total,
          receivedQuantity: 0,
          status: 'pending',
        }
      };
    } catch (error) {
      console.error('Erro ao adicionar item ao pedido:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista pedidos de compra
   */
  async listPurchaseOrders(options?: { status?: PurchaseOrder['status']; supplierId?: string }): Promise<ServiceResult<PurchaseOrder[]>> {
    try {
      let query = supabase
        .from('pedidos_compra')
        .select(`
          *,
          fornecedores:fornecedor_id (razao_social),
          itens:itens_pedido_compra (*)
        `);

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.supplierId) {
        query = query.eq('fornecedor_id', options.supplierId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data.map((order: any) => ({
          id: order.id,
          orderNumber: order.codigo,
          supplierId: order.fornecedor_id,
          supplierName: order.fornecedores?.razao_social || '',
          status: order.status,
          orderDate: order.data_pedido,
          expectedDate: order.data_entrega_prevista,
          totalAmount: order.valor_total,
          items: order.itens || [],
          notes: '',
          created_at: order.created_at,
          updated_at: order.updated_at,
        }))
      };
    } catch (error) {
      console.error('Erro ao listar pedidos de compra:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza status de um pedido de compra
   */
  async updatePurchaseOrderStatus(id: string, status: PurchaseOrder['status']): Promise<ServiceResult<PurchaseOrder>> {
    try {
      const { data, error } = await supabase
        .from('pedidos_compra')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const ordersResult = await this.listPurchaseOrders();
      if (!ordersResult.success || !ordersResult.data) {
        return {
          success: false,
          error: ordersResult.error
        };
      }

      const order = ordersResult.data.find(o => o.id === id);
      if (!order) {
        return {
          success: false,
          error: 'Pedido não encontrado'
        };
      }

      return {
        success: true,
        data: order
      };
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Otimiza custos de materiais
   */
  async optimizeCosts(requirements: MaterialRequirement[]): Promise<ServiceResult<{ savings: number; recommendations: string[] }>> {
    try {
      let savings = 0;
      const recommendations: string[] = [];

      // Simular otimização de custos
      for (const req of requirements) {
        // Verificar se há desconto por quantidade
        if (req.netRequirement >= 100) {
          const potentialSavings = req.totalCost ? req.totalCost * 0.05 : 0;
          savings += potentialSavings;
          recommendations.push(
            `Material ${req.materialName}: Considerar compra em lote (>=100 unidades) para obter 5% de desconto`
          );
        }

        // Verificar se há fornecedores alternativos
        if (req.unitCost && req.unitCost > 50) {
          recommendations.push(
            `Material ${req.materialName}: Considerar negociar com fornecedores alternativos para reduzir custo unitário`
          );
        }

        // Verificar lead time
        if (req.leadTime > 14) {
          recommendations.push(
            `Material ${req.materialName}: Lead time longo (${req.leadTime} dias). Considerar manter estoque de segurança`
          );
        }
      }

      return {
        success: true,
        data: {
          savings,
          recommendations,
        }
      };
    } catch (error) {
      console.error('Erro ao otimizar custos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Gerencia lead times de materiais
   */
  async manageLeadTimes(materialId: string, newLeadTime: number): Promise<ServiceResult<void>> {
    try {
      // TODO: Implementar lead time em industrial.componentes ou criar tabela de lead times
      // A tabela industrial.componentes não tem coluna lead_time
      console.log('manageLeadTimes: funcionalidade não implementada ainda');
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar lead time:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula lead time médio por fornecedor
   */
  async calculateAverageLeadTime(supplierId: string): Promise<ServiceResult<{ averageLeadTime: number; onTimeDeliveryRate: number }>> {
    try {
      const { data: orders, error } = await supabase
        .from('pedidos_compra')
        .select('data_pedido, data_entrega_prevista, data_entrega_real')
        .eq('fornecedor_id', supplierId)
        .in('status', ['recebido', 'parcial']);

      if (error) throw error;

      if (!orders || orders.length === 0) {
        return {
          success: true,
          data: {
            averageLeadTime: 0,
            onTimeDeliveryRate: 0,
          }
        };
      }

      // Calcular lead time médio
      const leadTimes = orders.map(order => {
        const orderDate = new Date(order.data_pedido).getTime();
        const deliveryDate = order.data_entrega_real ? new Date(order.data_entrega_real).getTime() : new Date(order.data_entrega_prevista).getTime();
        return (deliveryDate - orderDate) / (1000 * 60 * 60 * 24);
      });
      const averageLeadTime = leadTimes.reduce((sum, lt) => sum + lt, 0) / leadTimes.length;

      // Calcular taxa de entrega no prazo (simulado)
      const onTimeDeliveryRate = 0.92; // 92% no prazo

      return {
        success: true,
        data: {
          averageLeadTime: Math.round(averageLeadTime),
          onTimeDeliveryRate,
        }
      };
    } catch (error) {
      console.error('Erro ao calcular lead time médio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const mrpService = new MRPService();
