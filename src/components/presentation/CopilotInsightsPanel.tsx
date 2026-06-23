import { useState, useEffect } from 'react';
import { Lightbulb, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp, X } from 'lucide-react';
import { insightGenerator, alertEngine, kpiCalculator } from '@/services';
import type { Insight, Alert } from '@/services';

interface CopilotInsightsPanelProps {
  onClose?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function CopilotInsightsPanel({
  onClose,
  autoRefresh = true,
  refreshInterval = 60000
}: CopilotInsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [overallHealth, setOverallHealth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    loadData();
    
    if (autoRefresh) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [insightsData, alertsData, kpis] = await Promise.all([
        insightGenerator.generateInsights(),
        Promise.resolve(alertEngine.getActiveAlerts()),
        kpiCalculator.calculateOverallKPIs()
      ]);
      
      setInsights(insightsData);
      setAlerts(alertsData);
      setOverallHealth(kpis.overallHealth);
    } catch (error) {
      console.error('Erro ao carregar insights:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleInsight = (insightId: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  };
  
  const toggleAlert = (alertId: string) => {
    setExpandedAlerts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  };
  
  const acknowledgeAlert = async (alertId: string) => {
    alertEngine.acknowledgeAlert(alertId);
    loadData();
  };
  
  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-400';
    if (health >= 60) return 'text-yellow-400';
    if (health >= 40) return 'text-orange-400';
    return 'text-red-400';
  };
  
  const getHealthBg = (health: number) => {
    if (health >= 80) return 'bg-green-500/20';
    if (health >= 60) return 'bg-yellow-500/20';
    if (health >= 40) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };
  
  const criticalInsights = insights.filter(i => i.type === 'critical');
  const warningInsights = insights.filter(i => i.type === 'warning');
  const opportunityInsights = insights.filter(i => i.type === 'opportunity');
  const informationInsights = insights.filter(i => i.type === 'information');
  
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const highAlerts = alerts.filter(a => a.severity === 'high');
  const mediumAlerts = alerts.filter(a => a.severity === 'medium');
  const lowAlerts = alerts.filter(a => a.severity === 'low');
  
  return (
    <div className="bg-gray-900 border-l border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-semibold text-white">Insights</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
            title="Atualizar"
          >
            <svg className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
      
      {/* Overall Health */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Saúde Geral</span>
          <span className={`text-2xl font-bold ${getHealthColor(overallHealth)}`}>
            {overallHealth.toFixed(0)}
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getHealthBg(overallHealth)}`}
            style={{ width: `${overallHealth}%` }}
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500 text-sm py-8">
            Carregando insights...
          </div>
        ) : (
          <>
            {/* Critical Alerts */}
            {criticalAlerts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Alertas Críticos ({criticalAlerts.length})
                </h3>
                <div className="space-y-2">
                  {criticalAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      isExpanded={expandedAlerts.has(alert.id)}
                      onToggle={() => toggleAlert(alert.id)}
                      onAcknowledge={() => acknowledgeAlert(alert.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* High Alerts */}
            {highAlerts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-orange-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Alertas Altos ({highAlerts.length})
                </h3>
                <div className="space-y-2">
                  {highAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      isExpanded={expandedAlerts.has(alert.id)}
                      onToggle={() => toggleAlert(alert.id)}
                      onAcknowledge={() => acknowledgeAlert(alert.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Critical Insights */}
            {criticalInsights.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Insights Críticos ({criticalInsights.length})
                </h3>
                <div className="space-y-2">
                  {criticalInsights.map((insight) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      isExpanded={expandedInsights.has(insight.id)}
                      onToggle={() => toggleInsight(insight.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Warning Insights */}
            {warningInsights.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Avisos ({warningInsights.length})
                </h3>
                <div className="space-y-2">
                  {warningInsights.map((insight) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      isExpanded={expandedInsights.has(insight.id)}
                      onToggle={() => toggleInsight(insight.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Opportunity Insights */}
            {opportunityInsights.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Oportunidades ({opportunityInsights.length})
                </h3>
                <div className="space-y-2">
                  {opportunityInsights.map((insight) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      isExpanded={expandedInsights.has(insight.id)}
                      onToggle={() => toggleInsight(insight.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Information Insights */}
            {informationInsights.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Informações ({informationInsights.length})
                </h3>
                <div className="space-y-2">
                  {informationInsights.map((insight) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      isExpanded={expandedInsights.has(insight.id)}
                      onToggle={() => toggleInsight(insight.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Empty State */}
            {criticalAlerts.length === 0 &&
             highAlerts.length === 0 &&
             criticalInsights.length === 0 &&
             warningInsights.length === 0 &&
             opportunityInsights.length === 0 &&
             informationInsights.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>Tudo está funcionando bem!</p>
                <p className="text-xs mt-1">Nenhum insight ou alerta no momento.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface InsightCardProps {
  key?: any;
  insight: Insight;
  isExpanded: boolean;
  onToggle: () => void;
}

function InsightCard({ insight, isExpanded, onToggle }: InsightCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-900/50 border-red-700 text-red-300';
      case 'warning': return 'bg-yellow-900/50 border-yellow-700 text-yellow-300';
      case 'opportunity': return 'bg-green-900/50 border-green-700 text-green-300';
      case 'information': return 'bg-blue-900/50 border-blue-700 text-blue-300';
      default: return 'bg-gray-800 border-gray-700 text-gray-300';
    }
  };
  
  return (
    <div className={`rounded-lg border p-3 ${getTypeColor(insight.type)}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="font-medium text-sm">{insight.title}</div>
          <div className="text-xs mt-1 opacity-80">{insight.description}</div>
        </div>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-black/20 rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-black/20">
          <div className="text-xs space-y-2">
            <div>
              <span className="font-medium">Impacto:</span> {insight.impact}
            </div>
            <div>
              <span className="font-medium">Prioridade:</span> {insight.priority}
            </div>
            {insight.suggestedActions && insight.suggestedActions.length > 0 && (
              <div>
                <span className="font-medium">Ações sugeridas:</span>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {insight.suggestedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface AlertCardProps {
  key?: any;
  alert: Alert;
  isExpanded: boolean;
  onToggle: () => void;
  onAcknowledge: () => void;
}

function AlertCard({ alert, isExpanded, onToggle, onAcknowledge }: AlertCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900/50 border-red-700 text-red-300';
      case 'high': return 'bg-orange-900/50 border-orange-700 text-orange-300';
      case 'medium': return 'bg-yellow-900/50 border-yellow-700 text-yellow-300';
      case 'low': return 'bg-blue-900/50 border-blue-700 text-blue-300';
      default: return 'bg-gray-800 border-gray-700 text-gray-300';
    }
  };
  
  return (
    <div className={`rounded-lg border p-3 ${getSeverityColor(alert.severity)}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="font-medium text-sm">{alert.title}</div>
          <div className="text-xs mt-1 opacity-80">{alert.description}</div>
        </div>
        <div className="flex items-center gap-1">
          {!alert.acknowledged && (
            <button
              onClick={onAcknowledge}
              className="p-1 hover:bg-black/20 rounded transition-colors"
              title="Reconhecer"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-black/20 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-black/20">
          <div className="text-xs space-y-2">
            <div>
              <span className="font-medium">Origem:</span> {alert.source}
            </div>
            <div>
              <span className="font-medium">Categoria:</span> {alert.category}
            </div>
            <div>
              <span className="font-medium">Timestamp:</span>{' '}
              {new Date(alert.timestamp).toLocaleString()}
            </div>
            {alert.acknowledged && (
              <div className="text-green-300">
                ✓ Reconhecido
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
