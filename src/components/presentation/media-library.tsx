import React, { useState } from 'react';
import { MediaAsset } from '@/lib/presentation-types';
import { Image, Video, Plus, Trash2, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MediaLibraryProps {
  mediaList: MediaAsset[];
  onAddAsset: (asset: MediaAsset) => void;
  onDeleteAsset: (id: string) => void;
  onSelectAsset?: (asset: MediaAsset) => void;
  selectedUrl?: string;
  closeAfterSelect?: boolean;
  onClose?: () => void;
}

export function MediaLibrary({
  mediaList,
  onAddAsset,
  onDeleteAsset,
  onSelectAsset,
  selectedUrl,
  onClose
}: MediaLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<'image' | 'video'>('image');
  const [newCategory, setNewCategory] = useState('Geral');
  const [isAdding, setIsAdding] = useState(false);

  const filteredAssets = mediaList.filter((asset) => {
    const matchesSearch = asset.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      asset.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    onAddAsset({
      id: 'media-' + Date.now(),
      title: newTitle,
      type: newType,
      url: newUrl,
      category: newCategory || 'Outros'
    });

    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
  };

  const loadExampleUrl = (type: 'image' | 'video') => {
    if (type === 'image') {
      const images = [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80'
      ];
      setNewUrl(images[Math.floor(Math.random() * images.length)]);
    } else {
      setNewUrl('https://www.w3schools.com/html/mov_bbb.mp4');
    }
  };

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Image className="w-5 h-5 text-blue-400" />
            Biblioteca de Mídia Industrial OS
          </h2>
          <p className="text-sm text-slate-500 font-mono mt-1">Multi-use Assets Manager</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAdding(!isAdding)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? 'Ver Biblioteca' : 'Cadastrar Mídia'}
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
            >
              Fechar
            </Button>
          )}
        </div>
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className="bg-slate-800 p-5 rounded-lg border border-slate-700 mb-6 transition-all">
          <h3 className="font-semibold text-slate-200 mb-3 text-sm">Adicionar Novo Arquivo à Biblioteca</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase font-mono tracking-wider mb-1">Título do Recurso</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex. Foto do Terminal de PCP"
                className="w-full px-3 py-2 border border-slate-700 rounded-lg text-sm bg-slate-900 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase font-mono tracking-wider mb-1">Categoria de Organização</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Ex. Qualidade, Estoque, Peças"
                className="w-full px-3 py-2 border border-slate-700 rounded-lg text-sm bg-slate-900 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase font-mono tracking-wider mb-1">Tipo de Mídia</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="mediaType"
                    checked={newType === 'image'}
                    onChange={() => { setNewType('image'); loadExampleUrl('image'); }}
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span>Imagem</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="mediaType"
                    checked={newType === 'video'}
                    onChange={() => { setNewType('video'); loadExampleUrl('video'); }}
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span>Vídeo</span>
                </label>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase font-mono tracking-wider">Link URL do Mídia</label>
                <button
                  type="button"
                  onClick={() => loadExampleUrl(newType)}
                  className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer font-bold"
                >
                  Gerar exemplo operacional
                </button>
              </div>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem-fabrica.jpg"
                className="w-full px-3 py-2 border border-slate-700 rounded-lg text-sm font-mono bg-slate-900 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => setIsAdding(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
            >
              Salvar na Biblioteca
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar mídias por título ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-700 rounded-lg text-sm bg-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-1.5 border border-slate-700 rounded-lg p-1 bg-slate-800">
            {(['all', 'image', 'video'] as const).map((t) => (
              <Button
                key={t}
                onClick={() => setSelectedType(t)}
                variant={selectedType === t ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "text-xs font-semibold rounded-md uppercase tracking-wider",
                  selectedType === t ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                )}
              >
                {t === 'all' ? 'Tudo' : t === 'image' ? 'Imagens' : 'Vídeos'}
              </Button>
            ))}
          </div>
        </div>
      )}

      {filteredAssets.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-xl border border-dashed border-slate-700">
          <p className="text-slate-500 text-sm italic">Nenhum recurso de mídia correspondente encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const isSelected = selectedUrl === asset.url;
            return (
              <div
                key={asset.id}
                className={cn(
                  "group relative overflow-hidden rounded-xl border transition-all flex flex-col cursor-pointer",
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/30 bg-slate-800'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-700'
                )}
                onClick={() => onSelectAsset?.(asset)}
              >
                {/* Media Preview container */}
                <div className="aspect-video bg-slate-950 relative flex items-center justify-center overflow-hidden">
                  {asset.type === 'image' ? (
                    <img
                      src={asset.url}
                      alt={asset.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-950 p-2 text-center">
                      <Video className="w-8 h-8 text-blue-400 mb-2 opacity-85 animate-pulse" />
                      <span className="text-[10px] font-mono tracking-tight line-clamp-1 truncate w-full px-2 text-slate-400">Video MP4 File</span>
                    </div>
                  )}

                  <span className="absolute top-2 left-2 bg-black/75 border border-slate-700 text-slate-300 text-[10px] uppercase tracking-wider font-mono font-bold px-2 py-0.5 rounded">
                    {asset.category}
                  </span>

                  {isSelected && (
                    <div className="absolute inset-x-0 bottom-0 bg-blue-600/90 text-white text-xs font-semibold py-1 flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Selecionado
                    </div>
                  )}
                </div>

                {/* Description and delete action */}
                <div className="p-3 flex items-start justify-between gap-2 flex-grow">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate" title={asset.title}>
                      {asset.title}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5" title={asset.url}>
                      {asset.url}
                    </p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAsset(asset.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className="p-1 text-slate-400 hover:text-red-400"
                    title="Remover da Biblioteca"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
