/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Layers3, 
  Truck, 
  Plus, 
  Trash2, 
  Star, 
  AlertOctagon, 
  ShieldCheck, 
  Mail, 
  Phone, 
  FileText, 
  Tag, 
  ChevronRight,
  TrendingDown,
  Clock
} from 'lucide-react';
import { RawMaterial, Supplier, MaterialCategory } from '../types';

interface MaterialsProps {
  materials: RawMaterial[];
  suppliers: Supplier[];
  onAddMaterial: (material: RawMaterial) => void;
  onAddSupplier: (supplier: Supplier) => void;
  onDeleteMaterial: (id: string) => void;
  onDeleteSupplier: (id: string) => void;
  hasWritePermission: boolean;
}

export default function Materials({
  materials,
  suppliers,
  onAddMaterial,
  onAddSupplier,
  onDeleteMaterial,
  onDeleteSupplier,
  hasWritePermission
}: MaterialsProps) {
  
  const [activeSubTab, setActiveSubTab] = useState<'materials' | 'suppliers'>('materials');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Form states for Raw Material
  const [matForm, setMatForm] = useState({
    id: '', description: '', category: 'Espumas' as MaterialCategory,
    unit: 'kg' as any, mainSupplierId: '', minStock: 100, currentStock: 200
  });

  // Form states for Supplier
  const [supForm, setSupForm] = useState({
    id: '', corporateName: '', tradeName: '', cnpj: '',
    contactName: '', contactPhone: '', contactEmail: '',
    materialsSuppliedRaw: '', leadTimeDays: 10, evaluationScore: 5
  });

  const handleMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matForm.id || !matForm.description || !matForm.mainSupplierId) return;

    onAddMaterial({
      ...matForm,
      minStock: Number(matForm.minStock) || 0,
      currentStock: Number(matForm.currentStock) || 0
    });

    setMatForm({
      id: '', description: '', category: 'Espumas',
      unit: 'kg', mainSupplierId: '', minStock: 100, currentStock: 200
    });
  };

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supForm.id || !supForm.corporateName || !supForm.tradeName) return;

    const materialsArray = supForm.materialsSuppliedRaw
      ? supForm.materialsSuppliedRaw.split(',').map(m => m.trim())
      : ['Lotes Diversos'];

    onAddSupplier({
      id: supForm.id,
      corporateName: supForm.corporateName,
      tradeName: supForm.tradeName,
      cnpj: supForm.cnpj,
      contactName: supForm.contactName,
      contactPhone: supForm.contactPhone,
      contactEmail: supForm.contactEmail,
      materialsSupplied: materialsArray,
      leadTimeDays: Number(supForm.leadTimeDays) || 5,
      evaluationScore: Number(supForm.evaluationScore) || 5
    });

    setSupForm({
      id: '', corporateName: '', tradeName: '', cnpj: '',
      contactName: '', contactPhone: '', contactEmail: '',
      materialsSuppliedRaw: '', leadTimeDays: 10, evaluationScore: 5
    });
  };

  // Filter materials list by category
  const filteredMaterials = selectedCategoryFilter === 'ALL'
    ? materials
    : materials.filter(m => m.category === selectedCategoryFilter);

  return (
    <div className="space-y-6">
      
      {/* Title & Tabs Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Cadeia de Suprimentos &amp; Insumos</h2>
          <p className="text-xs text-slate-500">Gestão integrada de fórmulas químicas de espumação (TDI/Poliol), tecidos jacquard, bobinas e controle de fornecedores.</p>
        </div>

        {/* Sub tabs switches */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveSubTab('materials')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition font-mono flex items-center gap-1.5 ${
              activeSubTab === 'materials' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers3 className="w-3.5 h-3.5 text-cyan-600" />
            Matéria-Prima ({materials.length})
          </button>
          <button
            onClick={() => setActiveSubTab('suppliers')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition font-mono flex items-center gap-1.5 ${
              activeSubTab === 'suppliers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-orange-500" />
            Cadastro Fornecedores ({suppliers.length})
          </button>
        </div>
      </div>

      {/* Main split dashboard list + Add Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column - list items (takes 2 widths) */}
        <div className="lg:col-span-2 space-y-4">
          
          {activeSubTab === 'materials' ? (
            /* RAW MATERIAL MODULE VIEW */
            <div className="space-y-4">
              
              {/* Category Quick Filter badges */}
              <div className="flex flex-wrap gap-2">
                {['ALL', 'Espumas', 'Tecidos', 'Linhas', 'Colas', 'Embalagens', 'Etiquetas', 'Acessórios'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-xxs font-mono rounded-lg border transition ${
                      selectedCategoryFilter === cat 
                        ? 'bg-slate-900 border-slate-900 text-white font-semibold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat === 'ALL' ? 'Todas MP' : cat}
                  </button>
                ))}
              </div>

              {/* Items Grid/List */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center text-xxs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  <span>Insumo Industrial / Especificação</span>
                  <span>Disponibilidade Almoxarifado</span>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {filteredMaterials.map((material) => {
                    const isLowStock = material.currentStock <= material.minStock;
                    const mainSup = suppliers.find(s => s.id === material.mainSupplierId);
                    
                    return (
                      <div key={material.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-lg font-mono text-xs font-bold shrink-0 text-center uppercase min-w-14 ${
                            material.category === 'Espumas' ? 'bg-amber-50 text-amber-600 border border-amber-250' :
                            material.category === 'Tecidos' ? 'bg-indigo-50 text-indigo-700 border border-indigo-250' :
                            material.category === 'Colas' ? 'bg-teal-50 text-teal-700 border border-teal-220' :
                            'bg-slate-50 text-slate-700 border border-slate-200'
                          }`}>
                            <span className="block text-xxxxs opacity-60">CAT</span>
                            {material.category.slice(0, 4)}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-display font-semibold text-slate-800 text-xs">{material.description}</h4>
                              <span className="text-xxs px-1.5 py-0.2 bg-slate-100 text-slate-500 font-mono rounded font-bold">
                                {material.id}
                              </span>
                            </div>
                            
                            <p className="text-xxs text-slate-500 mt-1 font-mono">
                              Unidade: <strong className="text-slate-700">{material.unit}</strong>
                              <span className="mx-2">|</span>
                              Fornecedor: <span className="text-slate-600 font-medium">{mainSup?.tradeName || 'Deter. no pedido'}</span>
                            </p>
                          </div>
                        </div>

                        {/* Inventory state and warning alert */}
                        <div className="flex items-center gap-4 justify-between md:justify-end">
                          <div className="text-right">
                            <span className="text-xxxxs uppercase font-mono tracking-wider font-bold block text-slate-400">Estoque Atual</span>
                            
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className={`text-sm font-bold ${isLowStock ? 'text-red-500 font-black' : 'text-slate-800'}`}>
                                {material.currentStock} {material.unit}
                              </span>
                              
                              <span className="text-xxs text-slate-400 font-medium">
                                (Min: {material.minStock})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isLowStock ? (
                              <span className="px-2 py-1 bg-red-50 border border-red-200 text-red-700 font-mono text-xxxxs uppercase font-bold rounded flex items-center gap-0.5 animate-pulse">
                                <AlertOctagon className="w-3 h-3 inline text-red-600" /> RECOMPRAR
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 font-mono text-xxxxs uppercase font-bold rounded">
                                OK
                              </span>
                            )}

                            {hasWritePermission && (
                              <button
                                onClick={() => onDeleteMaterial(material.id)}
                                className="p-1 px-1.5 text-xxs text-red-600 hover:bg-slate-150 rounded"
                                title="Excluir insumo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredMaterials.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-xs font-mono">
                      Nenhum material cadastrado nesta categoria de insumos.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* SUPPLIERS MODULE VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    {/* Trade Name */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xxxxs font-mono bg-orange-50 text-orange-700 px-1.5 py-0.2 rounded font-bold uppercase">
                          {supplier.id}
                        </span>
                        <h3 className="font-display font-bold text-slate-800 text-sm mt-1">{supplier.tradeName}</h3>
                        <p className="text-xxs text-slate-500 font-mono leading-tight">{supplier.corporateName}</p>
                      </div>

                      {/* Stars evaluation rating */}
                      <div className="flex items-center bg-slate-50 border border-slate-150 p-1 px-1.5 rounded-lg text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500 mr-0.5" />
                        <span className="text-xs font-mono font-bold text-slate-700">{supplier.evaluationScore.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="mt-3.5 space-y-1.5 text-xxs font-mono text-slate-650">
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>Email: <strong className="text-slate-800">{supplier.contactEmail}</strong></span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Contat: <strong className="text-slate-800">{supplier.contactName} ({supplier.contactPhone})</strong></span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Faturamento Médio Lead Time: <strong className="text-orange-600 font-bold">{supplier.leadTimeDays} dias</strong></span>
                      </p>
                      <p className="text-xxxxs uppercase font-bold text-slate-400 mt-2">CNPJ: {supplier.cnpj}</p>
                    </div>

                    {/* Tags of supplied materials */}
                    <div className="mt-4 flex flex-wrap gap-1">
                      {supplier.materialsSupplied.map((tag, i) => (
                        <span key={i} className="text-xxxxs bg-slate-100 text-slate-600 p-1 px-1.5 font-mono rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="border-t border-slate-100 mt-4 pt-3 flex justify-between items-center text-xxs font-mono">
                    <span className="text-slate-405">Garantia Integrada</span>
                    {hasWritePermission && (
                      <button
                        onClick={() => onDeleteSupplier(supplier.id)}
                        className="text-red-650 hover:text-red-700 flex items-center justify-center p-1 rounded font-bold"
                        title="Excluir fornecedor"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500 hover:scale-105" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right column - Add Form Control (Standard width) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs h-fit">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-display font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
              <Plus className="w-4 h-4 text-orange-500" />
              Novo Registro MP
            </h3>
            <p className="text-xxs text-slate-500 font-mono mt-0.5">Entrada de insumos e credenciamento de parceiros</p>
          </div>

          {!hasWritePermission ? (
            <div className="bg-amber-50 text-amber-700 border border-amber-200 p-4 rounded-xl text-xxs font-mono font-medium">
              Acesso negado para criação. Perfil atual possui restrição de escrita pela gerência.
            </div>
          ) : (
            <div>
              {/* RAW MATERIAL FORM */}
              {activeSubTab === 'materials' && (
                <form onSubmit={handleMaterialSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">Código MP *</label>
                      <input
                        type="text"
                        placeholder="MAT-ESP-D45"
                        value={matForm.id}
                        onChange={(e) => setMatForm({ ...matForm, id: e.target.value.toUpperCase() })}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-250 rounded font-mono uppercase focus:outline-hidden"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">Unidade Consumo *</label>
                      <select
                        value={matForm.unit}
                        onChange={(e) => setMatForm({ ...matForm, unit: e.target.value as any })}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-hidden text-slate-800"
                      >
                        <option value="kg">kg (Massa de Bloco)</option>
                        <option value="m²">m² (Tecido Tampas)</option>
                        <option value="m">m (Zíper/Suede)</option>
                        <option value="un">un (Molas/Etiquetas)</option>
                        <option value="rolo">rolo (Linha de Quilting)</option>
                        <option value="litro">litro (Aditivos Químicos)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">Categoria Insumo *</label>
                    <select
                      value={matForm.category}
                      onChange={(e) => setMatForm({ ...matForm, category: e.target.value as MaterialCategory })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-hidden"
                      required
                    >
                      <option value="Espumas">Espumas (TDI/Poliol/Blocos)</option>
                      <option value="Tecidos">Tecidos (Jacquard/Malha/Suede)</option>
                      <option value="Linhas">Linhas (Costura/Quilting)</option>
                      <option value="Colas">Colas (Hotmelt base água)</option>
                      <option value="Embalagens">Embalagens (Press-Pack PE)</option>
                      <option value="Etiquetas">Etiquetas (INMETRO/Informativas)</option>
                      <option value="Acessórios">Acessórios (Zíperes, Suspiros, Alças)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">Especificação Comercial *</label>
                    <textarea
                      placeholder="Ex: Bloco Espuma D45 Super Soft Certificado"
                      rows={2}
                      value={matForm.description}
                      onChange={(e) => setMatForm({ ...matForm, description: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">Fornecedor Preferencial *</label>
                    <select
                      value={matForm.mainSupplierId}
                      onChange={(e) => setMatForm({ ...matForm, mainSupplierId: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-hidden text-slate-800"
                      required
                    >
                      <option value="">Escolher Fornecedor...</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.tradeName} ({s.id})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono font-bold">Reserva de Segurança (Min)</label>
                      <input
                        type="number"
                        min="0"
                        value={matForm.minStock}
                        onChange={(e) => setMatForm({ ...matForm, minStock: Number(e.target.value) })}
                        className="w-full text-xs p-2 bg-slate-50 border text-slate-800 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono font-bold">Estoque Inicial Físico</label>
                      <input
                        type="number"
                        min="0"
                        value={matForm.currentStock}
                        onChange={(e) => setMatForm({ ...matForm, currentStock: Number(e.target.value) })}
                        className="w-full text-xs p-2 bg-slate-50 border text-slate-800 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs py-2.5 rounded-lg"
                  >
                    Registrar Insumo MP
                  </button>
                </form>
              )}

              {/* SUPPLIER FORM */}
              {activeSubTab === 'suppliers' && (
                <form onSubmit={handleSupplierSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">SUP-CÓDIGO *</label>
                      <input
                        type="text"
                        placeholder="SUP-DOW"
                        value={supForm.id}
                        onChange={(e) => setSupForm({ ...supForm, id: e.target.value.toUpperCase() })}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-250 font-mono uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">CNPJ / CPF</label>
                      <input
                        type="text"
                        placeholder="00.000.000/0001-00"
                        value={supForm.cnpj}
                        onChange={(e) => setSupForm({ ...supForm, cnpj: e.target.value })}
                        className="w-full text-xs p-2 bg-slate-50 border font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">RAZÃO SOCIAL *</label>
                    <input
                      type="text"
                      placeholder="Dow Brasil Química S/A"
                      value={supForm.corporateName}
                      onChange={(e) => setSupForm({ ...supForm, corporateName: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-250 rounded focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">NOME FANTASIA *</label>
                    <input
                      type="text"
                      placeholder="Dow Química"
                      value={supForm.tradeName}
                      onChange={(e) => setSupForm({ ...supForm, tradeName: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-250 rounded"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">RESPONSÁVEL</label>
                      <input
                        type="text"
                        placeholder="Ex: Eduardo"
                        value={supForm.contactName}
                        onChange={(e) => setSupForm({ ...supForm, contactName: e.target.value })}
                        className="w-full text-xs p-2 bg-slate-50 border"
                      />
                    </div>
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">CONTATO FONE</label>
                      <input
                        type="text"
                        placeholder="(11) 9000-0000"
                        value={supForm.contactPhone}
                        onChange={(e) => setSupForm({ ...supForm, contactPhone: e.target.value })}
                        className="w-full text-xs p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">EMAIL COMERCIAL</label>
                    <input
                      type="email"
                      placeholder="vendas@parceiro.com"
                      value={supForm.contactEmail}
                      onChange={(e) => setSupForm({ ...supForm, contactEmail: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border"
                    />
                  </div>

                  <div>
                    <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">MATERIAIS FORNECIDOS (Separados por vírgula)</label>
                    <input
                      type="text"
                      placeholder="Ex: Espuma D33, Bobinas Cola"
                      value={supForm.materialsSuppliedRaw}
                      onChange={(e) => setSupForm({ ...supForm, materialsSuppliedRaw: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono font-bold">LEAD TIME MEDIO (Dias)</label>
                      <input
                        type="number"
                        min="1"
                        value={supForm.leadTimeDays}
                        onChange={(e) => setSupForm({ ...supForm, leadTimeDays: Number(e.target.value) })}
                        className="w-full text-xs p-2 border focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono font-bold">AVALIAÇÃO GERAL (1-5)</label>
                      <select
                        value={supForm.evaluationScore}
                        onChange={(e) => setSupForm({ ...supForm, evaluationScore: Number(e.target.value) })}
                        className="w-full text-xs p-2 border focus:outline-hidden"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ Excepcional (5.0)</option>
                        <option value="4">⭐⭐⭐⭐ Ótimo (4.0)</option>
                        <option value="3">⭐⭐⭐ Regular (3.0)</option>
                        <option value="2">⭐⭐ Atenção (2.0)</option>
                        <option value="1">⭐ Crítico (1.0)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 transition text-white font-mono text-xs py-2.5 rounded-lg"
                  >
                    Credenciar Fornecedor
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
