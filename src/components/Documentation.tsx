/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  Link, 
  ArrowUpRight,
  ShieldAlert,
  Archive,
  Info
} from 'lucide-react';
import { IndustrialDocument, DocType } from '../types';

interface DocumentationProps {
  documents: IndustrialDocument[];
  onAddDocument: (doc: IndustrialDocument) => void;
  onDeleteDocument: (id: string) => void;
  hasWritePermission: boolean;
}

export default function Documentation({
  documents,
  onAddDocument,
  onDeleteDocument,
  hasWritePermission
}: DocumentationProps) {
  
  const [docSearch, setDocSearch] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  
  // New Doc Form
  const [docForm, setDocForm] = useState({
    title: '',
    type: 'Procedimento' as DocType,
    fileName: '',
    associatedType: 'Geral' as any,
    associatedId: ''
  });

  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title || !docForm.fileName) return;

    onAddDocument({
      id: `DOC-${Math.floor(Math.random() * 900) + 100}`,
      title: docForm.title,
      type: docForm.type,
      fileName: docForm.fileName.toLowerCase().replace(/\s+/g, '_') + '.pdf',
      uploadDate: new Date().toISOString().split('T')[0],
      associatedType: docForm.associatedType,
      associatedId: docForm.associatedId.toUpperCase()
    });

    setDocForm({
      title: '',
      type: 'Procedimento',
      fileName: '',
      associatedType: 'Geral',
      associatedId: ''
    });
  };

  // filter
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(docSearch.toLowerCase()) || 
                          doc.fileName.toLowerCase().includes(docSearch.toLowerCase());
    const matchesType = selectedTypeFilter === 'ALL' || doc.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">DocCenter - Central de Documentos</h2>
          <p className="text-xs text-slate-500">Repositório de instruções de trabalho (ITs), laudos técnicos Inmetro, fichas de segurança química e manuais de robôs.</p>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column Documents Directory List (Takes 2 widths) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Quick Filters & Searches block */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Pesquisar procedimentos, manuais ou nomes de arquivos..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="w-full text-xs p-2.5 pl-9 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-650 shrink-0">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="text-xs font-mono bg-transparent focus:outline-hidden text-slate-800"
              >
                <option value="ALL">Qualquer Tipo</option>
                <option value="Procedimento">Procedimento</option>
                <option value="Instrução">Instrução de Trabalho (IT)</option>
                <option value="Manual">Manual de Operação</option>
                <option value="Certificado">Certificado Inmetro</option>
              </select>
            </div>
          </div>

          {/* Table display */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center text-xxs font-mono uppercase tracking-wider text-slate-400 font-bold">
              <span>Especificação Técnica do Documento</span>
              <span>Propriedades Integradas</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg shrink-0 ${
                      doc.type === 'Procedimento' ? 'bg-indigo-50 text-indigo-750' :
                      doc.type === 'Instrução' ? 'bg-emerald-50 text-emerald-700' :
                      doc.type === 'Manual' ? 'bg-orange-50/70 text-orange-600' :
                      'bg-rose-50 text-rose-500'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-semibold text-slate-850 text-xs font-sans">{doc.title}</h4>
                        <span className={`px-2 py-0.2 text-xxxxs font-mono rounded-md font-bold uppercase ${
                          doc.type === 'Procedimento' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                          doc.type === 'Instrução' ? 'bg-emerald-100 text-emerald-700' :
                          doc.type === 'Manual' ? 'bg-orange-100/70 text-orange-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {doc.type}
                        </span>
                      </div>
                      
                      <p className="text-xxs text-slate-450 mt-1 font-mono">
                        Arquivo: <span className="text-slate-600 text-xxxs underline">{doc.fileName}</span>
                        <span className="mx-2">•</span>
                        Adicionado: {doc.uploadDate}
                      </p>
                    </div>
                  </div>

                  {/* Association information */}
                  <div className="flex items-center gap-4 justify-between md:justify-end shrink-0">
                    <div className="text-right">
                      {(doc.associatedType as string) !== 'Geral' ? (
                        <div className="font-mono text-xxxxs uppercase font-extrabold text-indigo-500 flex items-center justify-end gap-1">
                          <Link className="w-3 h-3 text-slate-405" /> Vinculado a: 
                          <span className="bg-slate-100 text-slate-700 px-1 py-0.2 rounded">
                            {(doc.associatedType as string) === 'Geral' ? 'Outros' : doc.associatedType} ({doc.associatedId})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xxxxs font-mono text-slate-400">Index Geral</span>
                      )}
                      
                      <span className="block text-xxxxxx font-mono uppercase text-slate-403">Indexador ID: {doc.id}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => alert(`Simulando download de documento: ${doc.fileName} de forma segura.`)}
                        className="p-1 px-2.5 text-xxs font-mono text-slate-600 hover:bg-slate-100 rounded border flex items-center gap-1 h-8"
                        title="Baixar arquivo técnico"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>

                      {hasWritePermission && (
                        <button
                          onClick={() => onDeleteDocument(doc.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded h-8"
                          title="Remover documento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredDocs.length === 0 && (
                <div className="p-12 text-center text-slate-400 font-mono text-xs">
                  Nenhum procedimento técnico ou instrução de trabalho correspondente à busca.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right column Form additions (Takes 1 width) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs h-fit">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-display font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
              <Plus className="w-4 h-4 text-orange-500" />
              Indexar Documento
            </h3>
            <p className="text-xxs text-slate-500 font-mono mt-0.5">Arquivar novas especificações industriais</p>
          </div>

          {!hasWritePermission ? (
            <div className="bg-amber-50 text-amber-700 border border-amber-200 p-4 rounded-xl text-xxs font-mono">
              Usuário possui perfil de leitura. Para anexar fichas de Inmetro ou apostilas, contate o Administrador Industrial.
            </div>
          ) : (
            <form onSubmit={handleDocSubmit} className="space-y-4">
              <div>
                <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500 font-bold">Título do Documento *</label>
                <input
                  type="text"
                  placeholder="Ex: IT-12: Controle de Cola Hotmelt"
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500 font-bold">Tipo de Registro *</label>
                <select
                  value={docForm.type}
                  onChange={(e) => setDocForm({ ...docForm, type: e.target.value as DocType })}
                  className="w-full text-xs p-2 bg-slate-50 border text-slate-800"
                  required
                >
                  <option value="Procedimento">Procedimento</option>
                  <option value="Instrução">Instrução de Trabalho (IT)</option>
                  <option value="Manual">Manual de Operação</option>
                  <option value="Certificado">Certificado Técnico / INMETRO</option>
                </select>
              </div>

              <div>
                <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500 font-bold font-bold">Nome do Arquivo Físico *</label>
                <input
                  type="text"
                  placeholder="it_embalagem_presspack (Sem .pdf)"
                  value={docForm.fileName}
                  onChange={(e) => setDocForm({ ...docForm, fileName: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border rounded focus:outline-hidden font-mono text-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 border rounded-lg">
                <span className="col-span-2 text-xxxxs font-mono text-slate-400 uppercase font-bold mb-1">Associação de Chaves</span>
                <div>
                  <label className="block text-xxxxs text-slate-400 mb-1">VINCULADO A</label>
                  <select
                    value={docForm.associatedType}
                    onChange={(e) => setDocForm({ ...docForm, associatedType: e.target.value as any })}
                    className="w-full bg-white p-1 border text-slate-700 font-mono text-xxxxxs uppercase font-semibold"
                  >
                    <option value="Geral">Nenhum / Geral</option>
                    <option value="Máquina">Máquina</option>
                    <option value="Processo">Processo</option>
                    <option value="Produto">Produto</option>
                    <option value="Material">Material</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xxxxs text-slate-400 mb-1">ID ENTIDADE</label>
                  <input
                    type="text"
                    placeholder="MAC-COR-01"
                    disabled={docForm.associatedType === 'Geral'}
                    value={docForm.associatedId}
                    onChange={(e) => setDocForm({ ...docForm, associatedId: e.target.value.toUpperCase() })}
                    className="w-full bg-white p-1 border font-mono font-bold uppercase placeholder-slate-300 focus:outline-hidden text-xxxxs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 border text-white font-mono text-xs py-2.5 rounded-lg font-semibold"
              >
                Catalogar Documento
              </button>
            </form>
          )}

          {/* Informative advice */}
          <div className="mt-4 p-3 bg-blue-50/50 border border-blue-105 rounded-xl text-xxxs font-mono text-slate-600 flex gap-2">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <span>Todos os arquivos salvos são criptografados no servidor de espumação da Industrial OS.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
