import { useState, useEffect } from "react";
import { X, Plus, Save, FolderOpen, FileText, Check, ChevronLeft, ChevronRight, Tag, Layout, Sparkles, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SlideEditor, type Slide } from "@/components/slide-editor";
import { useModuleForm } from "@/hooks/useModuleForm";
import { cn } from "@/lib/utils";
import { type ModuleRecord } from "@/lib/store";

type Draft = {
  titulo: string;
  descricao: string;
  categoria: string;
  status: string;
};

const emptyDraft: Draft = {
  titulo: "",
  descricao: "",
  categoria: "",
  status: "rascunho",
};

const STEPS = [
  { icon: Tag, title: "Informações", desc: "Título e descrição" },
  { icon: FolderOpen, title: "Categoria", desc: "Organização" },
  { icon: Layers, title: "Slides", desc: "Conteúdo da apresentação" },
  { icon: Layout, title: "Status", desc: "Estado da apresentação" },
] as const;

const CATEGORIAS = [
  "Visão Geral",
  "Implantação",
  "Cadastros",
  "Produção",
  "Estoque",
  "Qualidade",
  "Treinamentos",
];

const STATUS_OPTIONS = [
  { value: "rascunho", label: "Rascunho", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { value: "revisao", label: "Em Revisão", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { value: "publicado", label: "Publicado", color: "bg-green-500/10 text-green-500 border-green-500/20" },
];

interface PresentationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ModuleRecord | null;
}

export function PresentationForm({ open, onOpenChange, editing }: PresentationFormProps) {
  const [step, setStep] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const { data, setField, canSave, submit, reset, setData } = useModuleForm<Draft>({
    moduleKey: "apresentacoes",
    initialData: emptyDraft,
    toRecord: (d) => {
      const meta: Record<string, string> = {
        categoria: d.categoria,
        status: d.status,
        descricao: d.descricao,
        slides_count: slides.length.toString(),
        slides_json: JSON.stringify(slides),
      };
      return { name: d.titulo.trim(), meta };
    },
    validate: (d) => {
      if (d.titulo.trim().length === 0) {
        return { titulo: "Título é obrigatório" };
      }
      if (d.categoria === "") {
        return { categoria: "Categoria é obrigatória" };
      }
      if (slides.length < 5) {
        return { slides: "Mínimo de 5 slides é obrigatório" };
      }
      return {};
    },
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        const meta = editing.meta || {};
        setData({
          titulo: editing.name,
          descricao: meta.descricao || "",
          categoria: meta.categoria || "",
          status: meta.status || "rascunho",
        });
        // Load existing slides
        try {
          const existingSlides = JSON.parse(meta.slides_json || "[]");
          setSlides(existingSlides);
          setCurrentSlideIndex(0);
        } catch {
          setSlides([]);
          setCurrentSlideIndex(0);
        }
        setStep(0);
      } else {
        reset();
        setSlides([]);
        setCurrentSlideIndex(0);
        setStep(0);
      }
    }
  }, [open, editing, reset, setData]);

  const handleSave = () => {
    submit(editing ? { kind: "edit", record: editing! } : { kind: "create" });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle>{editing ? "Editar Apresentação" : "Nova Apresentação"}</SheetTitle>
          <SheetDescription>Crie apresentações de treinamento para o Industrial OS</SheetDescription>
        </SheetHeader>

        <ol className="flex items-stretch gap-0 overflow-x-auto border-b border-border bg-muted/30 px-2 py-2 text-xs">
          {STEPS.map((s, i) => (
            <li key={i} className="flex items-center">
              <button
                onClick={() => setStep(i)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 transition",
                  i === step ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/50"
                )}
              >
                <s.icon className="size-3.5" />
                <div className="text-left">
                  <div className="font-medium leading-tight">{s.title}</div>
                  <div className="text-[10px] text-muted-foreground/80">{s.desc}</div>
                </div>
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="size-3 text-muted-foreground/40" />}
            </li>
          ))}
        </ol>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="titulo">Título da Apresentação *</Label>
                <Input
                  id="titulo"
                  autoFocus
                  value={data.titulo}
                  onChange={(e) => setField("titulo", e.target.value)}
                  placeholder="Ex.: Conhecendo o Industrial OS"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={data.descricao}
                  onChange={(e) => setField("descricao", e.target.value)}
                  placeholder="Descreva o objetivo e conteúdo desta apresentação..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Categoria *</Label>
                <Select value={data.categoria} onValueChange={(value) => setField("categoria", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-md border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                <p className="font-medium mb-2">Categorias disponíveis:</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS.map((cat) => (
                    <Badge key={cat} variant="outline" className="cursor-pointer hover:bg-muted">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-md border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                <p className="font-medium mb-2">Regras de slides:</p>
                <ul className="space-y-1">
                  <li>• Mínimo: 5 slides</li>
                  <li>• Máximo: 8 slides</li>
                  <li>• Cada slide pode ter título, subtítulo, texto, imagem, vídeo e elementos</li>
                </ul>
              </div>
              <SlideEditor
                slides={slides}
                onSlidesChange={setSlides}
                currentSlideIndex={currentSlideIndex}
                onSlideIndexChange={setCurrentSlideIndex}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={data.status} onValueChange={(value) => setField("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(opt.color)}>
                            {opt.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                {STATUS_OPTIONS.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setField("status", opt.value)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3 cursor-pointer transition",
                      data.status === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("size-4 rounded-full border-2", data.status === opt.value ? "border-primary bg-primary" : "border-border")} />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </div>
                    <Badge variant="outline" className={cn(opt.color)}>
                      {opt.label}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 p-4">
          <div className="text-xs text-muted-foreground">
            Etapa {step + 1} de {STEPS.length}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft className="size-4" /> Voltar
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>
                Próximo <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={!canSave} className="gap-1.5">
                <Check className="size-4" /> {editing ? "Salvar" : "Criar apresentação"}
              </Button>
            )}
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
