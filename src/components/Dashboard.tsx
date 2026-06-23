/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Building2, 
  Cpu, 
  Layers, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Wrench, 
  ClipboardCheck, 
  Clock, 
  Layers3, 
  Target
} from 'lucide-react';
import { 
  Machine, 
  RawMaterial, 
  Supplier, 
  ProductionProcess, 
  ProductModel, 
  BOMVersion,
  WorkCenter
} from '../types';

interface DashboardProps {
  machines: Machine[];
  materials: RawMaterial[];
  suppliers: Supplier[];
  processes: ProductionProcess[];
  products: ProductModel[];
  workCenters: WorkCenter[];
  activeRole: string;
  onNavigate: (module: string) => void;
}

export default function Dashboard({
  machines,
  materials,
  suppliers,
  processes,
  products,
  workCenters,
  activeRole,
  onNavigate
}: DashboardProps) {
  
  // Calculate indicators
  const totalMachines = machines.length;
  const activeMachines = machines.filter(m => m.status === 'Operando').length;
  const inMaintenance = machines.filter(m => m.status === 'Manutenção').length;
  const stoppedMachines = machines.filter(m => m.status === 'Parada').length;
  
  const totalMaterials = materials.length;
  const lowStockMaterials = materials.filter(m => m.currentStock <= m.minStock).length;
  const totalSuppliers = suppliers.length;
  
  const totalProcesses = processes.length;
  const averageProcessTime = processes.length > 0
    ? (processes.reduce((acc, p) => acc + p.observedTimeMinutes, 0) / processes.length).toFixed(1)
    : '0';

  const totalProducts = products.length;

  // Work Center stats average
  const avgEfficiency = workCenters.length > 0
    ? Math.round(workCenters.reduce((acc, wc) => acc + wc.efficiencyPercent, 0) / workCenters.length)
    : 0;

  const avgAvailability = workCenters.length > 0
    ? Math.round(workCenters.reduce((acc, wc) => acc + wc.availabilityPercent, 0) / workCenters.length)
    : 0;

  // Let's identify the primary bottleneck
  const potentialBottleneck = workCenters.reduce((prev, current) => {
    // A bottleneck is generally characterized by lower capacity limits or higher queue
    return (current.efficiencyPercent < prev.efficiencyPercent) ? current : prev;
  }, workCenters[0] || { name: 'Nenhum', efficiencyPercent: 100 });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white bg-radial from-slate-900 to-slate-950 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold bg-orange-600 rounded text-orange-50 font-mono tracking-widest uppercase">
                V1_ESTRUTURAL_READY
              </span>
              <span className="text-slate-400 text-xs font-mono">• Modo Operador: {activeRole}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-white">
              Industrial OS <span className="text-orange-500 text-lg font-mono">_v1.0</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Plataforma unificada de gestão, modelagem de tempos, capacidade instalada e engenharia de materiais para colchões.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => onNavigate('processes')}
              className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition font-mono flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              Estudo de Tempos
            </button>
            <button 
              onClick={() => onNavigate('capacity')}
              className="px-4 py-2 text-xs font-medium bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-mono shadow-sm shadow-orange-500/10 transition flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              Simular Capacidade
            </button>
          </div>
        </div>
      </div>

      {/* Main Industrial Metrics Grid */}
      <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 -mb-2">Indicadores Principais</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Machines */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Máquinas Cadastradas</p>
              <h3 className="text-2xl mt-1 font-display font-bold text-slate-800">{totalMachines}</h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="text-emerald-600 font-medium">{activeMachines} Ativas</span>
            <span>•</span>
            <span className={inMaintenance > 0 ? "text-amber-500 font-medium" : "text-slate-400"}>
              {inMaintenance} Manut.
            </span>
            <span>•</span>
            <span className="text-slate-400">{stoppedMachines} Paradas</span>
          </div>
        </div>

        {/* KPI 2: Inventory Insumos */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Matérias-Primas</p>
              <h3 className="text-2xl mt-1 font-display font-bold text-slate-800">{totalMaterials}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
              <Layers3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-mono">
            {lowStockMaterials > 0 ? (
              <span className="text-red-500 flex items-center gap-0.5 font-medium">
                <AlertTriangle className="w-3 h-3 inline" /> {lowStockMaterials} Estoque Crítico
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">Estoque Seguro</span>
            )}
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Filtros: {totalSuppliers} Fornecedores</span>
          </div>
        </div>

        {/* KPI 3: Processes */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Processos Mapeados</p>
              <h3 className="text-2xl mt-1 font-display font-bold text-slate-800">{totalProcesses}</h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Tempo Médio: Mapeado {averageProcessTime}m</span>
          </div>
        </div>

        {/* KPI 4: Engineering Models */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-slate-800/30 transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-slate-800"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Modelos de Colchões</p>
              <h3 className="text-2xl mt-1 font-display font-bold text-slate-800">{totalProducts}</h3>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="text-indigo-600 font-medium">Modelos com BOM Ativos</span>
          </div>
        </div>
      </div>

      {/* Capacity & Operational Benchmarks Dashboard section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Benchmarking Charts - Sectors Capacity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-2 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-display font-semibold text-slate-800">Capacidade Operacional por Centro de Trabalho</h3>
              <p className="text-xs text-slate-500">Fluxos calculados em unidades/hora e eficiência observada</p>
            </div>
            <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-mono text-xxxs">
              Média OEE: {avgEfficiency}%
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {workCenters.map((wc) => (
              <div key={wc.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">{wc.name}</span>
                    <span className="text-xxs px-1.5 py-0.2 bg-slate-100 text-slate-500 font-mono rounded">
                      {wc.id}
                    </span>
                  </div>
                  <div className="font-mono text-slate-500 text-xxs">
                    Capac: <strong className="text-slate-800">{wc.capacityUnitsHour} un/h</strong>
                    <span className="mx-1">|</span>
                    OEE: <strong className="text-emerald-600">{wc.efficiencyPercent}%</strong>
                  </div>
                </div>
                {/* Simulated Custom Bar Chart */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div 
                    style={{ width: `${wc.efficiencyPercent}%` }} 
                    className={`h-full rounded-full ${
                      wc.efficiencyPercent < 86 
                        ? 'bg-amber-500 shadow-sm shadow-amber-300' 
                        : 'bg-emerald-500 shadow-sm shadow-emerald-250'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <div className="text-xs text-slate-600">
                Gargalo Identificado: <strong className="text-slate-800 font-medium">Tape Edge ({potentialBottleneck.name})</strong> devido ao tempo cíclico de fechamento.
              </div>
            </div>
            <button 
              onClick={() => onNavigate('capacity')} 
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 font-mono flex items-center gap-0.5"
            >
              Análise 360 →
            </button>
          </div>
        </div>

        {/* Machine Status & Calibration Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-800 mb-1">Status Operacional Geral</h3>
            <p className="text-xs text-slate-500 mb-4">Condição das máquinas em tempo real</p>

            <div className="flex justify-center items-center py-6 relative">
              <div className="text-center">
                <span className="text-4xl font-display font-bold text-slate-800">
                  {Math.round((activeMachines / (totalMachines || 1)) * 100)}%
                </span>
                <p className="text-xxs text-slate-500 font-mono uppercase tracking-wider mt-1">Disponibilidade Ativa</p>
              </div>
              
              {/* Decorative radial circle border */}
              <div className="absolute inset-0 m-auto w-32 h-32 border-4 border-slate-100 rounded-full flex items-center justify-center">
                <div 
                  className="absolute inset-0 border-4 border-emerald-500 rounded-full"
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${
                      (activeMachines / (totalMachines || 1)) * 100 >= 50 ? '100% 0%, 100% 100%' : '100% 0%'
                    }, 50% 100%)`,
                    transform: 'rotate(0deg)'
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2.5 mt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Giro Normal (Operando)
                </span>
                <span className="font-mono font-semibold text-slate-800">{activeMachines} máq.</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  Paradas Planejadas/Setup
                </span>
                <span className="font-mono font-semibold text-slate-800">{stoppedMachines} máq.</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                  Em Manutenção Corretiva
                </span>
                <span className="font-mono font-semibold text-slate-800">{inMaintenance} máq.</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button 
              onClick={() => onNavigate('machines')}
              className="w-full text-center py-2 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 rounded-lg border border-slate-200 transition font-mono"
            >
              Ver Detalhes do Maquinário
            </button>
          </div>
        </div>

      </div>

      {/* Industrial Evolution and AI Preparation Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Timeline / Progress of setup */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-display font-semibold text-slate-800">Evolução de Digitalização Industrial</h3>
              <p className="text-xs text-slate-500">Indicadores de progresso da implantação da V1</p>
            </div>
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xxs font-mono font-bold rounded">
              Avançado
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Mapeamento de Postos de Trabalho</span>
                <span className="font-mono text-slate-800">100% Completo</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="w-full bg-orange-500 h-full rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Cronometragem de Tempos Padrões (Estudo)</span>
                <span className="font-mono text-slate-800 font-medium">85% Completo</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div style={{ width: '85%' }} className="bg-orange-500 h-full rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Estrutura de Fórmulas e BOM do Colchão</span>
                <span className="font-mono text-slate-800">75% Completo</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div style={{ width: '75%' }} className="bg-orange-500 h-full rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Estrutura de Engenharia de Dados para IA</span>
                <span className="font-mono text-emerald-600 font-bold">100% PRONTO</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="w-full bg-emerald-500 h-full rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Ready Readiness Module Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm text-slate-200">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 font-mono text-xxs font-semibold border border-indigo-500/20 rounded uppercase tracking-wide">
                IA NATIVA - DATASCHEMA
              </span>
              <h3 className="text-lg font-display font-semibold text-white mt-1">Status: IA_NATIVE_READY</h3>
            </div>
            <div className="bg-indigo-500/10 text-indigo-400 p-2 rounded-lg border border-indigo-500/20">
              <TrendingUp className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Toda a base relacional de processos, cronometragens estruturadas e capacidades da fábrica foi normalizada em arrays escaláveis no client. Os dados estão prontos para receber o motor de recomendação inteligente do Gemini.
          </p>

          <div className="border-t border-slate-800 pt-3 space-y-2">
            <div className="text-xxs font-mono text-slate-300 uppercase tracking-widest">
              Futuros Motores Estruturados:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xxs font-mono text-slate-400">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Gargalos Padrão (FIFO)
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Simulação de Monte Carlo
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Análise Preditiva de Falha
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Otimizador de Encaixe de Linha
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
