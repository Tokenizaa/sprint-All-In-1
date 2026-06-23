/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Cpu, 
  Layers, 
  Layers3, 
  Activity, 
  Clock, 
  HelpCircle, 
  ArrowRight, 
  Boxes, 
  FileCheck, 
  FileText, 
  BadgeAlert,
  Percent,
  CheckCircle2,
  Calendar,
  Compass,
  ChevronRight
} from 'lucide-react';
import { 
  Machine, 
  ProductionProcess, 
  ProductModel, 
  BOMVersion, 
  RawMaterial, 
  IndustrialDocument,
  TimeMeasurement
} from '../types';

interface Industrial360Props {
  machines: Machine[];
  processes: ProductionProcess[];
  products: ProductModel[];
  boms: BOMVersion[];
  materials: RawMaterial[];
  documents: IndustrialDocument[];
  timeStudies: TimeMeasurement[];
}

export default function Industrial360({
  machines,
  processes,
  products,
  boms,
  materials,
  documents,
  timeStudies
}: Industrial360Props) {
  
  const [active360Node, setActive360Node] = useState<'machine' | 'process' | 'product'>('machine');

  // Selected entities ids
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id || '');
  const [selectedProcessId, setSelectedProcessId] = useState<string>(processes[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');

  // Select active objects
  const activeMachine = machines.find(m => m.id === selectedMachineId);
  const activeProcess = processes.find(p => p.id === selectedProcessId);
  const activeProduct = products.find(p => p.id === selectedProductId);

  // Filter linked documents
  const activeMachineDocs = documents.filter(d => d.associatedType === 'Máquina' && d.associatedId === selectedMachineId);
  const activeProcessDocs = documents.filter(d => d.associatedType === 'Processo' && d.associatedId === selectedProcessId);
  const activeProductDocs = documents.filter(d => d.associatedType === 'Produto' && d.associatedId === selectedProductId);

  return (
    <div className="space-y-6">
      
      {/* Upper Navigation Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-1.5">
            <Activity className="w-5 h-5 text-orange-500 animate-pulse" />
            Cockpit Industrial 360º
          </h2>
          <p className="text-xs text-slate-500">Navegue pelas engrenagens da fábrica selecionando visões cruzadas e completas de cada nodo industrial.</p>
        </div>

        {/* Node switches */}
        <div className="flex bg-slate-100 p-1 rounded-lg border">
          <button
            onClick={() => setActive360Node('machine')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition font-mono flex items-center gap-1 ${
              active360Node === 'machine' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Máquina 360
          </button>
          <button
            onClick={() => setActive360Node('process')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition font-mono flex items-center gap-1 ${
              active360Node === 'process' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Processo 360
          </button>
          <button
            onClick={() => setActive360Node('product')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition font-mono flex items-center gap-1 ${
              active360Node === 'product' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" /> Produto 360
          </button>
        </div>
      </div>

      {/* NODE VIEW 1: MACHINE 360 PANEL */}
      {active360Node === 'machine' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Side selectors */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <label className="block text-xxxxs uppercase font-bold text-slate-400 font-mono">SELECIONE O RECURSO FÍSICO</label>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {machines.map((mac) => (
                <button
                  key={mac.id}
                  onClick={() => setSelectedMachineId(mac.id)}
                  className={`w-full text-left p-3 rounded-lg border transition text-xxs font-mono flex justify-between items-center ${
                    selectedMachineId === mac.id 
                      ? 'bg-slate-900 border-slate-900 text-white font-semibold' 
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="block text-xxxxs opacity-60 text-indigo-400">{mac.id}</span>
                    <span className="font-display font-medium text-xs font-sans">{mac.name}</span>
                  </div>
                  <span className={`px-1 rounded text-xxxxs uppercase font-extrabold ${
                    mac.status === 'Operando' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-500'
                  }`}>
                    {mac.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right side detailed profile card (takes remaining 2 columns) */}
          {activeMachine ? (
            <div className="lg:col-span-2 space-y-6">
              
              {/* Header profile banner */}
              <div className="bg-white border border-slate-205 rounded-xl p-6 shadow-xs relative">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <span className="px-2 py-0.5 bg-blue-10px bg-slate-100 text-slate-500 rounded font-mono text-xxxxs uppercase font-bold">
                      Perfil Ativo _ {activeMachine.id}
                    </span>
                    <h3 className="font-display font-bold text-slate-800 text-lg mt-1">{activeMachine.name}</h3>
                    <p className="text-xxs text-slate-550 font-mono">Fabricante: {activeMachine.manufacturer} • Modelo: {activeMachine.model}</p>
                  </div>

                  <span className={`px-3 py-1 font-mono text-xxxs rounded font-bold uppercase ${
                    activeMachine.status === 'Operando' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    Status: {activeMachine.status}
                  </span>
                </div>

                {/* 360 general grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t pt-4 font-mono text-xxs">
                  <div>
                    <span className="block text-xxxxs uppercase text-slate-400 font-bold mb-0.5">Nº de Série</span>
                    <strong className="text-slate-800">{activeMachine.serialNumber}</strong>
                  </div>
                  <div>
                    <span className="block text-xxxxs uppercase text-slate-400 font-bold mb-0.5">Aquisição</span>
                    <strong className="text-slate-800 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 shrink-0" /> {activeMachine.acquisitionDate}</strong>
                  </div>
                  <div>
                    <span className="block text-xxxxs uppercase text-slate-400 font-bold mb-0.5">Garantia Limitada</span>
                    <strong className="text-slate-800">{activeMachine.warrantyUntil}</strong>
                  </div>
                  <div>
                    <span className="block text-xxxxs uppercase text-slate-400 font-bold mb-0.5">Coordenada Galpão</span>
                    <strong className="text-slate-800 flex items-center gap-1"><Compass className="w-3.5 h-3.5 shrink-0" /> {activeMachine.location}</strong>
                  </div>
                </div>
              </div>

              {/* Capacities and Associated processes routing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Capacities analysis Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <h4 className="font-display font-semibold text-slate-800 text-xs uppercase tracking-wide border-b pb-2">Índice de Capacidade Relativa</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xxs font-mono mb-1">
                        <span className="text-slate-500 font-medium">Capacidade Nominal Teórica</span>
                        <span className="font-bold text-slate-700">{activeMachine.capacityTheoretical} un/h</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full">
                        <div className="w-full bg-slate-400 h-full rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xxs font-mono mb-1">
                        <span className="text-slate-500 font-medium">Capacidade Operacional Prática</span>
                        <span className="font-bold text-slate-705">{activeMachine.capacityOperational} un/h</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full">
                        <div 
                          style={{ width: `${(activeMachine.capacityOperational / activeMachine.capacityTheoretical) * 100}%` }} 
                          className="bg-blue-500 h-full rounded-full"
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xxs font-mono mb-1">
                        <span className="text-emerald-600 font-semibold">Capacidade Observada em Cronômetro</span>
                        <span className="font-bold text-emerald-700">{activeMachine.capacityObserved} un/h</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full">
                        <div 
                          style={{ width: `${(activeMachine.capacityObserved / activeMachine.capacityTheoretical) * 100}%` }} 
                          className="bg-emerald-500 h-full rounded-full"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents and Relatives processes */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <h4 className="font-display font-semibold text-slate-800 text-xs uppercase tracking-wide border-b pb-2">Documentos e Manuais Relacionados</h4>
                  
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {activeMachineDocs.map((doc) => (
                      <div key={doc.id} className="p-3 bg-slate-50 rounded-lg border font-mono text-xxs flex justify-between items-center">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate block font-bold text-slate-800">{doc.title}</span>
                        </div>
                        <span className="text-xxxxs bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded shrink-0">{doc.type}</span>
                      </div>
                    ))}
                    {activeMachineDocs.length === 0 && (
                      <p className="text-xxs text-slate-400 font-mono text-center py-5">Não há manuais indexados para este maquinário.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="lg:col-span-2 text-center py-10 text-slate-400">Selecione uma máquina de colchões.</div>
          )}
        </div>
      )}

      {/* NODE VIEW 2: PROCESS 360 PANEL */}
      {active360Node === 'process' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <label className="block text-xxxxs uppercase font-bold text-slate-400 font-mono">SELECIONE O PROCESSO / ROTA</label>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {processes.map((proc) => (
                <button
                  key={proc.id}
                  onClick={() => setSelectedProcessId(proc.id)}
                  className={`w-full text-left p-3 rounded-lg border transition text-xxs font-mono flex justify-between items-center ${
                    selectedProcessId === proc.id 
                      ? 'bg-slate-900 border-slate-900 text-white font-semibold' 
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="block text-xxxxs opacity-60 text-emerald-400">{proc.id}</span>
                    <span className="font-display font-medium text-xs font-sans truncate block">{proc.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Display Process 360 panel */}
          {activeProcess ? (
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white border border-slate-205 rounded-xl p-6 shadow-xs">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-705 rounded font-mono text-xxxxs uppercase font-bold">
                  Engenharia de Rota Comercial _ {activeProcess.id}
                </span>

                <h3 className="font-display font-bold text-slate-800 text-lg mt-1">{activeProcess.name}</h3>
                
                {/* Flow chart visually simulated */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 items-center font-mono text-xxs">
                  
                  {/* Inputs */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-dashed border-slate-300">
                    <span className="block text-xxxxs uppercase text-slate-40s font-extrabold pb-1.5 mb-2 border-b">EMTRADAS (Insumos MP)</span>
                    <div className="space-y-1">
                      {activeProcess.inputs.map((inp, idx) => (
                        <div key={idx} className="bg-white p-1 rounded border text-slate-700">{inp}</div>
                      ))}
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="text-center flex flex-col justify-center items-center">
                    <span className="text-xxxxxs text-slate-400 uppercase tracking-widest font-bold">Ação da Linha ({activeProcess.peopleInvolved} Op)</span>
                    <div className="w-full h-0.5 bg-slate-200 my-2 relative">
                      <div className="absolute right-0 -top-1 w-2.5 h-2.5 border-t-2 border-r-2 border-slate-400 rotate-45"></div>
                    </div>
                    <span className="text-xxs text-amber-600 font-bold">Standard: {activeProcess.standardTimeMinutes} min</span>
                  </div>

                  {/* Outputs */}
                  <div className="bg-emerald-50/40 p-3 rounded-xl border border-dashed border-emerald-300">
                    <span className="block text-xxxxs uppercase text-emerald-700 font-extrabold pb-1.5 mb-2 border-b">SAÍDAS (Resultados)</span>
                    <div className="space-y-1">
                      {activeProcess.outputs.map((out, idx) => (
                        <div key={idx} className="bg-white p-1 rounded border border-emerald-100 text-emerald-800 font-bold">{out}</div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Time studies and compatibility machines inside Process */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Compatibility Machinery */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <h4 className="font-display font-semibold text-slate-805 text-xs uppercase tracking-wide border-b pb-2">Maquinário Compatível Mapeado</h4>
                  
                  <div className="space-y-2">
                    {activeProcess.machineIds.map((mid) => {
                      const relatedMac = machines.find(m => m.id === mid);
                      return (
                        <div key={mid} className="p-3 bg-slate-50 border rounded-lg flex justify-between items-center font-mono text-xxs">
                          <div>
                            <span className="block text-xxxxs text-slate-400 font-bold">{mid}</span>
                            <strong className="text-slate-805 font-sans font-medium text-xs">{relatedMac?.name || 'Recurso Genérico'}</strong>
                          </div>

                          <span className="text-xxxxs bg-blue-100 text-blue-700 px-1.5 font-bold rounded">{relatedMac?.category}</span>
                        </div>
                      );
                    })}
                    {activeProcess.machineIds.length === 0 && (
                      <p className="text-xxs text-slate-400 font-mono text-center py-4">Processo 100% Manual, dependente de bancadas estáticas.</p>
                    )}
                  </div>
                </div>

                {/* Real operator time studies history linked to that process */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <h4 className="font-display font-semibold text-slate-805 text-xs uppercase tracking-wide border-b pb-2">Cronometragens Vinculadas</h4>
                  
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {timeStudies.filter(t => t.processId === selectedProcessId).map((study) => (
                      <div key={study.id} className="p-2.5 bg-slate-50 border rounded-lg font-mono text-xxxxs flex justify-between items-center text-slate-500">
                        <div>
                          <strong className="text-slate-700 font-sans font-medium block text-xxs">{study.operatorName}</strong>
                          <span>Máq: {study.machineId} • {study.date}</span>
                        </div>
                        <span className="text-xs font-extrabold text-slate-800">{study.durationSeconds}s</span>
                      </div>
                    ))}
                    {timeStudies.filter(t => t.processId === selectedProcessId).length === 0 && (
                      <p className="text-xxs text-slate-400 font-mono text-center py-4">Sem cronometragens arquivadas.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="lg:col-span-2 text-center py-10 text-slate-400">Selecione uma engrenagem de rota comercial.</div>
          )}
        </div>
      )}

      {/* NODE VIEW 3: PRODUCT 360 PANEL */}
      {active360Node === 'product' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <label className="block text-xxxxs uppercase font-bold text-slate-400 font-mono">SELECIONE O PRODUTO COLCHÃO</label>
            
            <div className="space-y-2 max-h-96 overflow-y-auto w-full">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`w-full text-left p-3 rounded-lg border transition text-xxs font-mono flex justify-between items-center ${
                    selectedProductId === p.id 
                      ? 'bg-slate-900 border-slate-900 text-white font-semibold' 
                      : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate pr-1">
                    <span className="block text-xxxxs opacity-60 text-indigo-400">{p.id}</span>
                    <span className="font-display font-medium text-xs font-sans truncate block">{p.modelName}</span>
                  </div>
                  <span className="text-xxxxs bg-slate-100 text-slate-500 shrink-0 px-1 py-0.5 rounded uppercase font-extrabold">
                    {p.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Product 360 Detailed Profile Display layout */}
          {activeProduct ? (
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white border border-slate-205 rounded-xl p-6 shadow-xs">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-705 rounded font-mono text-xxxxs uppercase font-bold">
                  Fórmula Engenharia do Colchão _ {activeProduct.id}
                </span>

                <h3 className="font-display font-bold text-slate-800 text-lg mt-1">{activeProduct.modelName}</h3>
                
                {/* Technical data table in 360 profile */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t pt-4 font-mono text-xxs leading-relaxed">
                  <div>
                    <span className="block text-xxxxs uppercase text-slate-400 font-bold mb-0.5">Tamanho Comercial</span>
                    <strong className="text-slate-805">{activeProduct.category}</strong>
                  </div>
                  <div>
                    <span className="block text-xxxxs uppercase text-slate-400 font-bold mb-0.5">Dimensão do Tampo</span>
                    <strong className="text-slate-805">{activeProduct.dimensions}</strong>
                  </div>
                  <div>
                    <span className="block text-xxxxs uppercase text-slate-400 font-bold mb-0.5">Miolo / Densidade</span>
                    <strong className="text-slate-805">{activeProduct.density}</strong>
                  </div>
                  <div>
                    <span className="block text-xxxxs uppercase text-slate-400 font-bold mb-0.5">Composição Física</span>
                    <strong className="text-slate-805">{activeProduct.composition}</strong>
                  </div>
                </div>
              </div>

              {/* Complete recipe structure BOM and operational manuals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Active BOM recipe components */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <h4 className="font-display font-semibold text-slate-805 text-xs uppercase tracking-wide border-b pb-2">Componentes e Consumo Unitário</h4>
                  
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {boms.find(b => b.productId === selectedProductId)?.items.map((item) => {
                      const mat = materials.find(m => m.id === item.materialId);
                      return (
                        <div key={item.id} className="p-2.5 bg-slate-50 border rounded-lg font-mono text-xxs flex justify-between items-center text-slate-550">
                          <div>
                            <strong className="text-slate-800 font-sans font-medium text-xs block">{mat?.description}</strong>
                            <span>Dose Técnica Consumida: {item.unitConsumption} {mat?.unit}</span>
                          </div>
                          
                          <span className="text-red-500 font-bold shrink-0 border-l pl-3 block text-right">
                            +{item.expectedLossPercent}% Perda
                          </span>
                        </div>
                      );
                    })}
                    {(!boms.find(b => b.productId === selectedProductId)) && (
                      <p className="text-xxs text-slate-400 font-mono text-center py-4">Nenhum BOM técnico configurado para este modelo.</p>
                    )}
                  </div>
                </div>

                {/* Inmetro certificate and manuals associated */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <h4 className="font-display font-semibold text-slate-805 text-xs uppercase tracking-wide border-b pb-2">Instruções e Certificados Inmetro</h4>
                  
                  <div className="space-y-2">
                    {activeProductDocs.map((doc) => (
                      <div key={doc.id} className="p-3 bg-slate-50 rounded-lg border font-mono text-xxs flex justify-between items-center">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <FileText className="w-4 h-4 text-slate-420 shrink-0" />
                          <span className="truncate font-bold text-slate-805">{doc.title}</span>
                        </div>
                        <span className="text-xxxxs bg-indigo-50/80 border border-indigo-200 text-indigo-650 px-1.5 rounded">{doc.type}</span>
                      </div>
                    ))}
                    {activeProductDocs.length === 0 && (
                      <p className="text-xxs text-slate-400 font-mono text-center py-4">Sem certificados ou instruções anexados.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="lg:col-span-2 text-center py-10 text-slate-400">Selecione um colchão da lista.</div>
          )}
        </div>
      )}

    </div>
  );
}
