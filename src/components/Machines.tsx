/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Cpu, 
  Wrench, 
  Plus, 
  Trash2, 
  Activity, 
  Settings, 
  Clock, 
  Calendar, 
  ShieldAlert, 
  Compass, 
  FileText, 
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Filter
} from 'lucide-react';
import { Machine, Tool, Sector, MachineStatus } from '../types';

interface MachinesProps {
  machines: Machine[];
  tools: Tool[];
  sectors: Sector[];
  onAddMachine: (machine: Machine) => void;
  onAddTool: (tool: Tool) => void;
  onUpdateMachineStatus: (id: string, status: MachineStatus) => void;
  onDeleteMachine: (id: string) => void;
  onDeleteTool: (id: string) => void;
  hasWritePermission: boolean;
}

export default function Machines({
  machines,
  tools,
  sectors,
  onAddMachine,
  onAddTool,
  onUpdateMachineStatus,
  onDeleteMachine,
  onDeleteTool,
  hasWritePermission
}: MachinesProps) {
  
  const [activeSubTab, setActiveSubTab] = useState<'machines' | 'tools'>('machines');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('ALL');

  // Form states for Machine
  const [macForm, setMacForm] = useState({
    id: '', name: '', category: 'Laminadora', manufacturer: '', model: '',
    serialNumber: '', acquisitionDate: '', warrantyUntil: '', location: '',
    sectorId: '', status: 'Operando' as MachineStatus,
    capacityTheoretical: 50, capacityOperational: 40, capacityObserved: 35
  });

  // Form states for Tool
  const [toolForm, setToolForm] = useState({
    id: '', name: '', category: 'Ferramenta' as 'Ferramenta' | 'Equipamento' | 'Instrumento',
    sectorId: '', location: '', status: 'Disponível' as any, lastInspectionDate: '', calibrationDue: ''
  });

  const handleMachineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!macForm.id || !macForm.name || !macForm.sectorId) return;
    
    onAddMachine({
      ...macForm,
      capacityTheoretical: Number(macForm.capacityTheoretical) || 0,
      capacityOperational: Number(macForm.capacityOperational) || 0,
      capacityObserved: Number(macForm.capacityObserved) || 0,
      documentCount: 0
    });
    
    // reset
    setMacForm({
      id: '', name: '', category: 'Laminadora', manufacturer: '', model: '',
      serialNumber: '', acquisitionDate: '', warrantyUntil: '', location: '',
      sectorId: '', status: 'Operando',
      capacityTheoretical: 50, capacityOperational: 40, capacityObserved: 35
    });
  };

  const handleToolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolForm.id || !toolForm.name || !toolForm.sectorId) return;
    
    onAddTool({
      id: toolForm.id,
      name: toolForm.name,
      category: toolForm.category,
      sectorId: toolForm.sectorId,
      location: toolForm.location || 'Bancada Geral',
      status: toolForm.status,
      lastInspectionDate: toolForm.lastInspectionDate || new Date().toISOString().split('T')[0],
      calibrationDue: toolForm.category === 'Instrumento' ? toolForm.calibrationDue : undefined
    });

    // reset
    setToolForm({
      id: '', name: '', category: 'Ferramenta',
      sectorId: '', location: '', status: 'Disponível', lastInspectionDate: '', calibrationDue: ''
    });
  };

  // Filter machines or tools based on sector
  const filteredMachines = selectedSectorFilter === 'ALL'
    ? machines
    : machines.filter(m => m.sectorId === selectedSectorFilter);

  const filteredTools = selectedSectorFilter === 'ALL'
    ? tools
    : tools.filter(t => t.sectorId === selectedSectorFilter);

  return (
    <div className="space-y-6">
      
      {/* Module Title and Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Maquinário &amp; Ferramentaria</h2>
          <p className="text-xs text-slate-500">Mapeamento integrado de equipamentos industriais CNC, prensas pneumáticas e calibração de instrumentos.</p>
        </div>

        {/* Tab switchers + Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sector filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedSectorFilter}
              onChange={(e) => setSelectedSectorFilter(e.target.value)}
              className="text-xs font-mono bg-transparent focus:outline-hidden text-slate-800"
            >
              <option value="ALL">Todos os Setores</option>
              {sectors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex bg-slate-150 p-1 rounded-lg">
            <button
              onClick={() => setActiveSubTab('machines')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition font-mono flex items-center gap-1.5 ${
                activeSubTab === 'machines' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-orange-500" />
              Ativos Industriais ({filteredMachines.length})
            </button>
            <button
              onClick={() => setActiveSubTab('tools')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition font-mono flex items-center gap-1.5 ${
                activeSubTab === 'tools' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-blue-500" />
              Ferramental / Instrumentos ({filteredTools.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main layout: Table / Grid and Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Table & Cards (takes 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          
          {activeSubTab === 'machines' ? (
            /* MACHINES VIEW */
            <div className="space-y-4">
              
              {/* Status Counters */}
              <div className="grid grid-cols-4 gap-3 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                <div className="bg-white p-3 rounded-lg border border-slate-150 text-center">
                  <span className="block text-xxxxs font-mono uppercase text-slate-400 font-bold">Operando</span>
                  <span className="text-sm font-mono font-bold text-emerald-600">{machines.filter(m => m.status === 'Operando').length}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-150 text-center">
                  <span className="block text-xxxxs font-mono uppercase text-slate-400 font-bold">Paradas</span>
                  <span className="text-sm font-mono font-bold text-amber-500">{machines.filter(m => m.status === 'Parada').length}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-150 text-center">
                  <span className="block text-xxxxs font-mono uppercase text-slate-400 font-bold">Preventiva</span>
                  <span className="text-sm font-mono font-bold text-blue-500">{machines.filter(m => m.status === 'Manutenção').length}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-150 text-center">
                  <span className="block text-xxxxs font-mono uppercase text-slate-400 font-bold">Inativas</span>
                  <span className="text-sm font-mono font-bold text-slate-500">{machines.filter(m => m.status === 'Inativa').length}</span>
                </div>
              </div>

              {/* Machines list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMachines.map((machine) => {
                  const relatedSector = sectors.find(s => s.id === machine.sectorId);
                  return (
                    <div 
                      key={machine.id} 
                      className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-slate-350"
                    >
                      <div>
                        {/* Title Row */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xxxxs font-mono bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded-md font-bold">
                              {machine.id}
                            </span>
                            <h3 className="font-display font-bold text-slate-800 text-sm mt-1">{machine.name}</h3>
                            <p className="text-xxs text-slate-500 font-mono">{machine.category} • {machine.manufacturer}</p>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {/* Interactive Quick Status Toggle */}
                            <select
                              value={machine.status}
                              disabled={!hasWritePermission}
                              onChange={(e) => onUpdateMachineStatus(machine.id, e.target.value as MachineStatus)}
                              className={`text-xxx/relaxed font-mono px-2 py-0.5 rounded font-extrabold cursor-pointer focus:outline-hidden ${
                                machine.status === 'Operando' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                machine.status === 'Parada' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                machine.status === 'Manutenção' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              <option value="Operando">● OPERANDO</option>
                              <option value="Parada">▲ PARADA</option>
                              <option value="Manutenção">⚙ MANUTENÇÃO</option>
                              <option value="Inativa">■ INATIVA</option>
                            </select>
                          </div>
                        </div>

                        {/* Machine details block */}
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 mt-3">
                          <p className="text-xxs font-mono text-slate-600 flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-slate-400" /> Coordenada: <strong className="text-slate-800">{machine.location}</strong>
                          </p>
                          <p className="text-xxs font-mono text-slate-600 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-slate-400" /> Setor: <strong className="text-slate-700">{relatedSector?.name || 'Não atribuído'}</strong>
                          </p>
                        </div>

                        {/* Capacities Section */}
                        <div className="mt-3.5 space-y-2">
                          <div className="flex items-center justify-between text-xxxxs uppercase tracking-wider text-slate-400 font-bold font-mono">
                            <span>Capacidade Produtiva (peças/h)</span>
                            <span>Econômico</span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-lg border">
                            <div className="text-center border-r border-slate-200 pr-1">
                              <span className="block text-xxxxxx font-mono font-bold uppercase text-slate-400">Teorica</span>
                              <span className="text-xxs font-mono font-extrabold text-slate-700">{machine.capacityTheoretical}/h</span>
                            </div>
                            <div className="text-center border-r border-slate-200 pr-1">
                              <span className="block text-xxxxxx font-mono font-bold uppercase text-slate-400">Operacional</span>
                              <span className="text-xxs font-mono font-extrabold text-slate-700">{machine.capacityOperational}/h</span>
                            </div>
                            <div className="text-center">
                              <span className="block text-xxxxxx font-mono font-bold uppercase text-slate-400">Observada</span>
                              <span className="text-xxs font-mono font-extrabold text-orange-500">{machine.capacityObserved}/h</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions inside Machine Card */}
                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-between items-center text-xxs font-mono text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> Garantia: {machine.warrantyUntil}
                        </span>
                        {hasWritePermission && (
                          <button
                            onClick={() => onDeleteMachine(machine.id)}
                            className="p-1 text-red-600 hover:bg-red-50 hover:text-red-700 rounded border border-transparent hover:border-red-100 transition"
                            title="Remover máquina"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredMachines.length === 0 && (
                  <div className="col-span-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
                    Nenhuma máquina cadastrada para este setor.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TOOLS VIEW */
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-500">
                  Controle de Ferramentaria e Equipamentos Secundários
                </span>
                <span className="text-xxs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  Instrumentos: {tools.length}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredTools.map((tool) => {
                  const relatedSector = sectors.find(s => s.id === tool.sectorId);
                  return (
                    <div key={tool.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 text-blue-500 rounded-lg shrink-0 mt-0.5">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-semibold text-slate-850 text-xs">{tool.name}</h4>
                            <span className={`px-1.5 py-0.2 text-xxxxs font-mono rounded font-extrabold ${
                              tool.category === 'Instrumento' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              tool.category === 'Equipamento' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                              'bg-slate-50 text-slate-700 border border-slate-200'
                            }`}>
                              {tool.category}
                            </span>
                          </div>
                          
                          <p className="text-xxs text-slate-500 mt-1 font-mono">
                            Localização: <strong className="text-slate-700">{tool.location}</strong> ({relatedSector?.name || 'Sem Setor'})
                          </p>

                          {/* Calibration details if tool is instrument */}
                          {tool.category === 'Instrumento' && (
                            <div className="mt-1 flex items-center gap-2 text-xxxxs uppercase font-mono font-bold">
                              <span className="text-slate-400">Inspeção: {tool.lastInspectionDate}</span>
                              <span className="text-slate-300">|</span>
                              {tool.calibrationDue && (
                                <span className={
                                  new Date(tool.calibrationDue) < new Date() ? "text-red-500" : "text-emerald-600"
                                }>
                                  Calibração Limite: {tool.calibrationDue}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-center">
                        <span className={`px-2 py-0.5 text-xxxs font-mono rounded font-extrabold uppercase ${
                          tool.status === 'Disponível' ? 'bg-emerald-50 text-emerald-700' :
                          tool.status === 'Em Uso' ? 'bg-blue-50 text-blue-700' :
                          tool.status === 'Em Calibração' ? 'bg-amber-50 text-amber-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {tool.status}
                        </span>

                        <span className="text-xxs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                          {tool.id}
                        </span>

                        {hasWritePermission && (
                          <button
                            onClick={() => onDeleteTool(tool.id)}
                            className="p-1 text-red-650 hover:bg-slate-100 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredTools.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs font-mono">
                    Nenhum item de ferramentaria encontrado para este filtro.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Form Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs h-fit">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-display font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
              <Plus className="w-4 h-4 text-orange-500" />
              Novo Ativo Industrial
            </h3>
            <p className="text-xxs text-slate-500 font-mono mt-0.5">Mapear equipamentos e instrumentos</p>
          </div>

          {!hasWritePermission ? (
            <div className="bg-amber-50 border border-amber-100 text-amber-700 p-4 rounded-xl text-xxs font-mono">
              Usuário logado possui perfil de Leitor e não pode alterar os cadastros e dados de maquinário.
            </div>
          ) : (
            <div>
              {/* MACHINE REGISTRATION FORM */}
              {activeSubTab === 'machines' && (
                <form onSubmit={handleMachineSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">CÓDIGO *</label>
                      <input
                        type="text"
                        placeholder="MAC-COR-03"
                        value={macForm.id}
                        onChange={(e) => setMacForm({ ...macForm, id: e.target.value.toUpperCase() })}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-250 rounded focus:outline-hidden focus:border-orange-500 font-mono uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">SETOR *</label>
                      <select
                        value={macForm.sectorId}
                        onChange={(e) => setMacForm({ ...macForm, sectorId: e.target.value })}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-hidden"
                        required
                      >
                        <option value="">Selecionar...</option>
                        {sectors.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">NOME DA MÁQUINA *</label>
                    <input
                      type="text"
                      placeholder="Ex: Laminadora Horizontal Albrecht"
                      value={macForm.name}
                      onChange={(e) => setMacForm({ ...macForm, name: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-250 rounded focus:outline-hidden"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">CATEGORIA</label>
                      <input
                        type="text"
                        placeholder="Ex: Costura"
                        value={macForm.category}
                        onChange={(e) => setMacForm({ ...macForm, category: e.target.value })}
                        className="w-full text-xs p-2 bg-slate-50 border"
                      />
                    </div>
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono font-bold">STATUS INICIAL</label>
                      <select
                        value={macForm.status}
                        onChange={(e) => setMacForm({ ...macForm, status: e.target.value as any })}
                        className="w-full text-xs p-2 bg-slate-50 border"
                      >
                        <option value="Operando">Operando</option>
                        <option value="Parada">Parada</option>
                        <option value="Manutenção">Manutenção</option>
                        <option value="Inativa">Inativa</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 bg-slate-50 p-2.5 rounded border border-slate-200">
                    <span className="col-span-3 text-xxxxs font-mono text-slate-400 uppercase font-bold text-center block mb-1">
                      Capacidade p/ hora (un/h)
                    </span>
                    <div>
                      <label className="block text-xxxxxx font-mono font-bold text-slate-400 uppercase text-center">Teorica</label>
                      <input
                        type="number"
                        value={macForm.capacityTheoretical}
                        onChange={(e) => setMacForm({ ...macForm, capacityTheoretical: Number(e.target.value) })}
                        className="w-full text-center text-xs p-1 bg-white border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xxxxxx font-mono font-bold text-slate-400 uppercase text-center">Operac.</label>
                      <input
                        type="number"
                        value={macForm.capacityOperational}
                        onChange={(e) => setMacForm({ ...macForm, capacityOperational: Number(e.target.value) })}
                        className="w-full text-center text-xs p-1 bg-white border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xxxxxx font-mono font-bold text-slate-400 uppercase text-center">Observ.</label>
                      <input
                        type="number"
                        value={macForm.capacityObserved}
                        onChange={(e) => setMacForm({ ...macForm, capacityObserved: Number(e.target.value) })}
                        className="w-full text-center text-xs p-1 bg-white border rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">FABRICANTE</label>
                      <input
                        type="text"
                        placeholder="Albrecht"
                        value={macForm.manufacturer}
                        onChange={(e) => setMacForm({ ...macForm, manufacturer: e.target.value })}
                        className="w-full text-xs p-2 bg-slate-50 border"
                      />
                    </div>
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">MODELO</label>
                      <input
                        type="text"
                        value={macForm.model}
                        onChange={(e) => setMacForm({ ...macForm, model: e.target.value })}
                        className="w-full text-xs p-2 bg-slate-50 border"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">Nº DE SÉRIE</label>
                      <input
                        type="text"
                        value={macForm.serialNumber}
                        onChange={(e) => setMacForm({ ...macForm, serialNumber: e.target.value })}
                        className="w-full text-xs p-2 bg-slate-50 border font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">GUARDA COORDENADA</label>
                      <input
                        type="text"
                        placeholder="Ex: Pavilhão B"
                        value={macForm.location}
                        onChange={(e) => setMacForm({ ...macForm, location: e.target.value })}
                        className="w-full text-xs p-2 bg-slate-50 border"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxxxs uppercase font-mono font-bold mb-1 text-slate-400">DATA AQUISIÇÃO</label>
                      <input
                        type="date"
                        value={macForm.acquisitionDate}
                        onChange={(e) => setMacForm({ ...macForm, acquisitionDate: e.target.value })}
                        className="w-full text-xs p-1.5 bg-slate-50 border"
                      />
                    </div>
                    <div>
                      <label className="block text-xxxxs uppercase font-mono font-bold mb-1 text-slate-400">VIGENCIA GARANTIA</label>
                      <input
                        type="date"
                        value={macForm.warrantyUntil}
                        onChange={(e) => setMacForm({ ...macForm, warrantyUntil: e.target.value })}
                        className="w-full text-xs p-1.5 bg-slate-50 border"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 transition text-white font-mono text-xs py-2.5 rounded-lg"
                  >
                    Mapear Ativo Industrial
                  </button>
                </form>
              )}

              {/* TOOL REGISTRATION FORM */}
              {activeSubTab === 'tools' && (
                <form onSubmit={handleToolSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">CÓDIGO *</label>
                      <input
                        type="text"
                        placeholder="FER-007"
                        value={toolForm.id}
                        onChange={(e) => setToolForm({ ...toolForm, id: e.target.value.toUpperCase() })}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-250 rounded font-mono uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">CATEGORIA *</label>
                      <select
                        value={toolForm.category}
                        onChange={(e) => setToolForm({ ...toolForm, category: e.target.value as any })}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded"
                        required
                      >
                        <option value="Ferramenta">Ferramenta</option>
                        <option value="Equipamento">Equipamento</option>
                        <option value="Instrumento">Instrumento (Medidor)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">NOME / ESPECIFICAÇÃO *</label>
                    <input
                      type="text"
                      placeholder="Ex: Trena à laser Leica D810"
                      value={toolForm.name}
                      onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-250 rounded"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">SETOR RESPONSÁVEL *</label>
                      <select
                        value={toolForm.sectorId}
                        onChange={(e) => setToolForm({ ...toolForm, sectorId: e.target.value })}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded"
                        required
                      >
                        <option value="">Selecione...</option>
                        {sectors.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">LOCAL NO SETOR</label>
                      <input
                        type="text"
                        placeholder="Ex: Painel 2"
                        value={toolForm.location}
                        onChange={(e) => setToolForm({ ...toolForm, location: e.target.value })}
                        className="w-full text-xs p-2 bg-slate-50 border"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono font-bold">STATUS</label>
                      <select
                        value={toolForm.status}
                        onChange={(e) => setToolForm({ ...toolForm, status: e.target.value as any })}
                        className="w-full text-xs p-2 bg-slate-50 border"
                      >
                        <option value="Disponível">Disponível</option>
                        <option value="Em Uso">Em Uso</option>
                        <option value="Em Calibração">Em Calibração</option>
                        <option value="Danificado">Danificado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">ÚLTIMA INSPEÇÃO</label>
                      <input
                        type="date"
                        value={toolForm.lastInspectionDate}
                        onChange={(e) => setToolForm({ ...toolForm, lastInspectionDate: e.target.value })}
                        className="w-full text-xs p-1 bg-slate-50 border font-mono"
                      />
                    </div>
                  </div>

                  {toolForm.category === 'Instrumento' && (
                    <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                      <label className="block text-xxxxs uppercase tracking-wider font-semibold mb-1 text-amber-700 font-mono">LIMITE DE CALIBRAÇÃO OBRIGATÓRIO *</label>
                      <input
                        type="date"
                        value={toolForm.calibrationDue}
                        onChange={(e) => setToolForm({ ...toolForm, calibrationDue: e.target.value })}
                        className="w-full text-xs p-2 bg-white border border-amber-200 rounded font-mono"
                        required={toolForm.category === 'Instrumento'}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 transition text-white font-mono text-xs py-2.5 rounded-lg"
                  >
                    Salvar Item Ferramental
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
