import { supabase } from "@/lib/supabase";
import { productionOrderService } from "./ProductionOrderService";
import { inventoryService } from "./InventoryService";
import { qualityService } from "./QualityService";
import { financialService } from "./FinancialService";
import { supplierService } from "./SupplierService";

export interface ProductionKPIs {
  totalOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  pendingOrders: number;
  completionRate: number;
  averageCycleTime: number;
  onTimeDeliveryRate: number;
  efficiency: number;
  utilization: number;
  bottlenecks: string[];
}

export interface InventoryKPIs {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  stockTurnover: number;
  averageDaysInStock: number;
  inventoryValue: number;
  categories: Record<string, InventoryCategoryKPIs>;
}

export interface InventoryCategoryKPIs {
  totalItems: number;
  lowStockItems: number;
  value: number;
}

export interface QualityKPIs {
  totalInspections: number;
  passRate: number;
  scrapRate: number;
  reworkRate: number;
  firstPassYield: number;
  customerReturns: number;
  commonDefects: Array<{ defect: string; count: number; percentage: number }>;
}

export interface FinancialKPIs {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
  productionCostPerUnit: number;
  materialCostPercentage: number;
  laborCostPercentage: number;
}

export interface SupplierKPIs {
  totalSuppliers: number;
  topRatedSuppliers: number;
  criticalSuppliers: number;
  averageLeadTime: number;
  leadTimeByCategory: Array<{ category: string; averageLeadTime: number }>;
}

export interface OverallKPIs {
  production: ProductionKPIs;
  inventory: InventoryKPIs;
  quality: QualityKPIs;
  financial: FinancialKPIs;
  supplier: SupplierKPIs;
  overallHealth: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export class KPICalculator {
  async calculateProductionKPIs(period: DateRange): Promise<ProductionKPIs> {
    try {
      const orders = await productionOrderService.list({});
      
      const totalOrders = orders.data?.length || 0;
      const completedOrders = orders.data?.filter(o => o.status === 'finalizada').length || 0;
      const inProgressOrders = orders.data?.filter(o => o.status === 'em_producao').length || 0;
      const pendingOrders = orders.data?.filter(o => o.status === 'planejada').length || 0;
      
      const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
      
      // Calcular outros KPIs (placeholders por enquanto)
      const averageCycleTime = 0;
      const onTimeDeliveryRate = 0;
      const efficiency = 0;
      const utilization = 0;
      const bottlenecks: string[] = [];
      
      return {
        totalOrders,
        completedOrders,
        inProgressOrders,
        pendingOrders,
        completionRate,
        averageCycleTime,
        onTimeDeliveryRate,
        efficiency,
        utilization,
        bottlenecks
      };
    } catch (error) {
      console.error('Erro ao calcular KPIs de produção:', error);
      return this.getEmptyProductionKPIs();
    }
  }
  
  async calculateInventoryKPIs(): Promise<InventoryKPIs> {
    try {
      const lowStock = await inventoryService.listLowStock();
      const allItems = await inventoryService.list();
      
      const totalItems = allItems.data?.length || 0;
      const lowStockItems = lowStock.data?.length || 0;
      const outOfStockItems = 0; // Calcular se necessário
      
      // Calcular outros KPIs (placeholders por enquanto)
      const stockTurnover = 0;
      const averageDaysInStock = 0;
      const inventoryValue = 0;
      const categories: Record<string, InventoryCategoryKPIs> = {};
      
      return {
        totalItems,
        lowStockItems,
        outOfStockItems,
        stockTurnover,
        averageDaysInStock,
        inventoryValue,
        categories
      };
    } catch (error) {
      console.error('Erro ao calcular KPIs de estoque:', error);
      return this.getEmptyInventoryKPIs();
    }
  }
  
  async calculateQualityKPIs(period: DateRange): Promise<QualityKPIs> {
    try {
      // Usar valores placeholder por enquanto até implementar os métodos reais
      const scrapRate = 0;
      const commonDefects: Array<{ defect: string; count: number; percentage: number }> = [];
      
      // Calcular outros KPIs (placeholders por enquanto)
      const totalInspections = 0;
      const passRate = 0;
      const reworkRate = 0;
      const firstPassYield = 0;
      const customerReturns = 0;
      
      return {
        totalInspections,
        passRate,
        scrapRate,
        reworkRate,
        firstPassYield,
        customerReturns,
        commonDefects
      };
    } catch (error) {
      console.error('Erro ao calcular KPIs de qualidade:', error);
      return this.getEmptyQualityKPIs();
    }
  }
  
  async calculateFinancialKPIs(period: DateRange): Promise<FinancialKPIs> {
    try {
      const metrics = await financialService.calculateFinancialMetrics(
        period.startDate,
        period.endDate
      );
      
      // Calcular KPIs (placeholders por enquanto)
      const totalRevenue = metrics.data?.totalRevenue || 0;
      const totalCost = metrics.data?.totalCost || 0;
      const grossProfit = metrics.data?.grossProfit || 0;
      const grossMargin = metrics.data?.grossMargin || 0;
      const netProfit = metrics.data?.netProfit || 0;
      const netMargin = metrics.data?.netMargin || 0;
      const productionCostPerUnit = 0;
      const materialCostPercentage = 0;
      const laborCostPercentage = 0;
      
      return {
        totalRevenue,
        totalCost,
        grossProfit,
        grossMargin,
        netProfit,
        netMargin,
        productionCostPerUnit,
        materialCostPercentage,
        laborCostPercentage
      };
    } catch (error) {
      console.error('Erro ao calcular KPIs financeiros:', error);
      return this.getEmptyFinancialKPIs();
    }
  }
  
  async calculateSupplierKPIs(): Promise<SupplierKPIs> {
    try {
      const criticalSuppliers = await supplierService.getCriticalSuppliers();
      
      const allSuppliers = await supplierService.list();
      const totalSuppliers = allSuppliers.data?.length || 0;
      const topRatedSuppliers = 0; // Calcular se necessário
      const criticalSuppliersCount = criticalSuppliers.data?.length || 0;
      const averageLeadTime = 0; // Calcular média geral
      
      // Usar placeholder por enquanto
      const leadTimeByCategory: Array<{ category: string; averageLeadTime: number }> = [];
      
      return {
        totalSuppliers,
        topRatedSuppliers,
        criticalSuppliers: criticalSuppliersCount,
        averageLeadTime,
        leadTimeByCategory
      };
    } catch (error) {
      console.error('Erro ao calcular KPIs de fornecedores:', error);
      return this.getEmptySupplierKPIs();
    }
  }
  
  async calculateOverallKPIs(): Promise<OverallKPIs> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const period = {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString()
      };
      
      const [production, inventory, quality, financial, supplier] = await Promise.all([
        this.calculateProductionKPIs(period),
        this.calculateInventoryKPIs(),
        this.calculateQualityKPIs(period),
        this.calculateFinancialKPIs(period),
        this.calculateSupplierKPIs()
      ]);
      
      const overallHealth = this.calculateOverallHealth(production, inventory, quality, financial, supplier);
      
      return {
        production,
        inventory,
        quality,
        financial,
        supplier,
        overallHealth
      };
    } catch (error) {
      console.error('Erro ao calcular KPIs gerais:', error);
      return {
        production: this.getEmptyProductionKPIs(),
        inventory: this.getEmptyInventoryKPIs(),
        quality: this.getEmptyQualityKPIs(),
        financial: this.getEmptyFinancialKPIs(),
        supplier: this.getEmptySupplierKPIs(),
        overallHealth: 0
      };
    }
  }
  
  private calculateOverallHealth(
    production: ProductionKPIs,
    inventory: InventoryKPIs,
    quality: QualityKPIs,
    financial: FinancialKPIs,
    supplier: SupplierKPIs
  ): number {
    // Calcular score de saúde geral (0-100)
    let score = 100;
    
    // Penalizar por baixa taxa de conclusão
    if (production.completionRate < 80) {
      score -= (80 - production.completionRate) * 0.5;
    }
    
    // Penalizar por alto estoque baixo
    if (inventory.lowStockItems > inventory.totalItems * 0.1) {
      score -= 10;
    }
    
    // Penalizar por alta taxa de refugo
    if (quality.scrapRate > 5) {
      score -= (quality.scrapRate - 5) * 2;
    }
    
    // Penalizar por fornecedores críticos
    if (supplier.criticalSuppliers > supplier.totalSuppliers * 0.2) {
      score -= 15;
    }
    
    // Penalizar por margem baixa
    if (financial.netMargin < 10) {
      score -= (10 - financial.netMargin) * 1;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  private getEmptyProductionKPIs(): ProductionKPIs {
    return {
      totalOrders: 0,
      completedOrders: 0,
      inProgressOrders: 0,
      pendingOrders: 0,
      completionRate: 0,
      averageCycleTime: 0,
      onTimeDeliveryRate: 0,
      efficiency: 0,
      utilization: 0,
      bottlenecks: []
    };
  }
  
  private getEmptyInventoryKPIs(): InventoryKPIs {
    return {
      totalItems: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      stockTurnover: 0,
      averageDaysInStock: 0,
      inventoryValue: 0,
      categories: {}
    };
  }
  
  private getEmptyQualityKPIs(): QualityKPIs {
    return {
      totalInspections: 0,
      passRate: 0,
      scrapRate: 0,
      reworkRate: 0,
      firstPassYield: 0,
      customerReturns: 0,
      commonDefects: []
    };
  }
  
  private getEmptyFinancialKPIs(): FinancialKPIs {
    return {
      totalRevenue: 0,
      totalCost: 0,
      grossProfit: 0,
      grossMargin: 0,
      netProfit: 0,
      netMargin: 0,
      productionCostPerUnit: 0,
      materialCostPercentage: 0,
      laborCostPercentage: 0
    };
  }
  
  private getEmptySupplierKPIs(): SupplierKPIs {
    return {
      totalSuppliers: 0,
      topRatedSuppliers: 0,
      criticalSuppliers: 0,
      averageLeadTime: 0,
      leadTimeByCategory: []
    };
  }
}

export const kpiCalculator = new KPICalculator();
