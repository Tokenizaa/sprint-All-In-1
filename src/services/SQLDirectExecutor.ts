import { supabase } from "@/lib/supabase";
import { QueryType } from "./types";
import type { RouterResult, RouterContext } from "./CopilotRouter";

export class SQLDirectExecutor {
  async execute(query: string, context?: RouterContext): Promise<RouterResult> {
    try {
      // Extrair domínio da query
      const domain = this.extractDomain(query);
      
      // Executar query apropriada
      if (this.isCountQuery(query)) {
        const count = await this.executeCount(domain);
        return {
          success: true,
          strategy: QueryType.SQL_DIRECT,
          data: { count },
          message: `Total de ${domain}: ${count}`,
          confidence: 0.9,
        };
      }
      
      if (this.isStatusQuery(query)) {
        const id = this.extractId(query);
        const status = await this.executeStatus(domain, id);
        return {
          success: true,
          strategy: QueryType.SQL_DIRECT,
          data: { status },
          message: `Status de ${domain} ${id}: ${status}`,
          confidence: 0.9,
        };
      }
      
      return {
        success: false,
        strategy: QueryType.SQL_DIRECT,
        error: 'Query não reconhecida para SQL Direct'
      };
    } catch (error) {
      console.error('Erro no SQLDirectExecutor:', error);
      return {
        success: false,
        strategy: QueryType.SQL_DIRECT,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
  
  private async executeCount(domain: string): Promise<number> {
    const tableMap: Record<string, string> = {
      'produtos': 'industrial.produtos',
      'funcionarios': 'industrial.funcionarios',
      'maquinas': 'industrial.maquinas',
      'equipamentos': 'industrial.maquinas',
      'ferramentas': 'industrial.ferramentas',
      'fornecedores': 'industrial.fornecedores',
      'materiais': 'industrial.materiais',
      'materias-primas': 'industrial.materiais',
      'localizacoes': 'industrial.localizacoes',
      'setores': 'industrial.localizacoes',
      'empresas': 'industrial.empresas',
      'componentes': 'industrial.componentes',
      'bill-of-materials': 'industrial.bill_of_materials',
      'bom': 'industrial.bill_of_materials',
      'processos': 'industrial.processos',
      'cronometragens': 'industrial.cronometragens',
      'capacidade': 'industrial.capacidade',
    };
    
    const table = tableMap[domain] || domain;
    
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);
    
    if (error) throw error;
    
    return count || 0;
  }
  
  private async executeStatus(domain: string, id: string): Promise<string> {
    // Implementar lógica de status por domínio
    // Por enquanto, retorna um placeholder
    const tableMap: Record<string, string> = {
      'maquinas': 'industrial.maquinas',
      'equipamentos': 'industrial.maquinas',
      'materiais': 'industrial.materiais',
      'materias-primas': 'industrial.materiais',
      'fornecedores': 'industrial.fornecedores',
      'processos': 'industrial.processos',
      'cronometragens': 'industrial.cronometragens',
      'capacidade': 'industrial.capacidade',
    };
    
    const table = tableMap[domain] || domain;
    
    if (!id) {
      return 'ID não fornecido';
    }
    
    try {
      const { data, error } = await supabase
        .from(table)
        .select('status')
        .eq('id', id)
        .is('deleted_at', null)
        .single();
      
      if (error) throw error;
      
      return data?.status || 'desconhecido';
    } catch (error) {
      console.error('Erro ao buscar status:', error);
      return 'erro ao buscar status';
    }
  }
  
  private extractDomain(query: string): string {
    const domainMap: Record<string, string> = {
      'produto': 'produtos',
      'produtos': 'produtos',
      'funcionario': 'funcionarios',
      'funcionários': 'funcionarios',
      'maquina': 'maquinas',
      'máquina': 'maquinas',
      'maquinas': 'maquinas',
      'máquinas': 'maquinas',
      'equipamento': 'maquinas',
      'equipamentos': 'maquinas',
      'ferramenta': 'ferramentas',
      'ferramentas': 'ferramentas',
      'fornecedor': 'fornecedores',
      'fornecedores': 'fornecedores',
      'material': 'materiais',
      'materiais': 'materiais',
      'matéria-prima': 'materiais',
      'materia-prima': 'materiais',
      'matérias-primas': 'materiais',
      'materias-primas': 'materiais',
      'localizacao': 'localizacoes',
      'localização': 'localizacoes',
      'localizacoes': 'localizacoes',
      'localizações': 'localizacoes',
      'setor': 'localizacoes',
      'setores': 'localizacoes',
      'empresa': 'empresas',
      'empresas': 'empresas',
      'componente': 'componentes',
      'componentes': 'componentes',
      'bom': 'bill-of-materials',
      'bill of materials': 'bill-of-materials',
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
  
  private isCountQuery(query: string): boolean {
    const patterns = [
      /quantos?/,
      /quantidade/,
      /contar/,
      /número/,
      /total de/,
      /quantas?/,
    ];
    return patterns.some(pattern => pattern.test(query.toLowerCase()));
  }
  
  private isStatusQuery(query: string): boolean {
    const patterns = [
      /status/,
      /estado/,
      /situação/,
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

export const sqlDirectExecutor = new SQLDirectExecutor();
