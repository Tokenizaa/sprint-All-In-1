import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Presentation as PresentationIcon, Pencil, Trash2, FileText, Clock, Eye, FolderOpen, Sparkles, MoreVertical, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ModuleHeader } from "@/components/module-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IndustrialAgent } from "@/components/industrial-copilot";
import { PresentationForm } from "@/components/presentation-form";
import { PresentationEditor } from "@/components/presentation/presentation-editor";
import { MediaLibrary } from "@/components/presentation/media-library";
import { ExportModal } from "@/components/presentation/export-modal";
import { MODULES } from "@/lib/modules";
import { removeRecord, useStore, type ModuleRecord } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Presentation, MediaAsset, Slide, Category, Status } from "@/lib/presentation-types";
import { INITIAL_PRESENTATIONS, INITIAL_MEDIA_LIBRARY, CATEGORIES } from "@/lib/presentation-mock-data";
import { 
  fetchPresentations, 
  createPresentation, 
  updatePresentation, 
  deletePresentation,
  fetchMedia,
  createMedia,
  deleteMedia
} from "@/lib/presentation-service";

const mod = MODULES.find((m) => m.key === "apresentacoes")!;

export const Route = createFileRoute("/apresentacoes")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

function Page() {
  const records = useStore((s) => s.records.apresentacoes);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);
  
  // Advanced editor state
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [mediaList, setMediaList] = useState<MediaAsset[]>(INITIAL_MEDIA_LIBRARY);
  const [presentations, setPresentations] = useState<Presentation[]>(INITIAL_PRESENTATIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do Supabase ao montar
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        const [presentationsData, mediaData] = await Promise.all([
          fetchPresentations(),
          fetchMedia()
        ]);
        
        setPresentations(presentationsData);
        setMediaList(mediaData);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados do Supabase. Usando dados locais.');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Simulated data for dashboard - usando dados do Supabase
  const stats = {
    total: presentations.length,
    published: presentations.filter(p => p.status === 'Publicado').length,
    draft: presentations.filter(p => p.status === 'Rascunho').length,
    review: presentations.filter(p => p.status === 'Em Revisão').length,
  };

  const recentPresentations = presentations.slice(0, 3);

  // Advanced editor handlers
  const handleSelectPresentation = (id: string, forPresentMode: boolean = false) => {
    const pres = presentations.find(p => p.id === id);
    if (pres) {
      setSelectedPresentation(pres);
      if (forPresentMode) {
        // TODO: Implement presenter mode
        alert('Modo apresentação será implementado');
      } else {
        setShowAdvancedEditor(true);
      }
    }
  };

  const handleSavePresentation = async (updated: Presentation) => {
    try {
      setLoading(true);
      setError(null);
      
      const existing = presentations.find(p => p.id === updated.id);
      let saved: Presentation;
      
      if (existing) {
        saved = await updatePresentation(updated.id, updated);
      } else {
        saved = await createPresentation(updated);
      }
      
      setPresentations(prev => prev.map(p => p.id === saved.id ? saved : p));
    } catch (err) {
      console.error('Erro ao salvar apresentação:', err);
      setError('Erro ao salvar apresentação');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleAddMediaAsset = async (asset: MediaAsset) => {
    try {
      setLoading(true);
      setError(null);
      
      const saved = await createMedia(asset);
      setMediaList(prev => [...prev, saved]);
    } catch (err) {
      console.error('Erro ao adicionar mídia:', err);
      setError('Erro ao adicionar mídia');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMediaAsset = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteMedia(id);
      setMediaList(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Erro ao deletar mídia:', err);
      setError('Erro ao deletar mídia');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ModuleHeader mod={mod} action={
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      } />

      {error && (
        <div className="bg-amber-950/25 border border-amber-900/50 rounded-xl p-4 flex gap-3 text-amber-300">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold font-mono">Aviso de Conexão</p>
            <p className="mt-0.5 text-slate-400 leading-normal">{error}</p>
          </div>
        </div>
      )}

      <IndustrialAgent moduleKey="apresentacoes" />

      {presentations.length === 0 ? (
        <EmptyState 
          icon={mod.icon} 
          title={`Comece pelo módulo ${mod.title}`} 
          description={mod.description}
          benefit={mod.benefit} 
          checklist={mod.checklist} 
          primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} 
        />
      ) : (
        <div className="space-y-6">
          {/* Dashboard Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total de Apresentações" value={stats.total} icon={PresentationIcon} color="blue" />
            <StatCard title="Publicadas" value={stats.published} icon={Eye} color="green" />
            <StatCard title="Rascunhos" value={stats.draft} icon={FileText} color="yellow" />
            <StatCard title="Em Revisão" value={stats.review} icon={Clock} color="purple" />
          </div>

          {/* Recent Presentations */}
          {recentPresentations.length > 0 && (
            <Card className="surface-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-4" />
                  Apresentações Recentes
                </CardTitle>
                <CardDescription>Últimas apresentações atualizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPresentations.map((p) => (
                    <RecentPresentationItem key={p.id} presentation={p} onEdit={() => handleSelectPresentation(p.id)} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Presentations Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Todas as Apresentações</h2>
              <div className="flex gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">Todas</Badge>
                <Badge variant="secondary" className="cursor-pointer">Publicadas</Badge>
                <Badge variant="secondary" className="cursor-pointer">Rascunhos</Badge>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {presentations.map((p) => (
                <PresentationCardAdvanced 
                  key={p.id} 
                  presentation={p} 
                  onEdit={() => handleSelectPresentation(p.id)}
                  onDelete={() => { if (confirm(`Remover "${p.title}"?`)) deletePresentation(p.id); }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <PresentationForm open={open} onOpenChange={setOpen} editing={editing} />

      {/* Advanced Editor Modal */}
      {showAdvancedEditor && selectedPresentation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
          <div className="min-h-screen p-4">
            <PresentationEditor
              presentation={selectedPresentation}
              onSave={handleSavePresentation}
              onBack={() => setShowAdvancedEditor(false)}
              onPresent={() => alert('Modo apresentação será implementado')}
              onExport={() => setShowExportModal(true)}
              mediaList={mediaList}
              onOpenMediaLibrary={() => setShowMediaLibrary(true)}
            />
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
          <div className="min-h-screen p-4">
            <MediaLibrary
              mediaList={mediaList}
              onAddAsset={handleAddMediaAsset}
              onDeleteAsset={handleDeleteMediaAsset}
              onClose={() => setShowMediaLibrary(false)}
            />
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && selectedPresentation && (
        <ExportModal
          presentation={selectedPresentation}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };

  return (
    <Card className={cn("surface-elevated", colors[color as keyof typeof colors])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <Icon className="size-8 opacity-50" />
        </div>
      </CardContent>
    </Card>
  );
}

function RecentPresentationItem({ presentation, onEdit }: { key?: any; presentation: Presentation; onEdit: () => void }) {
  const statusColors = {
    'Rascunho': "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    'Em Revisão': "bg-purple-500/10 text-purple-500 border-purple-500/20",
    'Publicado': "bg-green-500/10 text-green-500 border-green-500/20",
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3 hover:bg-muted/30 transition cursor-pointer" onClick={onEdit}>
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-primary/10">
          <PresentationIcon className="size-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm">{presentation.title}</p>
          <p className="text-xs text-muted-foreground">{presentation.category || "Sem categoria"}</p>
        </div>
      </div>
      <Badge variant="outline" className={cn(statusColors[presentation.status as keyof typeof statusColors])}>
        {presentation.status}
      </Badge>
    </div>
  );
}

function PresentationCardAdvanced({ presentation, onEdit, onDelete }: { key?: any; presentation: Presentation; onEdit: () => void; onDelete: () => void }) {
  const statusColors = {
    'Rascunho': "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    'Em Revisão': "bg-purple-500/10 text-purple-500 border-purple-500/20",
    'Publicado': "bg-green-500/10 text-green-500 border-green-500/20",
  };

  const slidesCount = presentation.slides.length;

  return (
    <Card className="surface-elevated group hover:ring-1 hover:ring-primary/30 transition">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-primary/10">
              <PresentationIcon className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{presentation.title}</CardTitle>
              <CardDescription className="text-xs">{presentation.category || "Sem categoria"}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={cn(statusColors[presentation.status as keyof typeof statusColors])}>
            {presentation.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{presentation.description || "Sem descrição"}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FolderOpen className="size-3" />
            <span>{slidesCount} slides</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            <span>Atualizado há {presentation.updatedAt ? new Date(presentation.updatedAt).toLocaleDateString() : 'hoje'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border opacity-0 group-hover:opacity-100 transition">
          <Button variant="ghost" size="sm" className="flex-1 gap-1.5" onClick={onEdit}>
            <Pencil className="size-3.5" /> Editar
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="size-3.5" /> Remover
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
