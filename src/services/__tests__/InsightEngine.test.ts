// Testes simples para o Insight Engine
// Este arquivo pode ser executado para validar o funcionamento do Insight Engine

import { kpiCalculator } from '../KPICalculator';
import { insightGenerator } from '../InsightGenerator';
import { alertEngine } from '../AlertEngine';

async function testInsightEngine() {
  console.log('=== Testando Insight Engine ===\n');

  // Teste 1: Calcular KPIs
  console.log('--- Teste 1: Calcular KPIs ---');
  try {
    const kpis = await kpiCalculator.calculateOverallKPIs();
    console.log('KPIs calculados com sucesso:');
    console.log(`  - Produção: ${kpis.production.totalOrders} ordens, taxa de conclusão ${kpis.production.completionRate.toFixed(1)}%`);
    console.log(`  - Estoque: ${kpis.inventory.totalItems} itens, ${kpis.inventory.lowStockItems} com estoque baixo`);
    console.log(`  - Qualidade: taxa de refugo ${kpis.quality.scrapRate.toFixed(2)}%`);
    console.log(`  - Financeiro: margem líquida ${kpis.financial.netMargin.toFixed(1)}%`);
    console.log(`  - Fornecedores: ${kpis.supplier.totalSuppliers} fornecedores, ${kpis.supplier.criticalSuppliers} críticos`);
    console.log(`  - Saúde geral: ${kpis.overallHealth.toFixed(1)}/100`);
    console.log('✅ KPIs calculados\n');
  } catch (error) {
    console.log('❌ Erro ao calcular KPIs:', error);
    console.log();
  }

  // Teste 2: Gerar Insights
  console.log('--- Teste 2: Gerar Insights ---');
  try {
    const insights = await insightGenerator.generateInsights();
    console.log(`Total de insights gerados: ${insights.length}`);
    
    const insightsByType = {
      critical: insights.filter(i => i.type === 'critical').length,
      warning: insights.filter(i => i.type === 'warning').length,
      opportunity: insights.filter(i => i.type === 'opportunity').length,
      information: insights.filter(i => i.type === 'information').length
    };
    
    console.log(`  - Críticos: ${insightsByType.critical}`);
    console.log(`  - Avisos: ${insightsByType.warning}`);
    console.log(`  - Oportunidades: ${insightsByType.opportunity}`);
    console.log(`  - Informações: ${insightsByType.information}`);
    console.log('✅ Insights gerados\n');
    
    if (insights.length > 0) {
      console.log('Exemplo de insight:');
      const sampleInsight = insights[0];
      console.log(`  - Título: ${sampleInsight.title}`);
      console.log(`  - Tipo: ${sampleInsight.type}`);
      console.log(`  - Categoria: ${sampleInsight.category}`);
      console.log(`  - Impacto: ${sampleInsight.impact}`);
      console.log(`  - Prioridade: ${sampleInsight.priority}`);
      console.log();
    }
  } catch (error) {
    console.log('❌ Erro ao gerar insights:', error);
    console.log();
  }

  // Teste 3: Avaliar Alertas
  console.log('--- Teste 3: Avaliar Alertas ---');
  try {
    const newAlerts = await alertEngine.evaluateAlerts();
    console.log(`Novos alertas gerados: ${newAlerts.length}`);
    
    const activeAlerts = alertEngine.getActiveAlerts();
    console.log(`Total de alertas ativos: ${activeAlerts.length}`);
    
    const alertsBySeverity = {
      critical: activeAlerts.filter(a => a.severity === 'critical').length,
      high: activeAlerts.filter(a => a.severity === 'high').length,
      medium: activeAlerts.filter(a => a.severity === 'medium').length,
      low: activeAlerts.filter(a => a.severity === 'low').length
    };
    
    console.log(`  - Críticos: ${alertsBySeverity.critical}`);
    console.log(`  - Altos: ${alertsBySeverity.high}`);
    console.log(`  - Médios: ${alertsBySeverity.medium}`);
    console.log(`  - Baixos: ${alertsBySeverity.low}`);
    console.log('✅ Alertas avaliados\n');
    
    if (activeAlerts.length > 0) {
      console.log('Exemplo de alerta:');
      const sampleAlert = activeAlerts[0];
      console.log(`  - Título: ${sampleAlert.title}`);
      console.log(`  - Severidade: ${sampleAlert.severity}`);
      console.log(`  - Categoria: ${sampleAlert.category}`);
      console.log(`  - Origem: ${sampleAlert.source}`);
      console.log(`  - Reconhecido: ${sampleAlert.acknowledged}`);
      console.log();
    }
  } catch (error) {
    console.log('❌ Erro ao avaliar alertas:', error);
    console.log();
  }

  // Teste 4: Configurações
  console.log('--- Teste 4: Configurações ---');
  try {
    const insightConfig = insightGenerator.getConfig();
    console.log('Configuração do InsightGenerator:');
    console.log(`  - Production insights: ${insightConfig.enableProductionInsights}`);
    console.log(`  - Inventory insights: ${insightConfig.enableInventoryInsights}`);
    console.log(`  - Quality insights: ${insightConfig.enableQualityInsights}`);
    console.log(`  - Financial insights: ${insightConfig.enableFinancialInsights}`);
    console.log(`  - Supplier insights: ${insightConfig.enableSupplierInsights}`);
    console.log();
    
    const alertConfig = alertEngine.getConfig();
    console.log('Configuração do AlertEngine:');
    console.log(`  - Production alerts: ${alertConfig.enableProductionAlerts}`);
    console.log(`  - Inventory alerts: ${alertConfig.enableInventoryAlerts}`);
    console.log(`  - Quality alerts: ${alertConfig.enableQualityAlerts}`);
    console.log(`  - Financial alerts: ${alertConfig.enableFinancialAlerts}`);
    console.log(`  - Supplier alerts: ${alertConfig.enableSupplierAlerts}`);
    console.log(`  - Auto-resolve: ${alertConfig.autoResolveAlerts}`);
    console.log(`  - Retenção (dias): ${alertConfig.alertRetentionDays}`);
    console.log('✅ Configurações obtidas\n');
  } catch (error) {
    console.log('❌ Erro ao obter configurações:', error);
    console.log();
  }

  // Teste 5: Regras de Alerta
  console.log('--- Teste 5: Regras de Alerta ---');
  try {
    const rules = alertEngine.getRules();
    console.log(`Total de regras de alerta: ${rules.length}`);
    
    const rulesByCategory = {
      production: rules.filter(r => r.category === 'production').length,
      inventory: rules.filter(r => r.category === 'inventory').length,
      quality: rules.filter(r => r.category === 'quality').length,
      financial: rules.filter(r => r.category === 'financial').length,
      supplier: rules.filter(r => r.category === 'supplier').length
    };
    
    console.log(`  - Produção: ${rulesByCategory.production}`);
    console.log(`  - Estoque: ${rulesByCategory.inventory}`);
    console.log(`  - Qualidade: ${rulesByCategory.quality}`);
    console.log(`  - Financeiro: ${rulesByCategory.financial}`);
    console.log(`  - Fornecedores: ${rulesByCategory.supplier}`);
    console.log('✅ Regras obtidas\n');
  } catch (error) {
    console.log('❌ Erro ao obter regras:', error);
    console.log();
  }

  console.log('=== Testes concluídos ===');
}

// Executar testes se este arquivo for executado diretamente
if (require.main === module) {
  testInsightEngine().catch(console.error);
}

export { testInsightEngine };
