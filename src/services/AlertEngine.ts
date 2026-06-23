import { kpiCalculator, OverallKPIs } from "./KPICalculator";
import { insightGenerator, Insight } from "./InsightGenerator";

export interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'production' | 'inventory' | 'quality' | 'financial' | 'supplier';
  title: string;
  description: string;
  source: 'kpi' | 'insight' | 'threshold';
  data: Record<string, any>;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  category: 'production' | 'inventory' | 'quality' | 'financial' | 'supplier';
  condition: (kpis: OverallKPIs) => boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  enabled: boolean;
}

export interface AlertConfig {
  enableProductionAlerts: boolean;
  enableInventoryAlerts: boolean;
  enableQualityAlerts: boolean;
  enableFinancialAlerts: boolean;
  enableSupplierAlerts: boolean;
  autoResolveAlerts: boolean;
  alertRetentionDays: number;
}

export class AlertEngine {
  private config: AlertConfig = {
    enableProductionAlerts: true,
    enableInventoryAlerts: true,
    enableQualityAlerts: true,
    enableFinancialAlerts: true,
    enableSupplierAlerts: true,
    autoResolveAlerts: false,
    alertRetentionDays: 30
  };
  
  private rules: AlertRule[] = [];
  private activeAlerts: Map<string, Alert> = new Map();
  
  constructor() {
    this.initializeRules();
  }
  
  private initializeRules(): void {
    this.rules = [
      // Production Alerts
      {
        id: 'prod_completion_low',
        name: 'Taxa de conclusão baixa',
        category: 'production',
        condition: (kpis) => kpis.production.completionRate < 70,
        severity: 'high',
        title: 'Taxa de conclusão crítica',
        description: 'A taxa de conclusão de ordens está abaixo de 70%',
        enabled: true
      },
      {
        id: 'prod_bottleneck',
        name: 'Gargalos identificados',
        category: 'production',
        condition: (kpis) => kpis.production.bottlenecks.length > 0,
        severity: 'critical',
        title: 'Gargalos de produção detectados',
        description: 'Gargalos foram identificados na linha de produção',
        enabled: true
      },
      {
        id: 'prod_efficiency_low',
        name: 'Eficiência baixa',
        category: 'production',
        condition: (kpis) => kpis.production.efficiency < 60,
        severity: 'medium',
        title: 'Eficiência produtiva baixa',
        description: 'A eficiência produtiva está abaixo de 60%',
        enabled: true
      },
      
      // Inventory Alerts
      {
        id: 'inv_low_stock_high',
        name: 'Alta porcentagem de estoque baixo',
        category: 'inventory',
        condition: (kpis) => {
          const percentage = kpis.inventory.totalItems > 0 
            ? (kpis.inventory.lowStockItems / kpis.inventory.totalItems) * 100 
            : 0;
          return percentage > 15;
        },
        severity: 'high',
        title: 'Crise de estoque',
        description: 'Mais de 15% dos itens estão com estoque baixo',
        enabled: true
      },
      {
        id: 'inv_out_of_stock',
        name: 'Itens sem estoque',
        category: 'inventory',
        condition: (kpis) => kpis.inventory.outOfStockItems > 0,
        severity: 'critical',
        title: 'Itens sem estoque',
        description: 'Existem itens completamente sem estoque',
        enabled: true
      },
      
      // Quality Alerts
      {
        id: 'qual_scrap_high',
        name: 'Taxa de refugo alta',
        category: 'quality',
        condition: (kpis) => kpis.quality.scrapRate > 8,
        severity: 'critical',
        title: 'Taxa de refugo crítica',
        description: 'A taxa de refugo está acima de 8%',
        enabled: true
      },
      {
        id: 'qual_pass_low',
        name: 'Taxa de aprovação baixa',
        category: 'quality',
        condition: (kpis) => kpis.quality.passRate < 85,
        severity: 'high',
        title: 'Taxa de aprovação baixa',
        description: 'A taxa de aprovação está abaixo de 85%',
        enabled: true
      },
      
      // Financial Alerts
      {
        id: 'fin_margin_low',
        name: 'Margem líquida baixa',
        category: 'financial',
        condition: (kpis) => kpis.financial.netMargin < 5,
        severity: 'critical',
        title: 'Margem líquida crítica',
        description: 'A margem líquida está abaixo de 5%',
        enabled: true
      },
      {
        id: 'fin_margin_warning',
        name: 'Margem líquida em alerta',
        category: 'financial',
        condition: (kpis) => kpis.financial.netMargin < 10 && kpis.financial.netMargin >= 5,
        severity: 'high',
        title: 'Margem líquida em alerta',
        description: 'A margem líquida está entre 5% e 10%',
        enabled: true
      },
      
      // Supplier Alerts
      {
        id: 'sup_critical_high',
        name: 'Muitos fornecedores críticos',
        category: 'supplier',
        condition: (kpis) => {
          const percentage = kpis.supplier.totalSuppliers > 0 
            ? (kpis.supplier.criticalSuppliers / kpis.supplier.totalSuppliers) * 100 
            : 0;
          return percentage > 25;
        },
        severity: 'high',
        title: 'Alta dependência de fornecedores críticos',
        description: 'Mais de 25% dos fornecedores são críticos',
        enabled: true
      },
      {
        id: 'sup_leadtime_high',
        name: 'Lead time alto',
        category: 'supplier',
        condition: (kpis) => kpis.supplier.averageLeadTime > 45,
        severity: 'medium',
        title: 'Lead time de fornecedores alto',
        description: 'O lead time médio está acima de 45 dias',
        enabled: true
      }
    ];
  }
  
  async evaluateAlerts(): Promise<Alert[]> {
    try {
      const kpis = await kpiCalculator.calculateOverallKPIs();
      const newAlerts: Alert[] = [];
      
      // Avaliar regras de alerta
      for (const rule of this.rules) {
        if (!rule.enabled) continue;
        
        // Verificar se categoria está habilitada
        if (!this.isCategoryEnabled(rule.category)) continue;
        
        if (rule.condition(kpis)) {
          const alertId = `${rule.id}_${Date.now()}`;
          
          // Verificar se alerta já existe
          const existingAlert = this.findActiveAlert(rule.id);
          if (existingAlert) {
            // Atualizar alerta existente
            existingAlert.timestamp = new Date().toISOString();
            existingAlert.data = { ...existingAlert.data, kpis };
          } else {
            // Criar novo alerta
            const alert: Alert = {
              id: alertId,
              severity: rule.severity,
              category: rule.category,
              title: rule.title,
              description: rule.description,
              source: 'threshold',
              data: { ruleId: rule.id, kpis },
              timestamp: new Date().toISOString(),
              acknowledged: false,
              resolved: false
            };
            
            this.activeAlerts.set(alertId, alert);
            newAlerts.push(alert);
          }
        }
      }
      
      // Gerar alertas a partir de insights críticos
      const insights = await insightGenerator.generateInsights();
      const criticalInsights = insights.filter(i => i.type === 'critical' || i.type === 'warning');
      
      for (const insight of criticalInsights) {
        const alertId = `insight_${insight.id}`;
        const existingAlert = this.findActiveAlert(alertId);
        
        if (!existingAlert) {
          const alert: Alert = {
            id: alertId,
            severity: insight.type === 'critical' ? 'critical' : 'high',
            category: insight.category,
            title: insight.title,
            description: insight.description,
            source: 'insight',
            data: { insightId: insight.id, insight },
            timestamp: new Date().toISOString(),
            acknowledged: false,
            resolved: false
          };
          
          this.activeAlerts.set(alertId, alert);
          newAlerts.push(alert);
        }
      }
      
      // Auto-resolver alertas antigos se habilitado
      if (this.config.autoResolveAlerts) {
        this.autoResolveOldAlerts();
      }
      
      return newAlerts;
    } catch (error) {
      console.error('Erro ao avaliar alertas:', error);
      return [];
    }
  }
  
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
  }
  
  getAlertsByCategory(category: string): Alert[] {
    return this.getActiveAlerts().filter(alert => alert.category === category);
  }
  
  getAlertsBySeverity(severity: string): Alert[] {
    return this.getActiveAlerts().filter(alert => alert.severity === severity);
  }
  
  acknowledgeAlert(alertId: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }
  
  resolveAlert(alertId: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      this.activeAlerts.delete(alertId);
    }
  }
  
  acknowledgeAllAlerts(): void {
    for (const alert of this.activeAlerts.values()) {
      alert.acknowledged = true;
    }
  }
  
  resolveAllAlerts(): void {
    this.activeAlerts.clear();
  }
  
  private isCategoryEnabled(category: string): boolean {
    switch (category) {
      case 'production':
        return this.config.enableProductionAlerts;
      case 'inventory':
        return this.config.enableInventoryAlerts;
      case 'quality':
        return this.config.enableQualityAlerts;
      case 'financial':
        return this.config.enableFinancialAlerts;
      case 'supplier':
        return this.config.enableSupplierAlerts;
      default:
        return true;
    }
  }
  
  private findActiveAlert(ruleId: string): Alert | undefined {
    for (const alert of this.activeAlerts.values()) {
      if (alert.data.ruleId === ruleId && !alert.resolved) {
        return alert;
      }
    }
    return undefined;
  }
  
  private autoResolveOldAlerts(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.alertRetentionDays);
    
    for (const [alertId, alert] of this.activeAlerts.entries()) {
      const alertDate = new Date(alert.timestamp);
      if (alertDate < cutoffDate) {
        this.activeAlerts.delete(alertId);
      }
    }
  }
  
  updateConfig(config: Partial<AlertConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  getConfig(): AlertConfig {
    return { ...this.config };
  }
  
  getRules(): AlertRule[] {
    return [...this.rules];
  }
  
  enableRule(ruleId: string): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = true;
    }
  }
  
  disableRule(ruleId: string): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = false;
    }
  }
  
  addRule(rule: Omit<AlertRule, 'id'>): void {
    const newRule: AlertRule = {
      ...rule,
      id: `custom_${Date.now()}`
    };
    this.rules.push(newRule);
  }
  
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }
}

export const alertEngine = new AlertEngine();
