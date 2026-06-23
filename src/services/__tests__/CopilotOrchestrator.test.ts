// Testes simples para o Copilot Orchestrator
// Este arquivo pode ser executado para validar o funcionamento do Copilot Orchestrator

import { copilotOrchestrator } from '../CopilotOrchestrator';
import { conversationManager } from '../ConversationManager';
import { responseBuilder } from '../ResponseBuilder';

async function testCopilotOrchestrator() {
  console.log('=== Testando Copilot Orchestrator ===\n');

  // Teste 1: Processar requisição simples
  console.log('--- Teste 1: Processar requisição simples ---');
  try {
    const request = {
      message: 'Quantas ordens de produção existem?',
      includeInsights: false,
      includeAlerts: false
    };
    
    const response = await copilotOrchestrator.processRequest(request);
    
    console.log('Resposta processada com sucesso:');
    console.log(`  - Mensagem: ${response.message.substring(0, 100)}...`);
    console.log(`  - Tipo de query: ${response.routing.queryType}`);
    console.log(`  - Estratégia: ${response.routing.strategy}`);
    console.log(`  - Tempo de execução: ${response.routing.executionTime}ms`);
    console.log(`  - ID da conversação: ${response.metadata.conversationId}`);
    console.log('✅ Requisição processada\n');
  } catch (error) {
    console.log('❌ Erro ao processar requisição:', error);
    console.log();
  }

  // Teste 2: Processar requisição com insights
  console.log('--- Teste 2: Processar requisição com insights ---');
  try {
    const request = {
      message: 'Como está a produção hoje?',
      includeInsights: true,
      includeAlerts: false
    };
    
    const response = await copilotOrchestrator.processRequest(request);
    
    console.log('Resposta processada com insights:');
    console.log(`  - Mensagem: ${response.message.substring(0, 100)}...`);
    console.log(`  - Insights incluídos: ${response.insights ? response.insights.length : 0}`);
    console.log(`  - Tipo de query: ${response.routing.queryType}`);
    console.log(`  - Estratégia: ${response.routing.strategy}`);
    console.log('✅ Requisição com insights processada\n');
  } catch (error) {
    console.log('❌ Erro ao processar requisição com insights:', error);
    console.log();
  }

  // Teste 3: Processar requisição com alertas
  console.log('--- Teste 3: Processar requisição com alertas ---');
  try {
    const request = {
      message: 'Quais são os problemas atuais?',
      includeInsights: false,
      includeAlerts: true
    };
    
    const response = await copilotOrchestrator.processRequest(request);
    
    console.log('Resposta processada com alertas:');
    console.log(`  - Mensagem: ${response.message.substring(0, 100)}...`);
    console.log(`  - Alertas incluídos: ${response.alerts ? response.alerts.length : 0}`);
    console.log(`  - Tipo de query: ${response.routing.queryType}`);
    console.log(`  - Estratégia: ${response.routing.strategy}`);
    console.log('✅ Requisição com alertas processada\n');
  } catch (error) {
    console.log('❌ Erro ao processar requisição com alertas:', error);
    console.log();
  }

  // Teste 4: Obter insights rápidos
  console.log('--- Teste 4: Obter insights rápidos ---');
  try {
    const quickInsights = await copilotOrchestrator.getQuickInsights();
    
    console.log('Insights rápidos obtidos:');
    console.log(`  - Insights: ${quickInsights.insights.length}`);
    console.log(`  - Alertas: ${quickInsights.alerts.length}`);
    console.log(`  - Saúde geral: ${quickInsights.overallHealth.toFixed(1)}/100`);
    console.log(`  - Timestamp: ${quickInsights.timestamp}`);
    console.log('✅ Insights rápidos obtidos\n');
  } catch (error) {
    console.log('❌ Erro ao obter insights rápidos:', error);
    console.log();
  }

  // Teste 5: Conversation Manager
  console.log('--- Teste 5: Conversation Manager ---');
  try {
    // Criar conversação
    const conversation = await conversationManager.createConversation(
      undefined,
      { currentModule: 'production' },
      'Teste de produção'
    );
    
    console.log('Conversação criada:');
    console.log(`  - ID: ${conversation.id}`);
    console.log(`  - Título: ${conversation.title}`);
    console.log(`  - Mensagens: ${conversation.messages.length}`);
    console.log(`  - Criada em: ${conversation.createdAt}`);
    console.log('✅ Conversação criada\n');
    
    // Adicionar mensagem
    const updatedConversation = await conversationManager.addMessage(
      conversation.id,
      { role: 'user', content: 'Olá!' } as any
    );
    
    console.log('Mensagem adicionada:');
    console.log(`  - Total de mensagens: ${updatedConversation?.messages.length || 0}`);
    console.log('✅ Mensagem adicionada\n');
    
    // Listar conversações
    const conversations = await conversationManager.listConversations({ limit: 5 });
    console.log(`Total de conversações listadas: ${conversations.length}`);
    console.log('✅ Conversações listadas\n');
    
    // Deletar conversação de teste
    await conversationManager.deleteConversation(conversation.id);
    console.log('✅ Conversação de teste deletada\n');
  } catch (error) {
    console.log('❌ Erro no Conversation Manager:', error);
    console.log();
  }

  // Teste 6: Response Builder
  console.log('--- Teste 6: Response Builder ---');
  try {
    const message = 'Esta é uma resposta de teste.';
    const context = {
      query: 'Test query',
      queryType: 'SQL_DIRECT',
      strategy: 'SQL Direct',
      executionTime: 150,
      toolsUsed: [],
      insights: [],
      alerts: [],
      kpis: undefined
    };
    
    const response = responseBuilder.buildResponse(message, context, {
      includeRoutingInfo: true,
      includeInsights: false,
      includeAlerts: false,
      includeKPIs: false,
      format: 'markdown',
      language: 'pt-BR'
    });
    
    console.log('Resposta construída:');
    console.log(`  - Content length: ${response.content.length}`);
    console.log(`  - Query type: ${response.metadata.queryType}`);
    console.log(`  - Strategy: ${response.metadata.strategy}`);
    console.log(`  - Execution time: ${response.metadata.executionTime}ms`);
    console.log('✅ Resposta construída\n');
  } catch (error) {
    console.log('❌ Erro no Response Builder:', error);
    console.log();
  }

  console.log('=== Testes concluídos ===');
}

// Executar testes se este arquivo for executado diretamente
if (require.main === module) {
  testCopilotOrchestrator().catch(console.error);
}

export { testCopilotOrchestrator };
