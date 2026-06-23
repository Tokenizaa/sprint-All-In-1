import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";
import { costService } from "./CostService";

export interface MarginAnalysis {
  productId: string;
  productName: string;
  productSku: string;
  unitCost: number;
  sellingPrice: number;
  margin: number;
  profit: number;
  marginPercentage: number;
  contributionMargin: number;
  breakEvenQuantity: number;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
  operatingExpenses: number;
  totalProductionCost: number;
  totalReworkCost: number;
  totalScrapCost: number;
  period: string;
}

export interface ProductionCostSummary {
  productionOrderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  estimatedCost: number;
  actualCost: number;
  variance: number;
  variancePercentage: number;
  unitCost: number;
  revenue: number;
  profit: number;
  margin: number;
}

export class FinancialService {
  /**
   * Calcula margem de um produto
   */
  async calculateProductMargin(productId: string): Promise<ServiceResult<MarginAnalysis>> {
    try {
      // Buscar custo do produto
      const costResult = await costService.calculateProductCost(productId, 1);
      if (!costResult.success) {
        return {
          success: false,
          error: costResult.error
        };
      }

      const cost = costResult.data;
      if (!cost) {
        return {
          success: false,
          error: 'Custo do produto não encontrado'
        };
      }

      const unitCost = cost.unitCost;
      const sellingPrice = cost.sellingPrice;
      const margin = cost.margin;
      const profit = cost.profit;

      // Calcular margem de contribuição (simulado - 80% do lucro)
      const contributionMargin = profit * 0.8;

      // Calcular ponto de equilíbrio (simulado)
      const fixedCosts = cost.totalCost * 0.3; // 30% é custo fixo
      const contributionMarginPerUnit = contributionMargin;
      const breakEvenQuantity = contributionMarginPerUnit > 0 ? Math.ceil(fixedCosts / contributionMarginPerUnit) : 0;

      return {
        success: true,
        data: {
          productId,
          productName: cost.productName,
          productSku: cost.productSku,
          unitCost,
          sellingPrice,
          margin,
          profit,
          marginPercentage: margin,
          contributionMargin,
          breakEvenQuantity,
        }
      };
    } catch (error) {
      console.error('Erro ao calcular margem do produto:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula métricas financeiras por período
   */
  async calculateFinancialMetrics(startDate: string, endDate: string): Promise<ServiceResult<FinancialMetrics>> {
    try {
      // Buscar custo total de produção no período
      const costResult = await costService.calculateTotalProductionCost(startDate, endDate);
      if (!costResult.success) {
        return {
          success: false,
          error: costResult.error
        };
      }

      const totalProductionCost = costResult.data?.totalCost || 0;

      // Buscar receita de vendas (simulado)
      const { data: sales } = await supabase
        .from('pedidos')
        .select('total_amount')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .in('status', ['delivered', 'completed']);

      const totalRevenue = sales?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;

      // Calcular custos adicionais (simulado)
      const operatingExpenses = totalProductionCost * 0.15; // 15% de despesas operacionais
      const totalReworkCost = totalProductionCost * 0.05; // 5% de retrabalho
      const totalScrapCost = totalProductionCost * 0.03; // 3% de refugo

      const totalCost = totalProductionCost + operatingExpenses + totalReworkCost + totalScrapCost;
      const grossProfit = totalRevenue - totalProductionCost;
      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
      const netProfit = totalRevenue - totalCost;
      const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      return {
        success: true,
        data: {
          totalRevenue,
          totalCost,
          grossProfit,
          grossMargin,
          netProfit,
          netMargin,
          operatingExpenses,
          totalProductionCost,
          totalReworkCost,
          totalScrapCost,
          period: `${startDate} - ${endDate}`,
        }
      };
    } catch (error) {
      console.error('Erro ao calcular métricas financeiras:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Gera resumo de custos de produção
   */
  async generateProductionCostSummary(productionOrderId: string): Promise<ServiceResult<ProductionCostSummary>> {
    try {
      // Buscar custo de produção
      const costResult = await costService.calculateProductionCost(productionOrderId);
      if (!costResult.success) {
        return {
          success: false,
          error: costResult.error
        };
      }

      const cost = costResult.data;
      if (!cost) {
        return {
          success: false,
          error: 'Custo de produção não encontrado'
        };
      }

      // Buscar preço de venda do produto
      const { data: product } = await supabase
        .from('produtos')
        .select('selling_price')
        .eq('id', cost.productId)
        .single();

      const sellingPrice = product?.selling_price || 0;
      const revenue = sellingPrice * cost.quantity;
      const unitCost = cost.actualCost / cost.quantity;
      const profit = revenue - cost.actualCost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        success: true,
        data: {
          productionOrderId: cost.productionOrderId,
          orderNumber: cost.orderNumber,
          productId: cost.productId,
          productName: cost.productName,
          quantity: cost.quantity,
          estimatedCost: cost.estimatedCost,
          actualCost: cost.actualCost,
          variance: cost.variance,
          variancePercentage: cost.variancePercentage,
          unitCost,
          revenue,
          profit,
          margin,
        }
      };
    } catch (error) {
      console.error('Erro ao gerar resumo de custos de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Analisa rentabilidade por produto
   */
  async analyzeProductProfitability(startDate: string, endDate: string): Promise<ServiceResult<Array<{
    productId: string;
    productName: string;
    totalRevenue: number;
    totalCost: number;
    profit: number;
    margin: number;
    quantitySold: number;
    rank: number;
  }>>> {
    try {
      // Buscar vendas por produto no período
      const { data: sales } = await supabase
        .from('pedidos')
        .select('product_id, total_amount, quantity')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .in('status', ['delivered', 'completed']);

      if (!sales) {
        return {
          success: true,
          data: []
        };
      }

      // Agrupar por produto
      const productSales = new Map<string, { revenue: number; quantity: number }>();
      sales.forEach(sale => {
        const productId = sale.product_id;
        if (!productSales.has(productId)) {
          productSales.set(productId, { revenue: 0, quantity: 0 });
        }
        productSales.get(productId)!.revenue += sale.total_amount || 0;
        productSales.get(productId)!.quantity += sale.quantity || 0;
      });

      // Calcular custo e lucro por produto
      const profitability = [];
      for (const [productId, salesData] of productSales) {
        const marginResult = await this.calculateProductMargin(productId);
        if (marginResult.success && marginResult.data) {
          const margin = marginResult.data;
          const totalRevenue = salesData.revenue;
          const totalCost = margin.unitCost * salesData.quantity;
          const profit = totalRevenue - totalCost;
          const marginPercent = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

          profitability.push({
            productId,
            productName: margin.productName,
            totalRevenue,
            totalCost,
            profit,
            margin: marginPercent,
            quantitySold: salesData.quantity,
            rank: 0, // Calculado depois
          });
        }
      }

      // Ordenar por lucro e atribuir rank
      profitability.sort((a, b) => b.profit - a.profit);
      profitability.forEach((item, index) => {
        item.rank = index + 1;
      });

      return {
        success: true,
        data: profitability
      };
    } catch (error) {
      console.error('Erro ao analisar rentabilidade por produto:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Analisa tendência de custos
   */
  async analyzeCostTrend(productId: string, months: number = 6): Promise<ServiceResult<Array<{
    period: string;
    unitCost: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
    changePercentage: number;
  }>>> {
    try {
      const trend = [];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        // Calcular custo médio unitário no período (simulado)
        const costResult = await costService.calculateProductCost(productId, 1);
        if (costResult.success && costResult.data) {
          const unitCost = costResult.data.unitCost;
          
          trend.push({
            period: startDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
            unitCost,
            trend: 'stable',
            change: 0,
            changePercentage: 0,
          });
        }
      }

      // Calcular tendência
      for (let i = 1; i < trend.length; i++) {
        const current = trend[i];
        const previous = trend[i - 1];
        const change = current.unitCost - previous.unitCost;
        const changePercentage = previous.unitCost > 0 ? (change / previous.unitCost) * 100 : 0;

        current.change = change;
        current.changePercentage = changePercentage;
        current.trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
      }

      return {
        success: true,
        data: trend as Array<{ period: string; unitCost: number; trend: 'up' | 'down' | 'stable'; change: number; changePercentage: number }>
      };
    } catch (error) {
      console.error('Erro ao analisar tendência de custos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula ROI de uma ordem de produção
   */
  async calculateProductionROI(productionOrderId: string): Promise<ServiceResult<{
    investment: number;
    return: number;
    roi: number;
    roiPercentage: number;
    paybackPeriod: number;
  }>> {
    try {
      // Buscar custo de produção
      const costResult = await costService.calculateProductionCost(productionOrderId);
      if (!costResult.success) {
        return {
          success: false,
          error: costResult.error
        };
      }

      const cost = costResult.data;
      if (!cost) {
        return {
          success: false,
          error: 'Custo de produção não encontrado'
        };
      }

      const investment = cost.actualCost;

      // Buscar preço de venda
      const { data: product } = await supabase
        .from('produtos')
        .select('selling_price')
        .eq('id', cost.productId)
        .single();

      const sellingPrice = product?.selling_price || 0;
      const returnAmount = sellingPrice * cost.quantity;

      const profit = returnAmount - investment;
      const roiPercentage = investment > 0 ? (profit / investment) * 100 : 0;

      // Calcular período de payback (simulado - em dias)
      const paybackPeriod = profit > 0 ? Math.ceil((investment / profit) * 30) : 0; // Assumindo 30 dias

      return {
        success: true,
        data: {
          investment,
          return: returnAmount,
          roi: profit,
          roiPercentage,
          paybackPeriod,
        }
      };
    } catch (error) {
      console.error('Erro ao calcular ROI de produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Integra custos com produção automaticamente
   */
  async syncCostsWithProduction(productionOrderId: string): Promise<ServiceResult<void>> {
    try {
      // Calcular custo de produção
      const costResult = await costService.calculateProductionCost(productionOrderId);
      if (!costResult.success) {
        return {
          success: false,
          error: costResult.error
        };
      }

      const cost = costResult.data;
      if (!cost) {
        return {
          success: false,
          error: 'Custo de produção não encontrado'
        };
      }

      // Atualizar ordem de produção com custos
      const { error } = await supabase
        .schema('industrial').from('ordens_producao')
        .update({
          custo_estimado: cost.estimatedCost,
          custo_real: cost.actualCost,
          cost_variance: cost.variance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productionOrderId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao sincronizar custos com produção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Gera relatório financeiro consolidado
   */
  async generateFinancialReport(startDate: string, endDate: string): Promise<ServiceResult<{
    metrics: FinancialMetrics;
    productProfitability: Array<any>;
    costTrends: Array<any>;
    productionCosts: Array<any>;
  }>> {
    try {
      // Calcular métricas financeiras
      const metricsResult = await this.calculateFinancialMetrics(startDate, endDate);
      if (!metricsResult.success) {
        return {
          success: false,
          error: metricsResult.error
        };
      }

      // Analisar rentabilidade por produto
      const profitabilityResult = await this.analyzeProductProfitability(startDate, endDate);
      if (!profitabilityResult.success) {
        return {
          success: false,
          error: profitabilityResult.error
        };
      }

      // Buscar custos de produção no período
      const { data: orders } = await supabase
        .schema('industrial').from('ordens_producao')
        .select('id')
        .gte('data_inicio', startDate)
        .lte('data_previsao', endDate)
        .in('status', ['finalizada', 'em_producao']);

      const productionCosts: ProductionCostSummary[] = [];
      for (const order of orders || []) {
        const summaryResult = await this.generateProductionCostSummary(order.id);
        if (summaryResult.success && summaryResult.data) {
          productionCosts.push(summaryResult.data);
        }
      }

      // Tendência de custos (simulado para o primeiro produto)
      let costTrends: Array<{ period: string; unitCost: number; trend: 'up' | 'down' | 'stable'; change: number; changePercentage: number }> = [];
      if (productionCosts.length > 0 && productionCosts[0]) {
        const trendResult = await this.analyzeCostTrend(productionCosts[0].productId, 6);
        if (trendResult.success && trendResult.data) {
          costTrends = trendResult.data;
        }
      }

      return {
        success: true,
        data: {
          metrics: metricsResult.data || {
            totalRevenue: 0,
            totalCost: 0,
            grossProfit: 0,
            grossMargin: 0,
            netProfit: 0,
            netMargin: 0,
            operatingExpenses: 0,
            totalProductionCost: 0,
            totalReworkCost: 0,
            totalScrapCost: 0,
            period: `${startDate} - ${endDate}`,
          },
          productProfitability: profitabilityResult.data || [],
          costTrends,
          productionCosts,
        }
      };
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const financialService = new FinancialService();
