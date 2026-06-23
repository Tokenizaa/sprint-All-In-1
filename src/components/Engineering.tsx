/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Layers, 
  Settings, 
  Layers3, 
  Plus, 
  Trash2, 
  Calculator, 
  GitCommit, 
  Boxes, 
  ChevronRight, 
  Coins, 
  FileCheck,
  Percent,
  HelpCircle
} from 'lucide-react';
import { ProductModel, BOMVersion, RawMaterial, BedCategory } from '../types';

interface EngineeringProps {
  products: ProductModel[];
  boms: BOMVersion[];
  materials: RawMaterial[];
  onAddProduct: (product: ProductModel) => void;
  onAddBOMVersion: (bom: BOMVersion) => void;
  onDeleteProduct: (id: string) => void;
  onDeleteBOMVersion: (id: string) => void;
  hasWritePermission: boolean;
}

export default function Engineering({
  products,
  boms,
  materials,
  onAddProduct,
  onAddBOMVersion,
  onDeleteProduct,
  onDeleteBOMVersion,
  hasWritePermission
}: EngineeringProps) {
  
  const [activeTab, setActiveTab] = useState<'products' | 'bom'>('products');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');

  // Form states for Product
  const [prodForm, setProdForm] = useState({
    id: '', modelName: '', category: 'Queen' as BedCategory,
    dimensions: '', density: 'D33', heightCm: 30, composition: '', tagsRaw: ''
  });

  // Form states for BOM allocation
  const [bomForm, setBomForm] = useState({
    productId: '', version: 'V1.0', revision: 1, validFrom: '', validTo: '',
    itemsRaw: [] as { materialId: string; unitConsumption: number; expectedLossPercent: number }[]
  });

  const [newBOMItem, setNewBOMItem] = useState({ materialId: '', unitConsumption: 1, expectedLossPercent: 5 });

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.id || !prodForm.modelName) return;

    const tags = prodForm.tagsRaw ? prodForm.tagsRaw.split(',').map(t => t.trim()) : [];

    onAddProduct({
      id: prodForm.id,
      modelName: prodForm.modelName,
      category: prodForm.category,
      dimensions: prodForm.dimensions || '138 x 188 x 25 cm',
      density: prodForm.density,
      heightCm: Number(prodForm.heightCm) || 25,
      composition: prodForm.composition || 'Espuma e tecidos de revestimento',
      tags
    });

    // Reset Form
    setProdForm({
      id: '', modelName: '', category: 'Queen',
      dimensions: '', density: 'D33', heightCm: 30, composition: '', tagsRaw: ''
    });
  };

  const activeBOM = boms.find(b => b.productId === selectedProductId && b.isActive);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Helper calculation of total physical weights/units consumed per mattress in BOM
  const calculateBOMTotals = (bom: BOMVersion | undefined) => {
    if (!bom) return { foamKg: 0, fabricM2: 0, othersCount: 0 };
    
    let foamKg = 0;
    let fabricM2 = 0;
    let othersCount = 0;

    bom.items.forEach(item => {
      const mat = materials.find(m => m.id === item.materialId);
      // factoring loss: consumption * (1 + loss / 100)
      const totalCostQty = item.unitConsumption * (1 + item.expectedLossPercent / 100);
      
      if (mat?.category === 'Espumas') {
        foamKg += totalCostQty;
      } else if (mat?.category === 'Tecidos') {
        fabricM2 += totalCostQty;
      } else {
        othersCount += 1;
      }
    });

    return {
      foamKg: Number(foamKg.toFixed(2)),
      fabricM2: Number(fabricM2.toFixed(2)),
      othersCount
    };
  };

  const totals = calculateBOMTotals(activeBOM);

  const handleAddBOMItemToAccumulator = () => {
    if (!newBOMItem.materialId) return;
    setBomForm(prev => ({
      ...prev,
      itemsRaw: [...prev.itemsRaw, { ...newBOMItem }]
    }));
    setNewBOMItem({ materialId: '', unitConsumption: 1, expectedLossPercent: 5 });
  };

  const handleBOMSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bomForm.productId || bomForm.itemsRaw.length === 0) {
      alert('Selecione um produto e inclua ao menos 1 item na estrutura técnica BOM.');
      return;
    }

    const bomId = `BOM-${Math.floor(Math.random() * 900) + 100}`;
    const mappedItems = bomForm.itemsRaw.map((itm, index) => ({
      id: `BI-${index}-${Math.floor(Math.random() * 90) + 10}`,
      productId: bomForm.productId,
      materialId: itm.materialId,
      unitConsumption: Number(itm.unitConsumption),
      expectedLossPercent: Number(itm.expectedLossPercent)
    }));

    onAddBOMVersion({
      id: bomId,
      productId: bomForm.productId,
      version: bomForm.version,
      revision: Number(bomForm.revision) || 1,
      validFrom: bomForm.validFrom || new Date().toISOString().split('T')[0],
      isActive: true,
      items: mappedItems
    });

    // Reset Form
    setBomForm({
      productId: '', version: 'V1.0', revision: 1, validFrom: '', validTo: '',
      itemsRaw: []
    });
    alert('Nova especificação de estrutura técnica (BOM) registrada com sucesso!');
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Engenharia de Produto</h2>
          <p className="text-xs text-slate-500">Modelagem técnica de colchões, dimensões comerciais e estruturas de consumo (BOM - Bill of Materials).</p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition font-mono flex items-center gap-1.5 ${
              activeTab === 'products' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-indigo-600" />
            Catálogo Colchões ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('bom')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition font-mono flex items-center gap-1.5 ${
              activeTab === 'bom' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5 text-emerald-500" />
            BOM / Estrutura Técnica ({boms.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left component: List views */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* CATALOG TAB PRODUCTS */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    {/* Header: Code & Title */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xxxxs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">
                          {product.id}
                        </span>
                        <h3 className="font-display font-bold text-slate-800 text-sm mt-1">{product.modelName}</h3>
                        <p className="text-xxs text-slate-500 font-mono">Categoria comercial: <strong className="text-slate-650">{product.category}</strong></p>
                      </div>
                      
                      {/* Bed Tag label */}
                      <span className="bg-slate-50 text-slate-600 border px-2 py-1 text-xxxxs uppercase font-mono font-bold rounded">
                        {product.density}
                      </span>
                    </div>

                    {/* Specifications list */}
                    <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-150 space-y-1.5 text-xxs font-mono">
                      <p className="text-slate-600">Dimensões Físicas: <strong className="text-slate-850">{product.dimensions}</strong></p>
                      <p className="text-slate-600">Altura do Colchão: <strong className="text-slate-850">{product.heightCm} cm</strong></p>
                      <p className="text-slate-500 leading-normal border-t pt-1.5 mt-1">
                        <strong>Composição:</strong> {product.composition}
                      </p>
                    </div>

                    {/* Metadata tags */}
                    <div className="mt-3.5 flex flex-wrap gap-1">
                      {product.tags.map((tag, idx) => (
                        <span key={idx} className="bg-indigo-50/50 text-indigo-700 p-0.5 px-1.5 text-xxxxs font-mono rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer actions block */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-between items-center text-xxs font-mono">
                    <button
                      onClick={() => {
                        setSelectedProductId(product.id);
                        setActiveTab('bom');
                      }}
                      className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5"
                    >
                      BOM Especializado →
                    </button>
                    {hasWritePermission && (
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="text-red-550 hover:text-red-700"
                        title="Remover modelo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BOM STRUCTURE EXPLORER TAB */}
          {activeTab === 'bom' && (
            <div className="space-y-4">
              
              {/* Product selector dropdown mapping */}
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <label className="block text-xxxxs uppercase tracking-wider font-extrabold mb-1.5 text-slate-500 font-mono">Selecione o Colchão para Estrutura Técnica</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="text-xs font-mono bg-white p-2 border rounded-lg focus:outline-hidden text-slate-800"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.modelName} ({p.category})</option>
                    ))}
                  </select>
                </div>

                {activeBOM && (
                  <div className="text-right text-xxs font-mono font-medium text-slate-500">
                    <span>Versão Ativa: <span className="text-slate-800 font-bold">{activeBOM.version}</span> (revisão {activeBOM.revision})</span>
                    <span className="block text-xxxxs text-slate-400">Vigência: Desde {activeBOM.validFrom}</span>
                  </div>
                )}
              </div>

              {/* Master BOM Display Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-500">
                    BOM - Bill of Materials: {selectedProduct?.modelName}
                  </span>
                  <span className="text-xxxxs font-mono bg-emerald-100 text-emerald-800 p-1 px-1.5 rounded-full font-bold">
                    ESTRUTURA COMPLETA
                  </span>
                </div>

                {!activeBOM ? (
                  <div className="p-10 text-center text-slate-400 text-xs font-mono space-y-2">
                    <p>⚠️ Não há nenhuma especificação técnica (BOM) registrada para este modelo de colchão.</p>
                    <p className="text-xxxxs text-slate-400">Insira a lista de componentes no formulário lateral para criar-la.</p>
                  </div>
                ) : (
                  <div>
                    {/* Summary Totals Recipe Bar */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-50 p-4 border-b text-center text-xxs font-mono">
                      <div>
                        <span className="block text-xxxxs uppercase text-slate-400">Consumo Espuma Total</span>
                        <strong className="text-slate-800 text-sm">{totals.foamKg} kg</strong> <span className="text-slate-400">(c/ perda)</span>
                      </div>
                      <div className="border-x">
                        <span className="block text-xxxxs uppercase text-slate-400">Consumo Tecido Total</span>
                        <strong className="text-slate-800 text-sm">{totals.fabricM2} m²</strong> <span className="text-slate-400">(c/ perda)</span>
                      </div>
                      <div>
                        <span className="block text-xxxxs uppercase text-slate-400">Insumos Adicionais</span>
                        <strong className="text-slate-800 text-sm">{totals.othersCount} itens</strong> <span className="text-slate-400">BOM</span>
                      </div>
                    </div>

                    {/* Table Recipe Ingredients */}
                    <div className="divide-y divide-slate-100 font-mono text-xxs text-slate-650">
                      {activeBOM.items.map((item) => {
                        const mat = materials.find(m => m.id === item.materialId);
                        const grossConsumption = item.unitConsumption * (1 + item.expectedLossPercent / 100);
                        
                        return (
                          <div key={item.id} className="p-4 flex justify-between items-center hover:bg-slate-50/50 transition">
                            <div className="flex items-start gap-4">
                              <span className="text-xxxxs text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">{item.materialId}</span>
                              <div>
                                <h4 className="font-display font-semibold text-slate-800 text-xs font-sans">{mat?.description || 'Material não encontrado'}</h4>
                                <span className="text-xxxxs text-slate-400">Categoria: {mat?.category}</span>
                              </div>
                            </div>

                            <div className="text-right shrink-0 flex items-center gap-6">
                              <div>
                                <span className="text-xxxxs uppercase font-bold text-slate-400 block">Consumo Unitário</span>
                                <span className="text-slate-800 font-bold">{item.unitConsumption} {mat?.unit}</span>
                              </div>
                              
                              <div>
                                <span className="text-xxxxs uppercase font-bold text-slate-400 block">Perda Prevista</span>
                                <span className="text-red-500 font-bold">+{item.expectedLossPercent}%</span>
                              </div>

                              <div className="border-l pl-4">
                                <span className="text-xxxxs uppercase font-bold text-emerald-600 block">Consumo Bruto</span>
                                <strong className="text-emerald-700 font-bold text-xs">{grossConsumption.toFixed(3)} {mat?.unit}</strong>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Right column: Form additions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs h-fit">
          <div className="border-b border-slate-101 pb-3 mb-4">
            <h3 className="font-display font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
              <Plus className="w-4 h-4 text-orange-500" />
              Engenharia / Especificação
            </h3>
            <p className="text-xxs text-slate-500 font-mono mt-0.5">Cadastrar itens e diagramas de materiais</p>
          </div>

          {!hasWritePermission ? (
            <div className="bg-amber-50 text-amber-700 border border-amber-200 p-4 rounded-xl text-xxs font-mono">
              Perfil logado atual não permite salvar novos diagramas de Engenharia ou alterar composições de produtos.
            </div>
          ) : (
            <div>
              {/* ADD PRODUCT FORM */}
              {activeTab === 'products' && (
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">ID MODELO *</label>
                      <input
                        type="text"
                        placeholder="PRD-QN-VISC"
                        value={prodForm.id}
                        onChange={(e) => setProdForm({ ...prodForm, id: e.target.value.toUpperCase() })}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-250 font-mono uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">TAMANHO *</label>
                      <select
                        value={prodForm.category}
                        onChange={(e) => setProdForm({ ...prodForm, category: e.target.value as BedCategory })}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded"
                        required
                      >
                        <option value="Solteiro">Solteiro</option>
                        <option value="Casal">Casal</option>
                        <option value="Queen">Queen Size</option>
                        <option value="King">King Size</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">NOME COMERCIAL COLCHÃO *</label>
                    <input
                      type="text"
                      placeholder="Ex: Majestic Visco Gel"
                      value={prodForm.modelName}
                      onChange={(e) => setProdForm({ ...prodForm, modelName: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-250 rounded focus:outline-hidden"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">DIMENSÃO (L x C x A)</label>
                      <input
                        type="text"
                        placeholder="158 x 198 x 30 cm"
                        value={prodForm.dimensions}
                        onChange={(e) => setProdForm({ ...prodForm, dimensions: e.target.value })}
                        className="w-full text-xs p-2 bg-slate-50 border"
                      />
                    </div>
                    <div>
                      <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">ALTURA (CM)</label>
                      <input
                        type="number"
                        placeholder="30"
                        value={prodForm.heightCm}
                        onChange={(e) => setProdForm({ ...prodForm, heightCm: Number(e.target.value) })}
                        className="w-full text-xs p-2 bg-slate-50 border"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">DENSIDADE / MIOLO *</label>
                    <input
                      type="text"
                      placeholder="Ex: D33 + Molas"
                      value={prodForm.density}
                      onChange={(e) => setProdForm({ ...prodForm, density: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border"
                    />
                  </div>

                  <div>
                    <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">COMPOSIÇÃO TEXTIL/NÚCLEO</label>
                    <textarea
                      placeholder="Espuma densidade certificada D33..."
                      rows={2}
                      value={prodForm.composition}
                      onChange={(e) => setProdForm({ ...prodForm, composition: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border rounded focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xxxxs uppercase tracking-wider font-bold mb-1 text-slate-400 font-mono">TAGS ENGENHARIA (Múltiplas com vírgula)</label>
                    <input
                      type="text"
                      placeholder="Ex: Linha Premium, D33"
                      value={prodForm.tagsRaw}
                      onChange={(e) => setProdForm({ ...prodForm, tagsRaw: e.target.value })}
                      className="w-full text-xs p-2"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs py-2.5 rounded-lg"
                  >
                    Salvar Colchão no Catálogo
                  </button>
                </form>
              )}

              {/* TECHNICAL BOM ENGI RECIPIENTS FORM */}
              {activeTab === 'bom' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 p-3 bg-slate-50 rounded-xl space-y-3 font-mono text-xxxs">
                    <span className="font-bold text-slate-700 uppercase tracking-wide block">Acumular Itens p/ o BOM</span>

                    <div>
                      <label className="block text-xxxxs uppercase text-slate-400 mb-1">Insumo da MP *</label>
                      <select
                        value={newBOMItem.materialId}
                        onChange={(e) => setNewBOMItem({ ...newBOMItem, materialId: e.target.value })}
                        className="w-full bg-white p-1.5 border rounded focus:outline-hidden text-slate-700"
                      >
                        <option value="">Selecione...</option>
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>{m.id} - {m.description.slice(0, 30)}...</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xxxxs uppercase text-slate-400 mb-1">Consumo Unitário</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newBOMItem.unitConsumption}
                          onChange={(e) => setNewBOMItem({ ...newBOMItem, unitConsumption: Number(e.target.value) })}
                          className="w-full bg-white p-1 border rounded text-center text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xxxxs text-slate-400 mb-1 uppercase">% Perda Prevista</label>
                        <input
                          type="number"
                          value={newBOMItem.expectedLossPercent}
                          onChange={(e) => setNewBOMItem({ ...newBOMItem, expectedLossPercent: Number(e.target.value) })}
                          className="w-full bg-white p-1 border rounded text-center text-slate-800"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddBOMItemToAccumulator}
                      className="w-full bg-slate-800 text-white font-mono text-xxxxs tracking-wider py-1.5 hover:bg-slate-700 uppercase rounded font-bold cursor-pointer"
                    >
                      ✓ Incluir Item no Rascunho
                    </button>
                  </div>

                  {bomForm.itemsRaw.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xxs font-mono text-slate-700">
                      <span className="font-bold uppercase tracking-wider block text-xxxxs text-emerald-800 mb-1.5">Itens Prontos p/ BOM ({bomForm.itemsRaw.length})</span>
                      <ul className="space-y-1 list-disc pl-3 text-xxxxs">
                        {bomForm.itemsRaw.map((itm, i) => (
                          <li key={i}>{itm.materialId}: {itm.unitConsumption} units (+{itm.expectedLossPercent}% loss)</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <form onSubmit={handleBOMSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xxxxs uppercase text-slate-400 font-mono mb-1 font-bold">Colchão de Destino *</label>
                      <select
                        value={bomForm.productId}
                        onChange={(e) => setBOMFormSelected => setBomForm({ ...bomForm, productId: e.target.value })}
                        className="w-full text-xs p-2 bg-slate-50 border rounded focus:outline-hidden"
                        required
                      >
                        <option value="">Selecione...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.id} - {p.modelName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xxxxs text-slate-400 font-mono mb-1 uppercase font-bold">Código Versão</label>
                        <input
                          type="text"
                          value={bomForm.version}
                          placeholder="V1.0"
                          onChange={(e) => setBomForm({ ...bomForm, version: e.target.value })}
                          className="w-full text-xs p-2 bg-slate-50 border font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xxxxs text-slate-400 font-mono mb-1 uppercase font-bold">Revisão Nº</label>
                        <input
                          type="number"
                          value={bomForm.revision}
                          onChange={(e) => setBomForm({ ...bomForm, revision: Number(e.target.value) })}
                          className="w-full text-xs p-2 bg-slate-50 border font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 text-white font-mono text-xs py-2.5 rounded-lg font-bold"
                    >
                      Criar Estrutura BOM Ativa
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
