import { productService } from "./ProductService";
import { materialService } from "./MaterialService";
import { bomService } from "./BOMService";
import { pcpService } from "./PCPService";
import { mrpService } from "./MRPService";
import { productionOrderService } from "./ProductionOrderService";
import { qualityService } from "./QualityService";
import { supplierService } from "./SupplierService";
import { inventoryService } from "./InventoryService";
import { lotService } from "./LotService";
import { costService } from "./CostService";
import { financialService } from "./FinancialService";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  executor: (args: any) => Promise<any>;
  domain: string;
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  
  constructor() {
    this.registerAllTools();
  }
  
  register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }
  
  unregister(toolName: string): void {
    this.tools.delete(toolName);
  }
  
  getTool(toolName: string): ToolDefinition | undefined {
    return this.tools.get(toolName);
  }
  
  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }
  
  getToolsByDomain(domain: string): ToolDefinition[] {
    return this.getAllTools().filter(tool => tool.domain === domain);
  }
  
  async executeTool(toolName: string, args: any): Promise<any> {
    const tool = this.getTool(toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }
    
    try {
      return await tool.executor(args);
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      throw error;
    }
  }
  
  private registerAllTools(): void {
    this.registerProductTools();
    this.registerMaterialTools();
    this.registerBOMTools();
    this.registerPCPTools();
    this.registerMRPTools();
    this.registerProductionTools();
    this.registerQualityTools();
    this.registerSupplierTools();
    this.registerInventoryTools();
    this.registerLotTools();
    this.registerCostTools();
    this.registerFinancialTools();
  }
  
  private registerProductTools(): void {
    this.register({
      name: 'get_products',
      description: 'Lista produtos com filtros opcionais',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Termo de busca' },
          category: { type: 'string', description: 'Categoria do produto' },
          limit: { type: 'number', description: 'Limite de resultados' }
        }
      },
      executor: async (args) => productService.list(args),
      domain: 'produtos'
    });
    
    this.register({
      name: 'get_product_cost',
      description: 'Calcula o custo de um produto baseado na BOM',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'ID do produto' },
          quantity: { type: 'number', description: 'Quantidade para cálculo' }
        },
        required: ['productId']
      },
      executor: async (args) => productService.calculateCost(args.productId),
      domain: 'produtos'
    });
    
    this.register({
      name: 'check_production_feasibility',
      description: 'Verifica se é possível produzir um produto com materiais disponíveis',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'ID do produto' },
          quantity: { type: 'number', description: 'Quantidade desejada' }
        },
        required: ['productId', 'quantity']
      },
      executor: async (args) => productService.canProduce(args.productId, args.quantity),
      domain: 'produtos'
    });
  }
  
  private registerMaterialTools(): void {
    this.register({
      name: 'get_materials',
      description: 'Lista matérias-primas com filtros opcionais',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Termo de busca' },
          categoria: { type: 'string', description: 'Categoria da matéria-prima' },
          fornecedor: { type: 'string', description: 'Nome do fornecedor' },
          lowStock: { type: 'boolean', description: 'Apenas estoque baixo' }
        }
      },
      executor: async (args) => materialService.list(args),
      domain: 'materias-primas'
    });
    
    this.register({
      name: 'get_low_stock_materials',
      description: 'Lista matérias-primas com estoque abaixo do mínimo',
      parameters: {
        type: 'object',
        properties: {}
      },
      executor: async () => materialService.getLowStockMaterials(),
      domain: 'materias-primas'
    });
    
    this.register({
      name: 'check_material_availability',
      description: 'Verifica disponibilidade de matéria-prima',
      parameters: {
        type: 'object',
        properties: {
          materialId: { type: 'string', description: 'ID da matéria-prima' },
          requiredQuantity: { type: 'number', description: 'Quantidade necessária' }
        },
        required: ['materialId', 'requiredQuantity']
      },
      executor: async (args) => materialService.checkAvailability(args.materialId, args.requiredQuantity),
      domain: 'materias-primas'
    });
  }
  
  private registerBOMTools(): void {
    this.register({
      name: 'get_bom',
      description: 'Busca a BOM completa de um produto',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'ID do produto' }
        },
        required: ['productId']
      },
      executor: async (args) => bomService.getByProduct(args.productId),
      domain: 'bom'
    });
    
    this.register({
      name: 'calculate_bom_cost',
      description: 'Calcula o custo total da BOM de um produto',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'ID do produto' }
        },
        required: ['productId']
      },
      executor: async (args) => bomService.calculateTotalCost(args.productId),
      domain: 'bom'
    });
    
    this.register({
      name: 'check_bom_completeness',
      description: 'Verifica se a BOM de um produto está completa',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'ID do produto' }
        },
        required: ['productId']
      },
      executor: async (args) => bomService.isComplete(args.productId),
      domain: 'bom'
    });
  }
  
  private registerPCPTools(): void {
    this.register({
      name: 'get_production_plans',
      description: 'Lista planos de produção com filtros opcionais',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['draft', 'approved', 'active', 'completed', 'cancelled'] },
          startDate: { type: 'string', description: 'Data inicial (ISO)' },
          endDate: { type: 'string', description: 'Data final (ISO)' }
        }
      },
      executor: async (args) => pcpService.listPlans(args),
      domain: 'pcp'
    });
    
    this.register({
      name: 'identify_bottlenecks',
      description: 'Identifica gargalos de produção no plano',
      parameters: {
        type: 'object',
        properties: {
          planId: { type: 'string', description: 'ID do plano' }
        },
        required: ['planId']
      },
      executor: async (args) => pcpService.identifyBottlenecks(args.planId),
      domain: 'pcp'
    });
    
    this.register({
      name: 'calculate_capacity',
      description: 'Calcula a capacidade produtiva disponível',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Data inicial (ISO)' },
          endDate: { type: 'string', description: 'Data final (ISO)' },
          resourceId: { type: 'string', description: 'ID do recurso (opcional)' }
        },
        required: ['startDate', 'endDate']
      },
      executor: async (args) => pcpService.calculateCapacity(args.startDate, args.endDate),
      domain: 'pcp'
    });
  }
  
  private registerMRPTools(): void {
    this.register({
      name: 'calculate_material_requirements',
      description: 'Calcula requisitos de materiais para produção',
      parameters: {
        type: 'object',
        properties: {
          productionOrderId: { type: 'string', description: 'ID da ordem de produção' }
        },
        required: ['productionOrderId']
      },
      executor: async (args) => mrpService.calculateMaterialRequirements(args.productionOrderId),
      domain: 'mrp'
    });
    
    this.register({
      name: 'generate_purchase_orders',
      description: 'Gera pedidos de compra automaticamente',
      parameters: {
        type: 'object',
        properties: {
          productionOrderId: { type: 'string', description: 'ID da ordem de produção' }
        },
        required: ['productionOrderId']
      },
      executor: async (args) => mrpService.generatePurchaseOrders(args.productionOrderId),
      domain: 'mrp'
    });
    
    this.register({
      name: 'optimize_costs',
      description: 'Otimiza custos de materiais',
      parameters: {
        type: 'object',
        properties: {
          materialIds: { type: 'array', items: { type: 'string' }, description: 'IDs dos materiais' }
        },
        required: ['materialIds']
      },
      executor: async (args) => mrpService.optimizeCosts(args.materialIds),
      domain: 'mrp'
    });
  }
  
  private registerProductionTools(): void {
    this.register({
      name: 'get_production_orders',
      description: 'Lista ordens de produção com filtros opcionais',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'] },
          productId: { type: 'string', description: 'ID do produto' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          limit: { type: 'number', description: 'Limite de resultados' }
        }
      },
      executor: async (args) => productionOrderService.list(args),
      domain: 'producao'
    });
    
    this.register({
      name: 'get_production_order_progress',
      description: 'Obtém o progresso de uma ordem de produção',
      parameters: {
        type: 'object',
        properties: {
          orderId: { type: 'string', description: 'ID da ordem' }
        },
        required: ['orderId']
      },
      executor: async (args) => productionOrderService.getProgress(args.orderId),
      domain: 'producao'
    });
    
    this.register({
      name: 'release_production_order',
      description: 'Libera uma ordem de produção para execução',
      parameters: {
        type: 'object',
        properties: {
          orderId: { type: 'string', description: 'ID da ordem' }
        },
        required: ['orderId']
      },
      executor: async (args) => productionOrderService.release(args.orderId),
      domain: 'producao'
    });
  }
  
  private registerQualityTools(): void {
    this.register({
      name: 'get_quality_records',
      description: 'Lista registros de qualidade com filtros opcionais',
      parameters: {
        type: 'object',
        properties: {
          lotId: { type: 'string', description: 'ID do lote' },
          orderId: { type: 'string', description: 'ID da ordem de produção' },
          type: { type: 'string', description: 'Tipo de registro' },
          status: { type: 'string', description: 'Status do registro' },
          startDate: { type: 'string', description: 'Data inicial (ISO)' },
          endDate: { type: 'string', description: 'Data final (ISO)' }
        }
      },
      executor: async (args) => qualityService.list(args),
      domain: 'qualidade'
    });
    
    this.register({
      name: 'calculate_scrap_rate',
      description: 'Calcula a taxa de refugo por período',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Data inicial (ISO)' },
          endDate: { type: 'string', description: 'Data final (ISO)' },
          productId: { type: 'string', description: 'ID do produto (opcional)' }
        },
        required: ['startDate', 'endDate']
      },
      executor: async (args) => qualityService.calculateScrapRate(args.productId || ''),
      domain: 'qualidade'
    });
    
    this.register({
      name: 'list_common_defects',
      description: 'Lista os defeitos mais comuns por período',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Data inicial (ISO)' },
          endDate: { type: 'string', description: 'Data final (ISO)' },
          limit: { type: 'number', description: 'Limite de resultados' }
        },
        required: ['startDate', 'endDate']
      },
      executor: async (args) => qualityService.listCommonDefects(args.limit),
      domain: 'qualidade'
    });
  }
  
  private registerSupplierTools(): void {
    this.register({
      name: 'get_suppliers',
      description: 'Lista fornecedores com filtros opcionais',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Termo de busca' },
          categoria: { type: 'string', description: 'Categoria do fornecedor' },
          topRated: { type: 'boolean', description: 'Apenas fornecedores top rated' }
        }
      },
      executor: async (args) => supplierService.list(args),
      domain: 'fornecedores'
    });
    
    this.register({
      name: 'get_critical_suppliers',
      description: 'Lista fornecedores críticos (lead time alto ou avaliação baixa)',
      parameters: {
        type: 'object',
        properties: {}
      },
      executor: async () => supplierService.getCriticalSuppliers(),
      domain: 'fornecedores'
    });
    
    this.register({
      name: 'get_supplier_lead_time',
      description: 'Obtém o lead time médio por categoria de fornecedor',
      parameters: {
        type: 'object',
        properties: {}
      },
      executor: async () => supplierService.getAverageLeadTimeByCategory(),
      domain: 'fornecedores'
    });
  }
  
  private registerInventoryTools(): void {
    this.register({
      name: 'get_inventory',
      description: 'Lista itens de estoque com filtros opcionais',
      parameters: {
        type: 'object',
        properties: {
          materialId: { type: 'string', description: 'ID do material' },
          componentId: { type: 'string', description: 'ID do componente' },
          productId: { type: 'string', description: 'ID do produto' },
          sectorId: { type: 'string', description: 'ID do setor' },
          lowStock: { type: 'boolean', description: 'Apenas estoque baixo' }
        }
      },
      executor: async (args) => inventoryService.list(args),
      domain: 'estoque'
    });
    
    this.register({
      name: 'get_low_stock_items',
      description: 'Lista itens com estoque abaixo do mínimo',
      parameters: {
        type: 'object',
        properties: {}
      },
      executor: async () => inventoryService.listLowStock(),
      domain: 'estoque'
    });
    
    this.register({
      name: 'check_stock_availability',
      description: 'Verifica disponibilidade de estoque',
      parameters: {
        type: 'object',
        properties: {
          itemId: { type: 'string', description: 'ID do item' },
          requiredQuantity: { type: 'number', description: 'Quantidade necessária' }
        },
        required: ['itemId', 'requiredQuantity']
      },
      executor: async (args) => {
        const itemResult = await inventoryService.getById(args.itemId);
        if (!itemResult.success || !itemResult.data) {
          return { success: false, error: itemResult.error || 'Item não encontrado' };
        }
        const currentQty = (itemResult.data as any).saldo_atual || (itemResult.data as any).quantidade || 0;
        return { 
          success: true, 
          data: { 
            available: currentQty >= args.requiredQuantity, 
            current: currentQty, 
            required: args.requiredQuantity 
          } 
        };
      },
      domain: 'estoque'
    });
  }
  
  private registerLotTools(): void {
    this.register({
      name: 'get_lots',
      description: 'Lista lotes com filtros opcionais',
      parameters: {
        type: 'object',
        properties: {
          orderId: { type: 'string', description: 'ID da ordem de produção' },
          productId: { type: 'string', description: 'ID do produto' },
          status: { type: 'string', enum: ['in_progress', 'completed', 'rejected', 'quarantine'] },
          startDate: { type: 'string', description: 'Data inicial (ISO)' },
          endDate: { type: 'string', description: 'Data final (ISO)' }
        }
      },
      executor: async (args) => lotService.list(args),
      domain: 'lotes'
    });
    
    this.register({
      name: 'get_lot_traceability',
      description: 'Obtém o histórico de rastreabilidade de um lote',
      parameters: {
        type: 'object',
        properties: {
          lotId: { type: 'string', description: 'ID do lote' }
        },
        required: ['lotId']
      },
      executor: async (args) => lotService.getTraceability(args.lotId),
      domain: 'lotes'
    });
    
    this.register({
      name: 'get_expiring_lots',
      description: 'Lista lotes próximos da data de validade',
      parameters: {
        type: 'object',
        properties: {
          days: { type: 'number', description: 'Dias até validade (padrão: 30)' }
        }
      },
      executor: async (args) => lotService.listExpiringSoon(args.days || 30),
      domain: 'lotes'
    });
  }
  
  private registerCostTools(): void {
    this.register({
      name: 'calculate_product_cost',
      description: 'Calcula o custo de um produto',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'ID do produto' },
          quantity: { type: 'number', description: 'Quantidade (padrão: 1)' }
        },
        required: ['productId']
      },
      executor: async (args) => costService.calculateProductCost(args.productId, args.quantity || 1),
      domain: 'custos'
    });
    
    this.register({
      name: 'calculate_production_cost',
      description: 'Calcula o custo de uma ordem de produção em tempo real',
      parameters: {
        type: 'object',
        properties: {
          productionOrderId: { type: 'string', description: 'ID da ordem de produção' }
        },
        required: ['productionOrderId']
      },
      executor: async (args) => costService.calculateProductionCost(args.productionOrderId),
      domain: 'custos'
    });
    
    this.register({
      name: 'analyze_cost_variance',
      description: 'Analisa a variação de custos entre estimado e real',
      parameters: {
        type: 'object',
        properties: {
          productionOrderId: { type: 'string', description: 'ID da ordem de produção' }
        },
        required: ['productionOrderId']
      },
      executor: async (args) => costService.analyzeCostVariance(args.productionOrderId),
      domain: 'custos'
    });
  }
  
  private registerFinancialTools(): void {
    this.register({
      name: 'calculate_financial_metrics',
      description: 'Calcula métricas financeiras por período',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Data inicial (ISO)' },
          endDate: { type: 'string', description: 'Data final (ISO)' }
        },
        required: ['startDate', 'endDate']
      },
      executor: async (args) => financialService.calculateFinancialMetrics(args.startDate, args.endDate),
      domain: 'financeiro'
    });
    
    this.register({
      name: 'analyze_product_profitability',
      description: 'Analisa a rentabilidade por produto',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Data inicial (ISO)' },
          endDate: { type: 'string', description: 'Data final (ISO)' }
        },
        required: ['startDate', 'endDate']
      },
      executor: async (args) => financialService.analyzeProductProfitability(args.startDate, args.endDate),
      domain: 'financeiro'
    });
    
    this.register({
      name: 'calculate_production_roi',
      description: 'Calcula o ROI de uma ordem de produção',
      parameters: {
        type: 'object',
        properties: {
          productionOrderId: { type: 'string', description: 'ID da ordem de produção' }
        },
        required: ['productionOrderId']
      },
      executor: async (args) => financialService.calculateProductionROI(args.productionOrderId),
      domain: 'financeiro'
    });
  }
}

export const toolRegistry = new ToolRegistry();
