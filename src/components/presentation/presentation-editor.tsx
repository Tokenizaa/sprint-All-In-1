import React, { useState } from 'react';
import { Presentation, Slide, Category, Status, MediaAsset, ListItem, ThemeStyle } from '@/lib/presentation-types';
import { CATEGORIES } from '@/lib/presentation-mock-data';
import { 
  Save, Eye, ArrowLeft, Trash2, Plus, MoveUp, MoveDown, Layout, 
  Image as ImageIcon, Video, AlignLeft, ListPlus, AlertCircle, 
  FileDown, Check, Settings, Copy, HelpCircle, AlertTriangle, Lightbulb, Focus, Layers, GitCommit, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface PresentationEditorProps {
  presentation: Presentation;
  onSave: (updated: Presentation) => void;
  onBack: () => void;
  onPresent: () => void;
  onExport: () => void;
  mediaList: MediaAsset[];
  onOpenMediaLibrary: () => void;
}

export function PresentationEditor({
  presentation,
  onSave,
  onBack,
  onPresent,
  onExport,
  mediaList,
  onOpenMediaLibrary
}: PresentationEditorProps) {
  // Global States
  const [editedTitle, setEditedTitle] = useState(presentation.title);
  const [editedDesc, setEditedDesc] = useState(presentation.description);
  const [editedCategory, setEditedCategory] = useState<Category>(presentation.category);
  const [editedStatus, setEditedStatus] = useState<Status>(presentation.status);
  const [editedThemeColor, setEditedThemeColor] = useState<'yellow' | 'green' | 'red' | 'cyan' | 'purple'>(
    presentation.themeColor || 'yellow'
  );
  const [editedThemeStyle, setEditedThemeStyle] = useState<ThemeStyle>(
    presentation.themeStyle || 'industrial'
  );
  
  const [slides, setSlides] = useState<Slide[]>(presentation.slides);
  const [activeSlideId, setActiveSlideId] = useState<string>(presentation.slides[0]?.id || '');

  // Slide reordering state
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);

  // Auto-saved tracking indicator
  const [saveIndicator, setSaveIndicator] = useState<'saved' | 'saving' | 'dirty'>('saved');

  // Media picker modal helpers
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'image' | 'video' | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState<boolean>(false);

  // Bullets lists state drafts
  const [bulletDraft, setBulletDraft] = useState('');

  // Flow flowchart nodes draft
  const [flowNodeLabelDraft, setFlowNodeLabelDraft] = useState('');
  const [flowNodeDescDraft, setFlowNodeDescDraft] = useState('');

  const activeSlideIndex = slides.findIndex(s => s.id === activeSlideId);
  const activeSlide = activeSlideIndex >= 0 ? slides[activeSlideIndex] : null;

  // Handle saving payload
  const handleSaveAll = () => {
    setSaveIndicator('saving');

    const updatedPresentation: Presentation = {
      ...presentation,
      title: editedTitle.trim() || 'Sem Título',
      description: editedDesc.trim(),
      category: editedCategory,
      status: editedStatus,
      slides: slides,
      themeColor: editedThemeColor,
      themeStyle: editedThemeStyle,
      updatedAt: new Date().toISOString()
    };

    onSave(updatedPresentation);
    
    setTimeout(() => {
      setSaveIndicator('saved');
    }, 400);
  };

  // Helper: edit individual slide field
  const updateSlideField = (slideId: string, field: keyof Slide, value: any) => {
    const updated = slides.map(sl => {
      if (sl.id === slideId) {
        return { ...sl, [field]: value };
      }
      return sl;
    });
    setSlides(updated);
    setSaveIndicator('dirty');
  };

  // CRUD slides
  const handleAddSlide = () => {
    const fresh: Slide = {
      id: 'slide-' + Date.now(),
      titulo: `Novo Slide ${slides.length + 1}`,
      subtitulo: 'Etiqueta de suporte ou procedimento técnico',
      layout: 'content',
      topicos: [],
      listItems: [],
      flowNodes: []
    };
    const nextList = [...slides, fresh];
    setSlides(nextList);
    setActiveSlideId(fresh.id);
    setSaveIndicator('dirty');
  };

  const handleDeleteSlide = (slideId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (slides.length <= 1) {
      alert('Sua apresentação de treinamento necessita de no mínimo 1 slide operacional.');
      return;
    }
    if (confirm('Deseja excluir permanentemente este slide do circuito?')) {
      const nextList = slides.filter(s => s.id !== slideId);
      setSlides(nextList);
      
      if (activeSlideId === slideId) {
        setActiveSlideId(nextList[0]?.id || '');
      }
      setSaveIndicator('dirty');
    }
  };

  const handleDuplicateSlide = (slideId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = slides.find(s => s.id === slideId);
    if (!target) return;

    const copy: Slide = {
      ...target,
      id: 'slide-dup-' + Date.now(),
      titulo: `${target.titulo} (Cópia)`
    };

    const nextList = [...slides, copy];
    setSlides(nextList);
    setActiveSlideId(copy.id);
    setSaveIndicator('dirty');
  };

  // Move slide index sorting
  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;

    const swapWith = direction === 'up' ? index - 1 : index + 1;
    const nextList = [...slides];
    const temp = nextList[index];
    nextList[index] = nextList[swapWith];
    nextList[swapWith] = temp;

    setSlides(nextList);
    setSaveIndicator('dirty');
  };

  // Drag & drop sorting
  const handleDragStart = (index: number) => {
    setDraggedSlideIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSlideIndex === null || draggedSlideIndex === index) return;

    const nextList = [...slides];
    const draggedItem = nextList[draggedSlideIndex];
    nextList.splice(draggedSlideIndex, 1);
    nextList.splice(index, 0, draggedItem);

    setSlides(nextList);
    setDraggedSlideIndex(index);
    setSaveIndicator('dirty');
  };

  const handleDragEnd = () => {
    setDraggedSlideIndex(null);
  };

  // Bullet Point editing routines
  const addBulletPoint = () => {
    if (!activeSlide) return;
    if (!bulletDraft.trim()) return;

    const bulletList = activeSlide.listItems || [];
    const freshBullet: ListItem = {
      id: 'bullet-' + Date.now(),
      text: bulletDraft.trim()
    };

    const updatedList = [...bulletList, freshBullet];
    updateSlideField(activeSlide.id, 'listItems', updatedList);
    setBulletDraft('');
  };

  const deleteBulletPoint = (bulletId: string) => {
    if (!activeSlide) return;
    const bulletList = activeSlide.listItems || [];
    const updated = bulletList.filter(item => item.id !== bulletId);
    updateSlideField(activeSlide.id, 'listItems', updated);
  };

  // Flow flowchart nodes editing routines
  const addFlowNode = () => {
    if (!activeSlide) return;
    if (!flowNodeLabelDraft.trim()) return;

    const listNodes = activeSlide.flowNodes || [];
    const freshNode = {
      id: 'node-' + Date.now(),
      label: flowNodeLabelDraft.trim(),
      description: flowNodeDescDraft.trim() || undefined
    };

    const updatedNodes = [...listNodes, freshNode];
    updateSlideField(activeSlide.id, 'flowNodes', updatedNodes);
    setFlowNodeLabelDraft('');
    setFlowNodeDescDraft('');
  };

  const deleteFlowNode = (nodeId: string) => {
    if (!activeSlide) return;
    const listNodes = activeSlide.flowNodes || [];
    const updated = listNodes.filter(node => node.id !== nodeId);
    updateSlideField(activeSlide.id, 'flowNodes', updated);
  };

  // Reusable Media picker selection callback
  const selectMediaAsset = (asset: MediaAsset) => {
    if (!activeSlide || !mediaPickerTarget) return;

    if (mediaPickerTarget === 'image') {
      updateSlideField(activeSlide.id, 'imageUrl', asset.url);
    } else if (mediaPickerTarget === 'video') {
      updateSlideField(activeSlide.id, 'video_url', asset.url);
    }

    setShowMediaPicker(false);
    setMediaPickerTarget(null);
    setSaveIndicator('dirty');
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Navigation Command Row */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          
          <div className="h-5 w-px bg-slate-700" />

          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-blue-400">Ambiente de Operação</span>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white max-w-[150px] sm:max-w-xs truncate">{editedTitle || 'Módulo sem Título'}</h1>
              <span className={cn(
                "px-2 py-0.5 text-[8.5px] font-mono rounded font-bold uppercase",
                editedStatus === 'Publicado' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                editedStatus === 'Em Revisão' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                'bg-amber-950 text-amber-400 border border-amber-900'
              )}>
                {editedStatus}
              </span>
            </div>
          </div>
        </div>

        {/* State synchronization controls */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono text-slate-500 mr-1.5 flex items-center gap-1.5">
            {saveIndicator === 'saved' && <span className="text-emerald-400">✓ Pronto</span>}
            {saveIndicator === 'saving' && <span className="text-blue-400 animate-pulse">⚙ Salvando...</span>}
            {saveIndicator === 'dirty' && <span className="text-amber-400 animate-pulse">● Alterações Pendentes</span>}
          </span>

          <Button
            onClick={handleSaveAll}
            size="sm"
            className={cn(
              "gap-1.5",
              saveIndicator === 'dirty' 
                ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                : 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30'
            )}
          >
            <Save className="w-3.5 h-3.5" /> Salvar
          </Button>

          <Button
            onClick={onPresent}
            size="sm"
            className="gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold"
          >
            <Eye className="w-3.5 h-3.5" /> Apresentar
          </Button>

          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
            title="Exportar Ativo PDF/JSON"
          >
            <FileDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Safety limit warning helper */}
      {slides.length < 5 && (
        <div className="bg-amber-950/25 border border-amber-900/50 rounded-xl p-3 flex gap-3 text-amber-300">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold font-mono">Aviso de Regulação Pedagógica</p>
            <p className="mt-0.5 text-slate-400 leading-normal font-sans">
              Esta apresentação possui atualmente <strong className="text-amber-400 font-bold">{slides.length} slides</strong>.
              O padrão de qualidade estipula um **mínimo de 5 páginas e um máximo de 8 páginas** por módulo para garantir boa fixação operacional.
            </p>
          </div>
        </div>
      )}

      {/* Main workspace layout split panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SIDE BAR: List of Slides and presentation properties */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Section: Design System Themes selection settings */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <Settings className="w-4 h-4" /> Atributos Globais
            </h3>

            <div>
              <label className="block text-[9px] font-semibold text-slate-400 uppercase font-mono tracking-wider mb-1">Título do Treinamento</label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => { setEditedTitle(e.target.value); setSaveIndicator('dirty'); }}
                className="w-full px-2.5 py-1.5 border border-slate-700 rounded-lg text-xs bg-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-semibold text-slate-400 uppercase font-mono tracking-wider mb-1">Categoria</label>
                <select
                  value={editedCategory}
                  onChange={(e) => { setEditedCategory(e.target.value as Category); setSaveIndicator('dirty'); }}
                  className="w-full px-2 py-1.5 border border-slate-700 rounded-lg text-xs bg-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
                >
                  {CATEGORIES.map((cat: Category) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-slate-400 uppercase font-mono tracking-wider mb-1">Status</label>
                <select
                  value={editedStatus}
                  onChange={(e) => { setEditedStatus(e.target.value as Status); setSaveIndicator('dirty'); }}
                  className="w-full px-2 py-1.5 border border-slate-700 rounded-lg text-xs bg-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
                >
                  <option value="Rascunho" className="bg-slate-900 text-white">🟡 Rascunho</option>
                  <option value="Em Revisão" className="bg-slate-900 text-white">🔵 Em Revisão</option>
                  <option value="Publicado" className="bg-slate-900 text-white">🟢 Publicado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] text-slate-400 uppercase font-mono tracking-wider mb-1">Descrição</label>
              <Textarea
                value={editedDesc}
                onChange={(e) => { setEditedDesc(e.target.value); setSaveIndicator('dirty'); }}
                rows={2}
                className="w-full px-2.5 py-1.5 border border-slate-700 rounded-lg text-xs bg-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Explicativo do treinamento..."
              />
            </div>

            {/* Theme selector widget */}
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider mb-1.5">TEMA VISUAL</label>
              <select
                value={editedThemeStyle}
                onChange={(e) => { setEditedThemeStyle(e.target.value as ThemeStyle); setSaveIndicator('dirty'); }}
                className="w-full px-2 py-1.5 border border-slate-700 rounded-lg text-xs bg-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer font-sans"
              >
                <option value="industrial" className="bg-slate-900">🚧 Industrial</option>
                <option value="corporate" className="bg-slate-900">💼 Corporativo</option>
                <option value="modern" className="bg-slate-900">🧬 Moderno</option>
                <option value="dark" className="bg-slate-900">🌑 Dark</option>
                <option value="light" className="bg-slate-900">☀️ Light</option>
              </select>
            </div>
          </div>

          {/* Section: Slides Pipe Grid controller */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold font-mono text-blue-400 uppercase tracking-widest">
                Grade de Slides ({slides.length})
              </h3>
              <Button
                onClick={handleAddSlide}
                size="sm"
                className="p-1 bg-blue-600 hover:bg-blue-500 text-white"
                title="Inserir Novo Slide"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="text-[9px] text-slate-500 mb-2 font-mono leading-relaxed">
              💡 Arraste para reordenar os slides ou use as setas.
            </div>

            <div className="space-y-2" id="slide-sortable-container">
              {slides.map((slide, index) => {
                const isActive = slide.id === activeSlideId;
                return (
                  <div
                    key={slide.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setActiveSlideId(slide.id)}
                    className={cn(
                      "p-2.5 rounded-lg border transition-all cursor-grab flex items-center justify-between gap-1",
                      isActive 
                        ? 'border-blue-500 bg-blue-950/20 text-white' 
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800 text-slate-400 hover:text-slate-300'
                    )}
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-2">
                      <span className="font-mono text-[9px] text-slate-600">0{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs truncate leading-normal">{slide.titulo || slide.title || 'Sem título'}</p>
                        <p className="text-[8.5px] uppercase font-mono tracking-widest text-slate-500 mt-0.5 truncate">{slide.layout || 'content'}</p>
                      </div>
                    </div>

                    {/* Arrow selectors & duplicate actions */}
                    <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={() => moveSlide(index, 'up')}
                        disabled={index === 0}
                        variant="ghost"
                        size="sm"
                        className="p-1 text-slate-500 hover:text-white hover:bg-black/30 rounded disabled:opacity-20"
                        title="Mover para Cima"
                      >
                        <MoveUp className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        onClick={() => moveSlide(index, 'down')}
                        disabled={index === slides.length - 1}
                        variant="ghost"
                        size="sm"
                        className="p-1 text-slate-500 hover:text-white hover:bg-black/30 rounded disabled:opacity-20"
                        title="Mover para Baixo"
                      >
                        <MoveDown className="w-3 h-3" />
                      </Button>

                      <Button
                        onClick={(e) => handleDuplicateSlide(slide.id, e)}
                        variant="ghost"
                        size="sm"
                        className="p-1 text-slate-500 hover:text-white hover:bg-black/30 rounded"
                        title="Duplicar Slide"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>

                      <Button
                        onClick={(e) => handleDeleteSlide(slide.id, e)}
                        variant="ghost"
                        size="sm"
                        className="p-1 text-red-500 hover:text-red-400 hover:bg-red-950/20 rounded"
                        title="Deletar Slide"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* WORKSPACE MIDDLE COLUMN: Active slide components configuration editors */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-800">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4 font-mono border-b border-slate-800 pb-3">
              <Layers className="w-4.5 h-4.5 text-blue-400 font-bold" /> REQUISITOS DE COMPONENTE DO SLIDE
            </h2>

            {activeSlide ? (
              <div className="space-y-4">
                
                {/* 1. LAYOUT CLASSIFICATION GRID SELECTOR */}
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-400 uppercase font-mono tracking-wider mb-2">Selecione o Layout Universal</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'cover', label: 'Capa / Agenda' },
                      { id: 'content', label: 'Conteúdo Livre' },
                      { id: 'step-by-step', label: 'Passo a Passo' },
                      { id: 'two-columns', label: 'Bento Colunas' },
                      { id: 'checklist', label: 'Checklist Op' },
                      { id: 'video', label: 'Mídia Vídeo' },
                      { id: 'flow', label: 'Fluxo Processo' },
                      { id: 'conclusion', label: 'Encerramento' },
                    ].map((lay) => (
                      <Button
                        key={lay.id}
                        type="button"
                        onClick={() => updateSlideField(activeSlide.id, 'layout', lay.id)}
                        variant={activeSlide.layout === lay.id ? "default" : "outline"}
                        className={cn(
                          "p-2 border rounded-lg text-left transition font-medium flex flex-col justify-between h-15",
                          activeSlide.layout === lay.id
                            ? 'border-blue-500 bg-blue-950/45 text-blue-400 font-black shadow-md'
                            : 'border-slate-700 hover:border-slate-600 text-slate-400 bg-slate-800 hover:text-white'
                        )}
                      >
                        <Layout className="w-3.5 h-3.5 text-slate-500 mx-auto mb-1" />
                        <span className="block text-[9.5px] truncate text-center">{lay.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 2. CORE FIELDS (TITLE & SUBTITLE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9.5px] font-bold text-slate-400 uppercase font-mono tracking-wider mb-1">Título do Slide</label>
                    <input
                      type="text"
                      value={activeSlide.titulo || activeSlide.title || ''}
                      onChange={(e) => updateSlideField(activeSlide.id, 'titulo', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-700 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                      placeholder="Ex. 1. Sequência FIFO"
                    />
                  </div>

                  <div>
                    <label className="block text-[9.5px] font-bold text-slate-400 uppercase font-mono tracking-wider mb-1">Subtítulo ou Etiqueta de Chão</label>
                    <input
                      type="text"
                      value={activeSlide.subtitulo || activeSlide.subtitle || ''}
                      onChange={(e) => updateSlideField(activeSlide.id, 'subtitulo', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-700 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                      placeholder="Ex. Registro de lote operador"
                    />
                  </div>
                </div>

                {/* 3. FREE FORMAT DESC DESCRIPTION TEXTFIELD */}
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-400 uppercase font-mono tracking-wider mb-1">Texto Descritivo / Parágrafo</label>
                  <Textarea
                    value={activeSlide.texto || activeSlide.freeText || ''}
                    onChange={(e) => updateSlideField(activeSlide.id, 'texto', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-sans font-medium leading-relaxed"
                    placeholder="Instruções de segurança ou o texto de contexto do slide..."
                  />
                </div>

                {/* 4. CONDITIONAL COMPONENT: BULLETS OR CHECKLIST BUILDERS */}
                {['bullets-only', 'bullets', 'checklist', 'two-columns', 'step-by-step', 'flow'].includes(activeSlide.layout || '') && (
                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-3 shadow-inner">
                    <span className="font-bold text-slate-400 tracking-wider uppercase text-[9px] block font-mono">
                      Pontos de Procedimento Operacional (Bullets / Checklist)
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={bulletDraft}
                        onChange={(e) => setBulletDraft(e.target.value)}
                        placeholder="Ex. Conferir temperatura na válvula de entrada"
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-700 rounded-lg bg-slate-900 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                        onKeyDown={(e) => { if (e.key === 'Enter') addBulletPoint(); }}
                      />
                      <Button
                        type="button"
                        onClick={addBulletPoint}
                        size="sm"
                        className="px-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-lg text-[10.5px] uppercase tracking-wider"
                      >
                        Incluir
                      </Button>
                    </div>

                    <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                      {activeSlide.listItems?.map((item, idindex) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-700/60 rounded-lg">
                          <span className="font-bold text-[10.5px] text-slate-300 line-clamp-1 flex-1 font-sans">
                            {idindex + 1}. {item.text}
                          </span>
                          <Button
                            type="button"
                            onClick={() => deleteBulletPoint(item.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/20 p-1.5 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                      {(!activeSlide.listItems || activeSlide.listItems.length === 0) && (
                        <p className="text-[10px] text-slate-500 italic">Nenhum bullet ponto cadastrado. Inclua procedimentos acima.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. FLOW CHART / PROCESS NODES FLOW MANAGER BLOCK */}
                {['flow'].includes(activeSlide.layout || '') && (
                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-3 shadow-inner">
                    <span className="font-bold text-slate-400 tracking-wider uppercase text-[9px] block font-mono flex items-center gap-1.5">
                      <GitCommit className="w-3.5 h-3.5 text-blue-400" /> Fluxograma / Timeline Estágios Editor
                    </span>
                    
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={flowNodeLabelDraft}
                        onChange={(e) => setFlowNodeLabelDraft(e.target.value)}
                        placeholder="Rótulo ex: Triagem de Forno"
                        className="w-full px-3 py-1.5 text-xs border border-slate-700 rounded-lg bg-slate-900 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={flowNodeDescDraft}
                          onChange={(e) => setFlowNodeDescDraft(e.target.value)}
                          placeholder="Fórmula de fixação (descrição rápida...)"
                          className="flex-1 px-3 py-1.5 text-xs border border-slate-700 rounded-lg bg-slate-900 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          onKeyDown={(e) => { if (e.key === 'Enter') addFlowNode(); }}
                        />
                        <Button
                          type="button"
                          onClick={addFlowNode}
                          size="sm"
                          className="px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-[10.5px] uppercase tracking-wider"
                        >
                          Anexar Etapa
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {activeSlide.flowNodes?.map((node, nodeIdx) => (
                        <div key={node.id} className="flex items-start justify-between p-2 bg-slate-900 border border-slate-700/60 rounded-lg">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[10.5px] text-slate-300">{nodeIdx + 1}. {node.label}</p>
                            {node.description && (
                              <p className="text-[9px] text-slate-500 mt-0.5">{node.description}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            onClick={() => deleteFlowNode(node.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/20 p-1.5 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                Selecione um slide para editar
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Media Library & Preview */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold font-mono text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" /> Biblioteca de Mídia
            </h3>
            <Button
              onClick={onOpenMediaLibrary}
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" /> Abrir Biblioteca
            </Button>
          </div>

          {/* Slide Preview */}
          {activeSlide && (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-bold font-mono text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> Preview do Slide
              </h3>
              <div className="bg-slate-800 rounded-lg p-4 min-h-[200px] border border-slate-700">
                <h4 className="text-lg font-bold text-white mb-2">{activeSlide.titulo || activeSlide.title}</h4>
                {activeSlide.subtitulo && (
                  <p className="text-sm text-slate-400 mb-3">{activeSlide.subtitulo}</p>
                )}
                {activeSlide.texto && (
                  <p className="text-sm text-slate-300 leading-relaxed">{activeSlide.texto}</p>
                )}
                {activeSlide.imageUrl && (
                  <img src={activeSlide.imageUrl} alt="" className="mt-3 rounded-lg w-full" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
