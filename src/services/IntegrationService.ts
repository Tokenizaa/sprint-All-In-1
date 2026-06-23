import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";
import { pcpService } from "./PCPService";
import { productionOrderService } from "./ProductionOrderService";
import { mrpService } from "./MRPService";

export interface IntegrationConfig {
  autoSync: boolean;
  syncInterval: number; // em minutos
  enablePCPProduction: boolean;
  enableMRPPurchases: boolean;
}

export class IntegrationService {
  private config: IntegrationConfig = {
    autoSync: true,
    syncInterval: 5,
    enablePCPProduction: true,
    enableMRPPurchases: true,
  };

  /**
   * Sincroniza PCP com produção
   */
  async syncPCPWithProduction(): Promise<ServiceResult<{ syncedOrders: number; errors: string[] }>> {
    try {
      const errors: string[] = [];
      let syncedOrders = 0;

      // Buscar planos de produção ativos
      const plansResult = await pcpService.listPlans({ status: 'active' });
      if (!plansResult.success) {
        return {
          success: false,
          error: plansResult.error
        };
      }

      for (const plan of plansResult.data) {
        // Buscar itens do plano
        const itemsResult = await pcpService.listPlanItems(plan.id);
        if (!itemsResult.success) {
          errors.push(`Erro ao buscar itens do plano ${plan.id}: ${itemsResult.error}`);
          continue;
        }

        for (const item of itemsResult.data) {
          // Atualizar status da OP baseado no item do plano
          const orderResult = await productionOrderService.getById(item.production_order_id);
          if (!orderResult.success) {
            errors.push(`Erro ao buscar OP ${item.production_order_id}: ${orderResult.error}`);
            continue;
          }

          const order = orderResult.data;

          // Se o item do plano está em progresso, liberar a OP
          if (item.status === 'in_progress' && order.status === 'planejada') {
            const releaseResult = await productionOrderService.release(item.production_order_id);
            if (!releaseResult.success) {
               errors.push(`Erro ao liberar OP ${item.production_order_id}: ${releaseResult.error}`);
            } else {
               syncedOrders++;
            }
          }

          // Se o item do plano está completo, completar a OP
          if (item.status === 'completed' && order.status !== 'finalizada') {
            const completeResult = await productionOrderService.complete(item.production_order_id);
            if (!completeResult.success) {
              errors.push(`Erro ao completar OP ${item.production_order_id}: ${completeResult.error}`);
            } else {
              syncedOrders++;
            }
          }
        }
      }

      return {
        success: true,
        data: {
          syncedOrders,
          errors,
        }
      };
    } catch (error) {
      console.error('Erro ao sincronizar PCP com produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Sincroniza MRP com compras
   */
  async syncMRPWithPurchases(): Promise<ServiceResult<{ generatedOrders: number; errors: string[] }>> {
    try {
      const errors: string[] = [];
      let generatedOrders = 0;

      // Buscar OPs liberadas
      const ordersResult = await productionOrderService.list({ status: 'liberada' });
      if (!ordersResult.success) {
        return {
          success: false,
          error: ordersResult.error
        };
      }

      const orderIds = ordersResult.data.map(order => order.id);

      // Calcular requisitos de materiais
      const requirementsResult = await mrpService.calculateMaterialRequirements(orderIds);
      if (!requirementsResult.success) {
        return {
          success: false,
          error: requirementsResult.error
        };
      }

      const requirements = requirementsResult.data;

      if (requirements.length > 0) {
        // Gerar pedidos de compra
        const purchaseOrdersResult = await mrpService.generatePurchaseOrders(requirements);
        if (!purchaseOrdersResult.success) {
          errors.push(`Erro ao gerar pedidos de compra: ${purchaseOrdersResult.error}`);
        } else {
          generatedOrders = purchaseOrdersResult.data.length;
        }
      }

      return {
        success: true,
        data: {
          generatedOrders,
          errors,
        }
      };
    } catch (error) {
      console.error('Erro ao sincronizar MRP com compras:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Sincronização completa
   */
  async fullSync(): Promise<ServiceResult<{ pcpSync: any; mrpSync: any }>> {
    try {
      const pcpSync = await this.syncPCPWithProduction();
      const mrpSync = await this.syncMRPWithPurchases();

      return {
        success: true,
        data: {
          pcpSync: pcpSync.success ? pcpSync.data : { error: pcpSync.error },
          mrpSync: mrpSync.success ? mrpSync.data : { error: mrpSync.error },
        }
      };
    } catch (error) {
      console.error('Erro ao executar sincronização completa:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Configura integração
   */
  configure(config: Partial<IntegrationConfig>): ServiceResult<IntegrationConfig> {
    try {
      this.config = { ...this.config, ...config };
      return {
        success: true,
        data: this.config
      };
    } catch (error) {
      console.error('Erro ao configurar integração:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): ServiceResult<IntegrationConfig> {
    return {
      success: true,
      data: this.config
    };
  }

  /**
   * Inicia sincronização automática
   */
  startAutoSync(): ServiceResult<void> {
    try {
      if (!this.config.autoSync) {
        return {
          success: false,
          error: 'Sincronização automática desabilitada'
        };
      }

      // Iniciar intervalo de sincronização
      setInterval(async () => {
        await this.fullSync();
      }, this.config.syncInterval * 60 * 1000);

      return { success: true };
    } catch (error) {
      console.error('Erro ao iniciar sincronização automática:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Para sincronização automática
   */
  stopAutoSync(): ServiceResult<void> {
    try {
      this.config.autoSync = false;
      return { success: true };
    } catch (error) {
      console.error('Erro ao parar sincronização automática:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verifica status da integração
   */
  async checkIntegrationStatus(): Promise<ServiceResult<{ pcpProduction: boolean; mrpPurchases: boolean; lastSync: string }>> {
    try {
      // Buscar última sincronização (simulado)
      const lastSync = new Date().toISOString();

      return {
        success: true,
        data: {
          pcpProduction: this.config.enablePCPProduction,
          mrpPurchases: this.config.enableMRPPurchases,
          lastSync,
        }
      };
    } catch (error) {
      console.error('Erro ao verificar status da integração:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Gera relatório de integração
   */
  async generateIntegrationReport(): Promise<ServiceResult<{ totalOrders: number; syncedOrders: number; purchaseOrders: number; errors: number }>> {
    try {
      // Buscar OPs
      const ordersResult = await productionOrderService.list();
      if (!ordersResult.success) {
        return {
          success: false,
          error: ordersResult.error
        };
      }

      const totalOrders = ordersResult.data.length;
      const syncedOrders = ordersResult.data.filter(order => order.status === 'liberada' || order.status === 'em_producao').length;

      // Buscar pedidos de compra
      const purchaseOrdersResult = await mrpService.listPurchaseOrders();
      if (!purchaseOrdersResult.success) {
        return {
          success: false,
          error: purchaseOrdersResult.error
        };
      }

      const purchaseOrders = purchaseOrdersResult.data.length;

      // Erros (simulado)
      const errors = 0;

      return {
        success: true,
        data: {
          totalOrders,
          syncedOrders,
          purchaseOrders,
          errors,
        }
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de integração:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const integrationService = new IntegrationService();
