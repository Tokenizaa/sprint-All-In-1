// Testes simples para o ToolRegistry
// Este arquivo pode ser executado para validar o funcionamento do ToolRegistry

import { toolRegistry } from '../ToolRegistry';

async function testToolRegistry() {
  console.log('=== Testando ToolRegistry ===\n');

  // Teste 1: Verificar se ferramentas foram registradas
  console.log('--- Teste 1: Contagem de ferramentas ---');
  const allTools = toolRegistry.getAllTools();
  console.log(`Total de ferramentas registradas: ${allTools.length}`);
  console.log(`Esperado: 39 (3 produtos + 3 matérias-primas + 3 BOM + 3 PCP + 3 MRP + 3 produção + 3 qualidade + 3 fornecedores + 3 estoque + 3 lotes + 3 custos + 3 financeiro)`);
  console.log(`Match: ${allTools.length === 39 ? '✅' : '❌'}`);
  console.log();

  // Teste 2: Verificar ferramentas por domínio
  console.log('--- Teste 2: Ferramentas por domínio ---');
  const domains = ['produtos', 'materias-primas', 'bom', 'pcp', 'mrp', 'producao', 'qualidade', 'fornecedores', 'estoque', 'lotes', 'custos', 'financeiro'];
  
  for (const domain of domains) {
    const domainTools = toolRegistry.getToolsByDomain(domain);
    console.log(`${domain}: ${domainTools.length} ferramentas (esperado: 3) - ${domainTools.length === 3 ? '✅' : '❌'}`);
  }
  console.log();

  // Teste 3: Verificar ferramentas específicas
  console.log('--- Teste 3: Ferramentas específicas ---');
  const expectedTools = [
    'get_products',
    'get_materials',
    'get_bom',
    'get_production_plans',
    'calculate_material_requirements',
    'get_production_orders',
    'get_quality_records',
    'get_suppliers',
    'get_inventory',
    'get_lots',
    'calculate_product_cost',
    'calculate_financial_metrics'
  ];

  for (const toolName of expectedTools) {
    const tool = toolRegistry.getTool(toolName);
    console.log(`${toolName}: ${tool ? '✅' : '❌'}`);
  }
  console.log();

  // Teste 4: Verificar estrutura das ferramentas
  console.log('--- Teste 4: Estrutura das ferramentas ---');
  const sampleTool = toolRegistry.getTool('get_products');
  if (sampleTool) {
    console.log(`Nome: ${sampleTool.name}`);
    console.log(`Descrição: ${sampleTool.description}`);
    console.log(`Domínio: ${sampleTool.domain}`);
    console.log(`Parâmetros: ${JSON.stringify(sampleTool.parameters, null, 2)}`);
    console.log(`Executor: ${typeof sampleTool.executor === 'function' ? '✅' : '❌'}`);
  } else {
    console.log('❌ Ferramenta get_products não encontrada');
  }
  console.log();

  console.log('=== Testes concluídos ===');
}

// Executar testes se este arquivo for executado diretamente
if (require.main === module) {
  testToolRegistry().catch(console.error);
}

export { testToolRegistry };
