import { productService } from "./ProductService";
import { inventoryService } from "./InventoryService";
import { bomService } from "./BOMService";
import { productionOrderService } from "./ProductionOrderService";
import { qualityService } from "./QualityService";
import { materialService } from "./MaterialService";
import { supplierService } from "./SupplierService";
import { QueryType } from "./types";
import type { RouterResult, RouterContext } from "./CopilotRouter";
import { copilotObservability } from "./CopilotObservability";

export class ServiceDirectExecutor {
  async execute(query: string, context?: RouterContext): Promise<RouterResult> {
    try {
      const domain = this.extractDomain(query);
      const service = this.mapDomainToService(domain);
      
      if (this.isListingQuery(query)) {
        const result = await service.list();
        
        // Log tool call
        await copilotObservability.logEvent({
          user_id: context?.userId,
          event_type: 'tool_called',
          event_data: {
            tool_name: `${domain}.list`,
            result_count: result.data?.length || 0,
          },
        });
        
        return {
          success: true,
          strategy: QueryType.SERVICE_DIRECT,
          data: result.data,
          message: `Listando ${domain}: ${result.data?.length || 0} itens`,
          confidence: 0.85,
        };
      }
      
      if (this.isDataQuery(query)) {
        const id = this.extractId(query);
        if (!id) {
          return {
            success: false,
            strategy: QueryType.SERVICE_DIRECT,
            error: 'ID não fornecido para consulta de dados'
          };
        }
        
        const result = await service.getById(id);
        
        // Log tool call
        await copilotObservability.logEvent({
          user_id: context?.userId,
          event_type: 'tool_called',
          event_data: {
            tool_name: `${domain}.getById`,
            entity_id: id,
          },
        });
        
        return {
          success: true,
          strategy: QueryType.SERVICE_DIRECT,
          data: result.data,
          message: `Dados de ${domain} ${id}`,
          confidence: 0.85,
        };
      }
      
      if (this.isBOMQuery(query)) {
        const id = this.extractId(query);
        if (!id) {
          return {
            success: false,
            strategy: QueryType.SERVICE_DIRECT,
            error: 'ID do produto não fornecido para consulta de BOM'
          };
        }
        
        const result = await bomService.getByProduct(id);
        
        // Log tool call
        await copilotObservability.logEvent({
          user_id: context?.userId,
          event_type: 'tool_called',
          event_data: {
            tool_name: 'bom.getByProduct',
            product_id: id,
            result_count: result.data?.length || 0,
          },
        });
        
        return {
          success: true,
          strategy: QueryType.SERVICE_DIRECT,
          data: result.data,
          message: `BOM do produto ${id}: ${result.data?.length || 0} itens`,
          confidence: 0.85,
        };
      }
      
      return {
        success: false,
        strategy: QueryType.SERVICE_DIRECT,
        error: 'Query não reconhecida para Service Direct'
      };
    } catch (error) {
      console.error('Erro no ServiceDirectExecutor:', error);
      return {
        success: false,
        strategy: QueryType.SERVICE_DIRECT,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
  
  private mapDomainToService(domain: string): any {
    const serviceMap: Record<string, any> = {
      'produtos': productService,
      'estoque': inventoryService,
      'inventory': inventoryService,
      'bom': bomService,
      'ordens-producao': productionOrderService,
      'ordens de produção': productionOrderService,
      'qualidade': qualityService,
      'materias-primas': materialService,
      'materiais': materialService,
      'fornecedores': supplierService,
    };
    
    const service = serviceMap[domain];
    if (!service) {
      console.warn(`Service not found for domain: ${domain}, falling back to productService`);
    }
    
    return service || productService;
  }
  
  private extractDomain(query: string): string {
    const domainMap: Record<string, string> = {
      'produto': 'produtos',
      'produtos': 'produtos',
      'estoque': 'estoque',
      'inventory': 'inventory',
      'bom': 'bill-of-materials',
      'bill of materials': 'bill-of-materials',
      'ordem de produção': 'ordens-producao',
      'ordens de produção': 'ordens-producao',
      'ordem-producao': 'ordens-producao',
      'op': 'ordens-producao',
      'qualidade': 'qualidade',
      'matéria-prima': 'materiais',
      'materia-prima': 'materiais',
      'matérias-primas': 'materiais',
      'materias-primas': 'materiais',
      'materiais': 'materiais',
      'fornecedor': 'fornecedores',
      'fornecedores': 'fornecedores',
      'maquina': 'maquinas',
      'máquina': 'maquinas',
      'maquinas': 'maquinas',
      'máquinas': 'maquinas',
      'equipamento': 'maquinas',
      'equipamentos': 'maquinas',
      'localizacao': 'localizacoes',
      'localização': 'localizacoes',
      'localizacoes': 'localizacoes',
      'setor': 'localizacoes',
      'setores': 'localizacoes',
      'processo': 'processos',
      'processos': 'processos',
      'cronometragem': 'cronometragens',
      'cronometragens': 'cronometragens',
      'capacidade': 'capacidade',
    };
    
    const lowerQuery = query.toLowerCase();
    
    for (const [key, value] of Object.entries(domainMap)) {
      if (lowerQuery.includes(key)) {
        return value;
      }
    }
    
    return 'produtos'; // default
  }
  
  private isListingQuery(query: string): boolean {
    const patterns = [
      /listar/,
      /mostrar/,
      /todos?/,
      /buscar/,
      /exibir/,
    ];
    return patterns.some(pattern => pattern.test(query.toLowerCase()));
  }
  
  private isDataQuery(query: string): boolean {
    const patterns = [
      /dados do/,
      /informações do/,
      /detalhes do/,
      /especificações/,
    ];
    return patterns.some(pattern => pattern.test(query.toLowerCase()));
  }
  
  private isBOMQuery(query: string): boolean {
    const patterns = [
      /bom do/,
      /bill of materials/,
      /estrutura do produto/,
      /componentes do/,
    ];
    return patterns.some(pattern => pattern.test(query.toLowerCase()));
  }
  
  private extractId(query: string): string {
    // Tenta extrair ID no formato UUID
    const uuidMatch = query.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (uuidMatch) return uuidMatch[0];
    
    // Tenta extrair ID no formato OP-001, P-001, etc.
    const codeMatch = query.match(/[A-Z]{2,}-\d{3,}/);
    if (codeMatch) return codeMatch[0];
    
    return '';
  }
}

export const serviceDirectExecutor = new ServiceDirectExecutor();
