/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Workflow, 
  Hammer, 
  Plus, 
  MapPin, 
  User, 
  TrendingUp, 
  Gauge, 
  Trash2,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Unit, Sector, ProductionLine, WorkCenter } from '../types';

interface OrganizationalProps {
  units: Unit[];
  sectors: Sector[];
  lines: ProductionLine[];
  workCenters: WorkCenter[];
  onAddUnit: (unit: Unit) => void;
  onAddSector: (sector: Sector) => void;
  onAddLine: (line: ProductionLine) => void;
  onAddWorkCenter: (wc: WorkCenter) => void;
  onDeleteUnit: (id: string) => void;
  onDeleteSector: (id: string) => void;
  onDeleteLine: (id: string) => void;
  onDeleteWorkCenter: (id: string) => void;
  hasWritePermission: boolean;
}

export default function Organizational({
  units,
  sectors,
  lines,
  workCenters,
  onAddUnit,
  onAddSector,
  onAddLine,
  onAddWorkCenter,
  onDeleteUnit,
  onDeleteSector,
  onDeleteLine,
  onDeleteWorkCenter,
  hasWritePermission
}: OrganizationalProps) {
  
  const [activeTab, setActiveTab] = useState<'units' | 'sectors' | 'lines' | 'workCenters'>('units');

  // Form states
  const [unitForm, setUnitForm] = useState({ name: '', type: 'Fábrica' as 'Fábrica' | 'Filial' | 'Centro Produtivo', address: '', manager: '' });
  const [sectorForm, setSectorForm] = useState({ name: '', unitId: '', manager: '', capacityFactor: 1.0 });
  const [lineForm, setLineForm] = useState({ name: '', sectorId: '', status: 'Ativa' as 'Ativa' | 'Inativa' | 'Gargalo', efficiency: 90 });
  const [wcForm, setWcForm] = useState({ id: '', name: '', capacityUnitsHour: 50, efficiencyPercent: 90, availabilityPercent: 95, idleHoursPerWeek: 5 });

  // Handle addition
  const handleUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitForm.name || !unitForm.address) return;
    const newId = `UT-${Math.floor(Math.random() * 900) + 100}`;
    onAddUnit({
      id: newId,
      ...unitForm
    });
    setUnitForm({ name: '', type: 'Fábrica', address: '', manager: '' });
  };

  const handleSectorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectorForm.name || !sectorForm.unitId) return;
    const newId = `SEC-${Math.floor(Math.random() * 900) + 100}`;
    onAddSector({
      id: newId,
      name: sectorForm.name,
      unitId: sectorForm.unitId,
      manager: sectorForm.manager || 'Supervisor',
      capacityFactor: Number(sectorForm.capacityFactor) || 1.0
    });
    setSectorForm({ name: '', unitId: '', manager: '', capacityFactor: 1.0 });
  };

  const handleLineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lineForm.name || !lineForm.sectorId) return;
    const newId = `LN-${Math.floor(Math.random() * 900) + 100}`;
    onAddLine({
      id: newId,
      name: lineForm.name,
      sectorId: lineForm.sectorId,
      status: lineForm.status,
      efficiency: Number(lineForm.efficiency) || 90
    });
    setLineForm({ name: '', sectorId: '', status: 'Ativa', efficiency: 90 });
  };

  const handleWcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wcForm.id || !wcForm.name) return;
    onAddWorkCenter({
      ...wcForm,
      capacityUnitsHour: Number(wcForm.capacityUnitsHour),
      efficiencyPercent: Number(wcForm.efficiencyPercent),
      availabilityPercent: Number(wcForm.availabilityPercent),
      idleHoursPerWeek: Number(wcForm.idleHoursPerWeek)
    });
    setWcForm({ id: '', name: '', capacityUnitsHour: 50, efficiencyPercent: 90, availabilityPercent: 95, idleHoursPerWeek: 5 });
  };

  return (
    <div className="space-y-6">
      {/* Header and Nav tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Estrutura Organizacional</h2>
          <p className="text-xs text-slate-500">Mapeamento de unidades, setores de manufatura, linhas e centros de trabalho (Work Centers).</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('units')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition font-mono flex items-center gap-1.5 ${
              activeTab === 'units' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-rose-500" />
            Unidades ({units.length})
          </button>
          <button
            onClick={() => setActiveTab('sectors')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition font-mono flex items-center gap-1.5 ${
              activeTab === 'sectors' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            Setores ({sectors.length})
          </button>
          <button
            onClick={() => setActiveTab('lines')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition font-mono flex items-center gap-1.5 ${
              activeTab === 'lines' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 text-emerald-500" />
            Linhas ({lines.length})
          </button>
          <button
            onClick={() => setActiveTab('workCenters')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition font-mono flex items-center gap-1.5 ${
              activeTab === 'workCenters' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hammer className="w-3.5 h-3.5 text-amber-500" />
            Centros de Trabalho ({workCenters.length})
          </button>
        </div>
      </div>

      {/* Main Grid: List on Left, Form on Right if permissions match */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Records List (takes 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* TAB 1: UNITS */}
          {activeTab === 'units' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-500">Cadastro de Unidades da Empresa</span>
                <span className="text-xxs font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold">Unidades Totais: {units.length}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {units.map((unit) => (
                  <div key={unit.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-rose-50 text-rose-500 rounded-lg shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-semibold text-slate-800 text-sm">{unit.name}</h4>
                          <span className="px-1.5 py-0.2 bg-rose-50 text-rose-600 font-mono text-xxxxs rounded-md uppercase font-bold tracking-wider">
                            {unit.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-mono">
                          <MapPin className="w-3 h-3 text-slate-400" /> {unit.address}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <User className="w-3 h-3 text-slate-400" /> Gestor Responsável: <strong className="text-slate-700">{unit.manager}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <span className="text-xs font-mono px-2 py-1 bg-slate-100 text-slate-500 rounded-md">ID: {unit.id}</span>
                      {hasWritePermission && (
                        <button
                          onClick={() => onDeleteUnit(unit.id)}
                          className="p-1 px-2 text-xxs text-red-600 hover:bg-red-50 hover:text-red-700 rounded border border-transparent hover:border-red-100 transition"
                          title="Excluir unidade"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SECTORS */}
          {activeTab === 'sectors' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-500">Mapeamento de Processos / Setores Físicos</span>
                <span className="text-xxs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">Setores Atuais: {sectors.length}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {sectors.map((sector) => {
                  const relatedUnit = units.find(u => u.id === sector.unitId);
                  return (
                    <div key={sector.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-blue-50 text-blue-500 rounded-lg shrink-0">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-display font-semibold text-slate-800 text-sm">{sector.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 font-mono">
                            Vinculado a: <span className="text-slate-700 font-medium">{relatedUnit?.name || 'Unidade não encontrada'} ({sector.unitId})</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 font-mono">
                            Supervisor: <strong className="text-slate-700">{sector.manager}</strong>
                            <span className="mx-2">|</span>
                            Fator de Carga: <strong className="text-blue-500">{sector.capacityFactor}x</strong>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <span className="text-xs font-mono px-2 py-1 bg-slate-100 text-slate-500 rounded-md">ID: {sector.id}</span>
                        {hasWritePermission && (
                          <button
                            onClick={() => onDeleteSector(sector.id)}
                            className="p-1 px-2 text-xxs text-red-600 hover:bg-red-50 hover:text-red-700 rounded border border-transparent hover:border-red-100 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LINES */}
          {activeTab === 'lines' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-500">Linhas de Produção Cadastradas</span>
                <span className="text-xxs font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Linhas Totais: {lines.length}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {lines.map((line) => {
                  const relatedSector = sectors.find(s => s.id === line.sectorId);
                  return (
                    <div key={line.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-lg shrink-0">
                          <Workflow className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-semibold text-slate-800 text-sm">{line.name}</h4>
                            <span className={`px-1.5 py-0.2 text-xxxs font-mono rounded-md font-bold ${
                              line.status === 'Ativa' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : line.status === 'Gargalo' 
                                ? 'bg-amber-50 text-amber-500 border border-amber-200' 
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {line.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-mono">
                            Setor: <span className="text-slate-700 font-medium">{relatedSector?.name || 'Setor não cadastrado'} ({line.sectorId})</span>
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xxs text-slate-500 font-mono">Eficiência Operacional Observada:</span>
                            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div style={{ width: `${line.efficiency}%` }} className="bg-emerald-500 h-full"></div>
                            </div>
                            <span className="text-xxs font-mono font-bold text-slate-700">{line.efficiency}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <span className="text-xs font-mono px-2 py-1 bg-slate-100 text-slate-500 rounded-md">ID: {line.id}</span>
                        {hasWritePermission && (
                          <button
                            onClick={() => onDeleteLine(line.id)}
                            className="p-1 px-2 text-xxs text-red-600 hover:bg-red-50 hover:text-red-700 rounded border border-transparent hover:border-red-100 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: WORK CENTERS */}
          {activeTab === 'workCenters' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-500">Mapeamento de Centros de Trabalho (Work Centers) v1</span>
                <span className="text-xxs font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">Estações: {workCenters.length}</span>
              </div>
              <div className="p-4 bg-amber-50/50 border-b border-amber-100">
                <p className="text-xxs text-slate-600 leading-relaxed font-mono">
                  💡 Os Centros de Trabalho na manufatura de colchões (Corte, Costura, Montagem, Tape-Edge, Embalagem) medem a integridade operacional da fábrica determinando velocidade máxima, eficiência produtiva e gargalo real.
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {workCenters.map((wc) => (
                  <div key={wc.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-amber-50 text-amber-500 rounded-lg shrink-0">
                        <Gauge className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-slate-800 text-sm">{wc.name}</h4>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div className="bg-slate-50 p-2 rounded border border-slate-150">
                            <span className="block text-xxxxs uppercase tracking-wider text-slate-400 font-mono font-bold">Capacidade Nominal</span>
                            <span className="text-xs font-mono font-extrabold text-slate-800">{wc.capacityUnitsHour} un/h</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded border border-slate-150">
                            <span className="block text-xxxxs uppercase tracking-wider text-slate-400 font-mono font-bold">Eficiência (OEE)</span>
                            <span className="text-xs font-mono font-extrabold text-emerald-600">{wc.efficiencyPercent}%</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded border border-slate-150">
                            <span className="block text-xxxxs uppercase tracking-wider text-slate-400 font-mono font-bold">Disponibilidade</span>
                            <span className="text-xs font-mono font-extrabold text-blue-600">{wc.availabilityPercent}%</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded border border-slate-150">
                            <span className="block text-xxxxs uppercase tracking-wider text-slate-400 font-mono font-bold">Ociosidade Média</span>
                            <span className="text-xs font-mono font-extrabold text-slate-500">{wc.idleHoursPerWeek}h/sem</span>
                          </div>
                        </div>

                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <span className="text-xs font-mono px-2 py-1 bg-slate-100 text-slate-400 rounded-md">{wc.id}</span>
                      {hasWritePermission && (
                        <button
                          onClick={() => onDeleteWorkCenter(wc.id)}
                          className="p-1 px-2 text-xxs text-red-600 hover:bg-red-50 hover:text-red-700 rounded border border-transparent hover:border-red-100 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Add Form Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs h-fit">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-display font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
              <Plus className="w-4 h-4 text-orange-500" />
              Novo Cadastro
            </h3>
            <p className="text-xxs text-slate-500 font-mono mt-0.5">Adicionar na tabela selecionada</p>
          </div>

          {!hasWritePermission ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl text-xxs font-mono space-y-1">
              <p className="font-bold flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Acesso de Leitura Apenas
              </p>
              <p>O perfil atual não tem autorização para incluir ou alterar registros desta seção.</p>
            </div>
          ) : (
            <div>
              {/* FORM UNITS */}
              {activeTab === 'units' && (
                <form onSubmit={handleUnitSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500">Nome da Unidade *</label>
                    <input
                      type="text"
                      placeholder="Ex: Planta Filial Curitiba"
                      value={unitForm.name}
                      onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500">Tipo da Planta *</label>
                    <select
                      value={unitForm.type}
                      onChange={(e) => setUnitForm({ ...unitForm, type: e.target.value as any })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                    >
                      <option value="Fábrica">Fábrica (Produção Central)</option>
                      <option value="Filial">Filial (Estoque/Distribuição)</option>
                      <option value="Centro Produtivo">Centro Produtivo (Parcial)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500">Endereço Completo *</label>
                    <input
                      type="text"
                      placeholder="Logradouro, Bairro - Cidade/UF"
                      value={unitForm.address}
                      onChange={(e) => setUnitForm({ ...unitForm, address: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500">Gestor Responsável</label>
                    <input
                      type="text"
                      placeholder="Nome do Diretor / Engenheiro"
                      value={unitForm.manager}
                      onChange={(e) => setUnitForm({ ...unitForm, manager: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white font-mono text-xs py-2.5 hover:bg-slate-800 transition rounded-lg"
                  >
                    Salvar Unidade
                  </button>
                </form>
              )}

              {/* FORM SECTORS */}
              {activeTab === 'sectors' && (
                <form onSubmit={handleSectorSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500">Nome do Setor *</label>
                    <input
                      type="text"
                      placeholder="Ex: Linha de Costura"
                      value={sectorForm.name}
                      onChange={(e) => setSectorForm({ ...sectorForm, name: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500">Unidade Vinculada *</label>
                    <select
                      value={sectorForm.unitId}
                      onChange={(e) => setSectorForm({ ...sectorForm, unitId: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                      required
                    >
                      <option value="">Selecione uma Unidade...</option>
                      {units.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500">Supervisor de Setor</label>
                    <input
                      type="text"
                      placeholder="Nome do Supervisor"
                      value={sectorForm.manager}
                      onChange={(e) => setSectorForm({ ...sectorForm, manager: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500">Fator de Carga Capacidade</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="3.0"
                      value={sectorForm.capacityFactor}
                      onChange={(e) => setSectorForm({ ...sectorForm, capacityFactor: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white font-mono text-xs py-2.5 hover:bg-slate-800 transition rounded-lg"
                  >
                    Salvar Setor
                  </button>
                </form>
              )}

              {/* FORM LINES */}
              {activeTab === 'lines' && (
                <form onSubmit={handleLineSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500">Nome da Linha *</label>
                    <input
                      type="text"
                      placeholder="Ex: Linha de Costura de Bordas B"
                      value={lineForm.name}
                      onChange={(e) => setLineForm({ ...lineForm, name: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500">Setor Correspondente *</label>
                    <select
                      value={lineForm.sectorId}
                      onChange={(e) => setLineForm({ ...lineForm, sectorId: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                      required
                    >
                      <option value="">Selecione um Setor...</option>
                      {sectors.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500">Status Operacional *</label>
                    <select
                      value={lineForm.status}
                      onChange={(e) => setLineForm({ ...lineForm, status: e.target.value as any })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                    >
                      <option value="Ativa">Ativa</option>
                      <option value="Inativa">Inativa</option>
                      <option value="Gargalo">Gargalo Crítico</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500">Eficiência Calculada %</label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={lineForm.efficiency}
                      onChange={(e) => setLineForm({ ...lineForm, efficiency: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white font-mono text-xs py-2.5 hover:bg-slate-800 transition rounded-lg"
                  >
                    Salvar Linha de Produção
                  </button>
                </form>
              )}

              {/* FORM WORK CENTERS */}
              {activeTab === 'workCenters' && (
                <form onSubmit={handleWcSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500">Código Centro Trabalho *</label>
                    <input
                      type="text"
                      placeholder="Ex: WC-TAPE"
                      value={wcForm.id}
                      onChange={(e) => setWcForm({ ...wcForm, id: e.target.value.toUpperCase() })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded-lg focus:outline-hidden focus:border-orange-500 uppercase font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500">Nome Estação Manufatura *</label>
                    <input
                      type="text"
                      placeholder="Ex: Estação Tape Edge Fechamento"
                      value={wcForm.name}
                      onChange={(e) => setWcForm({ ...wcForm, name: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500">Capacidade Nominal (unidades/hora)</label>
                    <input
                      type="number"
                      value={wcForm.capacityUnitsHour}
                      onChange={(e) => setWcForm({ ...wcForm, capacityUnitsHour: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxxxs font-mono uppercase tracking-wider mb-1 text-slate-400 font-bold">OEE / Eficiência %</label>
                      <input
                        type="number"
                        min="20"
                        max="100"
                        value={wcForm.efficiencyPercent}
                        onChange={(e) => setWcForm({ ...wcForm, efficiencyPercent: Number(e.target.value) })}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-mono uppercase tracking-wider mb-1 text-slate-400 font-bold">Disponibilidade %</label>
                      <input
                        type="number"
                        min="20"
                        max="100"
                        value={wcForm.availabilityPercent}
                        onChange={(e) => setWcForm({ ...wcForm, availabilityPercent: Number(e.target.value) })}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500">Tempo Ocioso Estimado (horas/semana)</label>
                    <input
                      type="number"
                      value={wcForm.idleHoursPerWeek}
                      onChange={(e) => setWcForm({ ...wcForm, idleHoursPerWeek: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white font-mono text-xs py-2.5 hover:bg-slate-800 transition rounded-lg"
                  >
                    Salvar Centro de Trabalho
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
