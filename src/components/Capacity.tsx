/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  Sliders, 
  ChevronRight, 
  Target, 
  Clock, 
  TrendingUp,
  LineChart,
  HelpCircle
} from 'lucide-react';
import { Machine, ProductionProcess, Sector, Unit, WorkCenter } from '../types';

interface CapacityProps {
  machines: Machine[];
  processes: ProductionProcess[];
  sectors: Sector[];
  units: Unit[];
  workCenters: WorkCenter[];
}

export default function Capacity({
  machines,
  processes,
  sectors,
  units,
  workCenters
}: CapacityProps) {
  
  const [selectedTimeframe, setSelectedTimeframe] = useState<'hora' | 'turno' | 'dia' | 'semana' | 'mes'>('dia');
  
  // Workload Simulator state
  const [targetQuantity, setTargetQuantity] = useState(250); 
  const [availableDays, setAvailableDays] = useState(5); // 5 days for target load

  // Get timeframe multi-factor
  const getFactor = (tf: 'hora' | 'turno' | 'dia' | 'semana' | 'mes') => {
    switch (tf) {
      case 'hora': return 1;
      case 'turno': return 8; // 8h shift
      case 'dia': return 24; // 24h day (or 3 shifts)
      case 'semana': return 120; // 5 days × 24h or active week shift of 44h. Let's make it typical 5 operating days = 40h
      case 'mes': return 160; // standard 160h work month
      default: return 8;
    }
  };

  const timeframeLabel = (tf: 'hora' | 'turno' | 'dia' | 'semana' | 'mes') => {
    switch (tf) {
      case 'hora': return 'Hora';
      case 'turno': return 'Turno (8h)';
      case 'dia': return 'Dia (24h)';
      case 'semana': return 'Semana Comercial (44h)';
      case 'mes': return 'Mês Produtivo (176h)';
      default: return '';
    }
  };

  const timeframeMultiplier = (tf: 'hora' | 'turno' | 'dia' | 'semana' | 'mes') => {
    switch (tf) {
      case 'hora': return 1;
      case 'turno': return 8;
      case 'dia': return 16; // 16h double shift avg
      case 'semana': return 88; // 2 shifts standard week
      case 'mes': return 352; // 2 shifts month
      default: return 8;
    }
  };

  const mult = timeframeMultiplier(selectedTimeframe);

  // 1. Calculations: Installed capacity vs utilized capacity estimates
  // installed index = capacity nominal sum
  const totalInstalledCapacityHour = workCenters.reduce((acc, wc) => acc + wc.capacityUnitsHour, 0);
  const installedCapacityTf = totalInstalledCapacityHour * mult;

  // utilized capacity calculation (weighted by efficiency & availability)
  const utilizedCapacityTf = Math.round(
    workCenters.reduce((acc, wc) => {
      const realWcCapacity = wc.capacityUnitsHour * (wc.efficiencyPercent / 100) * (wc.availabilityPercent / 100);
      return acc + realWcCapacity;
    }, 0) * mult
  );

  // 2. Simulation calculations based on targetQuantity & availableDays
  // Total work hours available in simulated timeline
  const simulatedHours = availableDays * 8; // 8-hour single shift simulation standard
  
  // calculate required speed (qty / simulated hours)
  const requiredRatePerHour = Number((targetQuantity / (simulatedHours || 1)).toFixed(1));

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Cálculo de Capacidade &amp; Gargalos</h2>
          <p className="text-xs text-slate-500">Módulo de engenharia tática para cálculo de oclusão de recursos, ociosidade e simulação de novas ordens em lote.</p>
        </div>

        {/* Timeframe selector tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          {(['hora', 'turno', 'dia', 'semana', 'mes'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition font-mono ${
                selectedTimeframe === tf ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Installed vs Utilized Cards */}
      <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Capacidade Operacional ({timeframeLabel(selectedTimeframe)})</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Installed */}
        <div className="bg-white border border-slate-205 rounded-xl p-5 shadow-xs relative">
          <span className="text-xxxxs font-mono uppercase font-bold text-slate-400 block mb-1">Capacidade Teórica Instalada</span>
          <span className="text-2xl font-display font-bold text-slate-800">{installedCapacityTf.toLocaleString()} colchões</span>
          <p className="text-xxs text-slate-500 mt-2 font-mono leading-relaxed">
            Velocidade nominal combinada das {workCenters.length} principais estações de trabalho de colchões operando em 100% de performance técnica.
          </p>
        </div>

        {/* Card 2: Real Utilized with OEE */}
        <div className="bg-white border border-slate-205 rounded-xl p-5 shadow-xs">
          <span className="text-xxxxs font-mono uppercase font-bold text-slate-400 block mb-1">Capacidade Real Utilizada (OEE Real)</span>
          <span className="text-2xl font-display font-bold text-emerald-600">{utilizedCapacityTf.toLocaleString()} colchões</span>
          <p className="text-xxs text-slate-550 mt-2 font-mono leading-relaxed">
            Estimativa descontando perdas históricas por indisponibilidade de maquinário no tape-edge e tempos de parada por setup físico de espumação.
          </p>
        </div>

        {/* Card 3: Global utilization rating */}
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
          <span className="text-xxxxs font-mono uppercase font-bold text-slate-400 block mb-1">Oclusão / Utilização de Planta</span>
          <span className="text-3xl font-display font-extrabold text-orange-500">
            {Math.round((utilizedCapacityTf / (installedCapacityTf || 1)) * 100)}%
          </span>
          <p className="text-xxs text-slate-400 mt-1 pb-1.5 border-b border-slate-800 font-mono">
            Eficiência média ponderada integrada da fábrica Sorocaba.
          </p>
          <div className="mt-2.5 flex items-center justify-between text-xxxxxs font-mono text-slate-400">
            <span>Perdas/Refugos: 6.2%</span>
            <span className="text-orange-500 font-bold">Fator Normalizado</span>
          </div>
        </div>

      </div>

      {/* Simulator and Bottlenecks comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* WORKLOAD INTERACTIVE SIMULATOR (Takes 2 widths) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs lg:col-span-2 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-base flex items-center gap-1.5">
                <Sliders className="w-5 h-5 text-orange-500" />
                Simulador de Carga e Gargalos PCP
              </h3>
              <p className="text-xs text-slate-500">Simule o impacto de novas ordens no gargalo de manufatura real de colchões em tempo real</p>
            </div>
          </div>

          {/* Simulator Inputs fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
            <div>
              <label className="block text-xxs font-mono uppercase tracking-wider mb-1.5 text-slate-600 font-bold">
                Volume de Colchões Desejado
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={targetQuantity}
                  onChange={(e) => setTargetQuantity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <span className="text-xs font-mono font-bold bg-white border px-2.5 py-1 rounded min-w-16 text-center text-slate-800">
                  {targetQuantity} un
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xxs font-mono uppercase tracking-wider mb-1.5 text-slate-600 font-bold">
                Prazo Disponível para Entrega (Dias Úteis)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={availableDays}
                  onChange={(e) => setAvailableDays(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 bg-linear-to-r rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <span className="text-xs font-mono font-bold bg-white border px-2.5 py-1 rounded min-w-16 text-center text-slate-800">
                  {availableDays} dias
                </span>
              </div>
            </div>
          </div>

          {/* Rate status message output */}
          <div className="bg-slate-900 rounded-xl p-3.5 text-white font-mono text-xxxs flex justify-between items-center flex-wrap gap-2">
            <span>⏱️ Ritmo de Entrega Requerido: <strong className="text-orange-500 text-xxs font-extrabold">{requiredRatePerHour} pçs/h</strong></span>
            <span>Tempo de operação: {simulatedHours} horas total (1 turno/dia)</span>
          </div>

          {/* Real-time calculated loads list for work centers responding to simulator */}
          <div className="space-y-4 pt-1.5">
            <h4 className="text-xxs font-mono uppercase tracking-wider text-slate-500 font-bold">Oclusão de Estações Centros de Trabalho no lote de {targetQuantity} un</h4>
            
            {workCenters.map((wc) => {
              // calculate load % = requiredRatePerHour / (wc capacity * efficiency * availability)
              const realHourlyCapacity = wc.capacityUnitsHour * (wc.efficiencyPercent / 100) * (wc.availabilityPercent / 100);
              const loadPercent = Math.round((requiredRatePerHour / (realHourlyCapacity || 1)) * 100);
              const isBottleneck = loadPercent > 90;

              return (
                <div key={wc.id} className="space-y-1 bg-white p-3 rounded-xl border hover:border-slate-300 transition">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{wc.name}</span>
                    
                    <div className="font-mono text-xxs">
                      Tempo sob Carga: <strong className={isBottleneck ? "text-red-500" : "text-slate-700"}>{loadPercent}%</strong>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      style={{ width: `${Math.min(loadPercent, 100)}%` }} 
                      className={`h-full rounded-full transition-all duration-305 ${
                        isBottleneck 
                          ? 'bg-red-500 shadow-xs shadow-red-200' 
                          : loadPercent < 40 
                          ? 'bg-blue-400' 
                          : 'bg-emerald-500'
                      }`}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xxxxs font-mono text-slate-400">
                    <span>Capac Real Operac: {realHourlyCapacity.toFixed(1)}/h</span>
                    {isBottleneck ? (
                      <span className="text-red-500 font-extrabold uppercase animate-pulse">⚠️ GARGALO CRÍTICO - EXCESSO CARGA</span>
                    ) : loadPercent < 40 ? (
                      <span className="text-blue-500 font-semibold uppercase">⚙ REC. OCIOSO - OPERAÇÃO FRACA</span>
                    ) : (
                      <span className="text-emerald-600 font-medium uppercase">✓ OPERAÇÃO BALANCEADA</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Tactical Recommendation panel (Takes 1 width) */}
        <div className="bg-slate-50 border border-slate-205 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-slate-800 text-sm">Estruturação de Gargalhos Fábrica</h3>
            <p className="text-xxs text-slate-500 leading-normal font-mono">
              Os dados e tempos indicam os seguintes comportamentos na produção de colchões mola/espuma:
            </p>

            <div className="space-y-3.5">
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xxs font-mono">
                <span className="font-bold text-red-700 block text-xxxxs uppercase mb-0.5">Tape Edge (Fechamento)</span>
                A costura de fechamento circular é o principal amortecedor da fábrica. Depende de trabalho humano circular constante.
              </div>
              <div className="p-3 bg-amber-50 border border-amber-105 rounded-lg text-xxs font-mono">
                <span className="font-bold text-amber-700 block text-xxxxs uppercase mb-0.5">Estação de Quilting</span>
                O quilting automático costuma reter o fluxo devido à furação de agulhas quando o tecido jacquard possui alta espessura.
              </div>
              <div className="p-3 bg-blue-50 border border-blue-105 rounded-lg text-xxs font-mono">
                <span className="font-bold text-blue-700 block text-xxxxs uppercase mb-0.5">Laminadora CNC</span>
                Recurso abundante. A laminação horizontal de blocos D28/D33 possui ociosidade técnica e pode assumir mais cargas do estoque.
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="p-3 bg-slate-900 text-white rounded-lg text-xxs font-mono space-y-1">
              <span className="font-bold text-orange-500 text-xxxxs uppercase block tracking-wider">Métrica OEE Sugerida</span>
              <p className="text-slate-400">Sugere-se implementar OEE cruzado nas próximas etapas de implantação.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
