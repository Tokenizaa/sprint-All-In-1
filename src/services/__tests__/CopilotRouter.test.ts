// Testes simples para o CopilotRouter
// Este arquivo pode ser executado para validar o funcionamento do Router

import { copilotRouter } from '../CopilotRouter';
import { QueryType } from '../types';

async function testRouter() {
  console.log('=== Testando CopilotRouter ===\n');

  // Testes de SQL Direct
  const sqlDirectQueries = [
    'Quantos produtos cadastrados?',
    'Quantos funcionários?',
    'Número de equipamentos',
    'Status da ordem OP-001',
  ];

  console.log('--- Testes SQL Direct ---');
  for (const query of sqlDirectQueries) {
    const result = await copilotRouter.route(query);
    console.log(`Query: "${query}"`);
    console.log(`Strategy: ${result.strategy}`);
    console.log(`Expected: ${QueryType.SQL_DIRECT}`);
    console.log(`Match: ${result.strategy === QueryType.SQL_DIRECT ? '✅' : '❌'}`);
    console.log();
  }

  // Testes de Service Direct
  const serviceDirectQueries = [
    'Listar todos os produtos',
    'Mostrar fornecedores',
    'Buscar matérias-primas',
    'Dados do produto P-001',
    'BOM do produto P-001',
  ];

  console.log('--- Testes Service Direct ---');
  for (const query of serviceDirectQueries) {
    const result = await copilotRouter.route(query);
    console.log(`Query: "${query}"`);
    console.log(`Strategy: ${result.strategy}`);
    console.log(`Expected: ${QueryType.SERVICE_DIRECT}`);
    console.log(`Match: ${result.strategy === QueryType.SERVICE_DIRECT ? '✅' : '❌'}`);
    console.log();
  }

  // Testes de AI Required
  const aiRequiredQueries = [
    'Qual o gargalo de produção atual?',
    'Como melhorar a eficiência?',
    'Analisar tendências de qualidade',
    'Recomendar ações para reduzir refugo',
    'Prever estoque para próximo mês',
    'Por que a produção está atrasada?',
  ];

  console.log('--- Testes AI Required ---');
  for (const query of aiRequiredQueries) {
    const result = await copilotRouter.route(query);
    console.log(`Query: "${query}"`);
    console.log(`Strategy: ${result.strategy}`);
    console.log(`Expected: ${QueryType.AI_REQUIRED}`);
    console.log(`Match: ${result.strategy === QueryType.AI_REQUIRED ? '✅' : '❌'}`);
    console.log();
  }

  console.log('=== Testes concluídos ===');
}

// Executar testes se este arquivo for executado diretamente
if (require.main === module) {
  testRouter().catch(console.error);
}

export { testRouter };
