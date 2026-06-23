import * as React from 'react';
import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Package, TrendingDown, TrendingUp, Clock } from 'lucide-react';
import { kpiCalculator } from '@/services';
import { insightGenerator } from '@/services';
import { industrialCapabilities } from '@/lib/industrialCapabilities';

interface KPICard {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

interface Suggestion {
  text: string;
  onClick: () => void;
}

interface CopilotWelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function CopilotWelcomeScreen({ onSuggestionClick }: CopilotWelcomeScreenProps) {
  const [kpiCards, setKpiCards] = useState<KPICard[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    loadKPIs();
    loadSuggestions();
  }, []);

  const loadKPIs = async () => {
    try {
      const kpis = (await kpiCalculator.calculateOverallKPIs()) as any;
      
      const cards: KPICard[] = [
        {
          title: 'OPs em Andamento',
          value: kpis.production?.activeOrders || 0,
          change: kpis.production?.completionRate ? `${kpis.production.completionRate}% concluídas` : undefined,
          icon: <Activity className="w-5 h-5" />,
          color: 'bg-orange-900/50 border-orange-700 text-orange-300',
        },
        {
          title: 'OPs Atrasadas',
          value: kpis.production?.delayedOrders || 0,
          change: kpis.production?.delayedOrders > 0 ? 'Ação necessária' : undefined,
          icon: <AlertTriangle className="w-5 h-5" />,
          color: kpis.production?.delayedOrders > 0 
            ? 'bg-red-900/50 border-red-700 text-red-300' 
            : 'bg-green-900/50 border-green-700 text-green-300',
        },
        {
          title: 'Capacidade Utilizada',
          value: kpis.production?.capacityUtilization ? `${kpis.production.capacityUtilization}%` : '0%',
          change: kpis.production?.capacityUtilization > 80 ? 'Alta utilização' : undefined,
          icon: <TrendingUp className="w-5 h-5" />,
          color: kpis.production?.capacityUtilization > 80 
            ? 'bg-yellow-900/50 border-yellow-700 text-yellow-300' 
            : 'bg-blue-900/50 border-blue-700 text-blue-300',
        },
        {
          title: 'Itens Críticos',
          value: kpis.inventory?.lowStockItems || 0,
          change: kpis.inventory?.lowStockItems > 0 ? 'Risco de ruptura' : undefined,
          icon: <Package className="w-5 h-5" />,
          color: kpis.inventory?.lowStockItems > 0 
            ? 'bg-red-900/50 border-red-700 text-red-300' 
            : 'bg-green-900/50 border-green-700 text-green-300',
        },
        {
          title: 'Pedidos Pendentes',
          value: kpis.supplier?.pendingOrders || 0,
          change: kpis.supplier?.pendingOrders > 0 ? 'Acompanhar' : undefined,
          icon: <Clock className="w-5 h-5" />,
          color: 'bg-cyan-900/50 border-cyan-700 text-cyan-300',
        },
        {
          title: 'Taxa de Refugo',
          value: kpis.quality?.scrapRate ? `${kpis.quality.scrapRate}%` : '0%',
          change: kpis.quality?.scrapRate > 5 ? 'Acima da meta' : 'Dentro da meta',
          icon: <TrendingDown className="w-5 h-5" />,
          color: kpis.quality?.scrapRate > 5 
            ? 'bg-red-900/50 border-red-700 text-red-300' 
            : 'bg-green-900/50 border-green-700 text-green-300',
        },
      ];

      setKpiCards(cards);
    } catch (error) {
      console.error('Erro ao carregar KPIs:', error);
      // Fallback com dados simulados
      setKpiCards([
        {
          title: 'OPs em Andamento',
          value: 12,
          icon: <Activity className="w-5 h-5" />,
          color: 'bg-orange-900/50 border-orange-700 text-orange-300',
        },
        {
          title: 'OPs Atrasadas',
          value: 2,
          icon: <AlertTriangle className="w-5 h-5" />,
          color: 'bg-red-900/50 border-red-700 text-red-300',
        },
        {
          title: 'Capacidade Utilizada',
          value: '78%',
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'bg-blue-900/50 border-blue-700 text-blue-300',
        },
        {
          title: 'Itens Críticos',
          value: 3,
          icon: <Package className="w-5 h-5" />,
          color: 'bg-red-900/50 border-red-700 text-red-300',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = () => {
    // Obter exemplos das capacidades industriais
    const allExamples = industrialCapabilities.flatMap(cap => cap.examples);
    // Selecionar 6 exemplos aleatórios
    const shuffled = allExamples.sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 6));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Industrial Copilot</h2>
        <p className="text-gray-400">
          Posso ajudar você a gerenciar produção, estoque, qualidade, custos e muito mais.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Visão Geral da Fábrica</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {kpiCards.map((card, index) => (
            <div
              key={index}
              className={`rounded-lg border p-4 ${card.color}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {card.icon}
                  <div className="text-sm font-medium">{card.title}</div>
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{card.value}</div>
              {card.change && (
                <div className="text-xs opacity-80">{card.change}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">O que posso fazer por você?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
            >
              <div className="text-sm text-gray-300">{suggestion}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
