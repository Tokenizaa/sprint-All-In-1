import { useState } from "react";
import { Plus, Upload, Image as ImageIcon, Video, Search, Filter, X, Trash2, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface MediaItem {
  id: string;
  nome: string;
  descricao: string;
  tipo: "imagem" | "video" | "logo" | "print";
  url: string;
  metadados: Record<string, string>;
  created_at: string;
}

interface MediaLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMedia: (media: MediaItem) => void;
}

export function MediaLibrary({ open, onOpenChange, onSelectMedia }: MediaLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [uploadOpen, setUploadOpen] = useState(false);

  // Simulated media items
  const [mediaItems] = useState<MediaItem[]>([
    {
      id: "1",
      nome: "Logo Industrial OS",
      descricao: "Logo oficial do sistema",
      tipo: "logo",
      url: "https://via.placeholder.com/150",
      metadados: {},
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      nome: "Dashboard Print",
      descricao: "Print do dashboard principal",
      tipo: "print",
      url: "https://via.placeholder.com/150",
      metadados: {},
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      nome: "Tutorial Video",
      descricao: "Vídeo de tutorial",
      tipo: "video",
      url: "https://via.placeholder.com/150",
      metadados: {},
      created_at: new Date().toISOString(),
    },
  ]);

  const filteredItems = mediaItems.filter((item) => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.tipo === filterType;
    return matchesSearch && matchesType;
  });

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Biblioteca de Mídia</span>
            <Button onClick={() => setUploadOpen(true)} className="gap-1.5">
              <Upload className="size-4" /> Upload
            </Button>
          </DialogTitle>
          <DialogDescription>
            Gerencie imagens, vídeos e outros recursos para suas apresentações
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 pb-4 border-b border-border">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar mídia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="imagem">Imagens</SelectItem>
              <SelectItem value="video">Vídeos</SelectItem>
              <SelectItem value="logo">Logos</SelectItem>
              <SelectItem value="print">Prints</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="grid size-16 place-items-center rounded-full bg-muted mb-4">
                <ImageIcon className="size-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {searchTerm || filterType !== "all" ? "Nenhuma mídia encontrada" : "Nenhuma mídia cadastrada"}
              </p>
              <Button onClick={() => setUploadOpen(true)} variant="outline" className="gap-1.5">
                <Plus className="size-4" /> Adicionar primeira mídia
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onSelect={() => {
                    onSelectMedia(item);
                    onOpenChange(false);
                  }}
                  onCopyUrl={() => handleCopyUrl(item.url)}
                />
              ))}
            </div>
          )}
        </div>

        {uploadOpen && <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />}
      </DialogContent>
    </Dialog>
  );
}

function MediaCard({ item, onSelect, onCopyUrl }: { key?: any; item: MediaItem; onSelect: () => void; onCopyUrl: () => void }) {
  const typeColors = {
    imagem: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    video: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    logo: "bg-green-500/10 text-green-500 border-green-500/20",
    print: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  };

  const typeIcons = {
    imagem: ImageIcon,
    video: Video,
    logo: ImageIcon,
    print: ImageIcon,
  };

  const TypeIcon = typeIcons[item.tipo];

  return (
    <Card className="group cursor-pointer hover:ring-1 hover:ring-primary/30 transition overflow-hidden">
      <CardContent className="p-0">
        <div
          className="aspect-video bg-muted flex items-center justify-center relative"
          onClick={onSelect}
        >
          <TypeIcon className="size-8 text-muted-foreground" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.nome}</p>
              <p className="text-[10px] text-muted-foreground truncate">{item.descricao}</p>
            </div>
            <Badge variant="outline" className={cn("text-[10px] h-5", typeColors[item.tipo])}>
              {item.tipo}
            </Badge>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" onClick={onSelect}>
              Selecionar
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCopyUrl}>
              <Copy className="size-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UploadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"imagem" | "video" | "logo" | "print">("imagem");
  const [url, setUrl] = useState("");

  const handleUpload = () => {
    // TODO: Implement upload logic
    console.log("Upload:", { nome, descricao, tipo, url });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload de Mídia</DialogTitle>
          <DialogDescription>Adicione uma nova mídia à biblioteca</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome *</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da mídia" />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição da mídia" />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo *</Label>
            <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imagem">Imagem</SelectItem>
                <SelectItem value="video">Vídeo</SelectItem>
                <SelectItem value="logo">Logo</SelectItem>
                <SelectItem value="print">Print</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>URL *</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={!nome || !url}>
              Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
