import { useState } from "react";
import { Plus, Trash2, GripVertical, Type, Image, Video, List, ChevronUp, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SlideElement {
  id: string;
  type: "text" | "image" | "video" | "list";
  content: string;
  order: number;
}

export interface Slide {
  id: string;
  titulo: string;
  subtitulo: string;
  texto: string;
  imagem_url: string;
  video_url: string;
  elementos: SlideElement[];
  ordem: number;
}

interface SlideEditorProps {
  slides: Slide[];
  onSlidesChange: (slides: Slide[]) => void;
  currentSlideIndex: number;
  onSlideIndexChange: (index: number) => void;
}

export function SlideEditor({ slides, onSlidesChange, currentSlideIndex, onSlideIndexChange }: SlideEditorProps) {
  const currentSlide = slides[currentSlideIndex];

  const addSlide = () => {
    if (slides.length >= 8) {
      alert("Máximo de 8 slides por apresentação");
      return;
    }
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      titulo: "",
      subtitulo: "",
      texto: "",
      imagem_url: "",
      video_url: "",
      elementos: [],
      ordem: slides.length,
    };
    onSlidesChange([...slides, newSlide]);
    onSlideIndexChange(slides.length);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 5) {
      alert("Mínimo de 5 slides por apresentação");
      return;
    }
    const newSlides = slides.filter((_, i) => i !== index);
    onSlidesChange(newSlides);
    if (currentSlideIndex >= newSlides.length) {
      onSlideIndexChange(newSlides.length - 1);
    }
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;
    
    const newSlides = [...slides];
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
    onSlidesChange(newSlides);
    onSlideIndexChange(newIndex);
  };

  const updateSlide = (updates: Partial<Slide>) => {
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = { ...currentSlide, ...updates };
    onSlidesChange(newSlides);
  };

  const addElement = (type: SlideElement["type"]) => {
    const newElement: SlideElement = {
      id: crypto.randomUUID(),
      type,
      content: "",
      order: currentSlide.elementos.length,
    };
    updateSlide({ elementos: [...currentSlide.elementos, newElement] });
  };

  const updateElement = (elementId: string, content: string) => {
    const newElementos = currentSlide.elementos.map((el) =>
      el.id === elementId ? { ...el, content } : el
    );
    updateSlide({ elementos: newElementos });
  };

  const removeElement = (elementId: string) => {
    updateSlide({ elementos: currentSlide.elementos.filter((el) => el.id !== elementId) });
  };

  const moveElement = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentSlide.elementos.length) return;
    
    const newElementos = [...currentSlide.elementos];
    [newElementos[index], newElementos[newIndex]] = [newElementos[newIndex], newElementos[index]];
    updateSlide({ elementos: newElementos });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Slide List Sidebar */}
      <Card className="surface-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Slides ({slides.length}/8)</span>
            <Button size="sm" onClick={addSlide} className="gap-1 h-7 text-xs">
              <Plus className="size-3" /> Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              onClick={() => onSlideIndexChange(index)}
              className={cn(
                "group relative rounded-lg border p-3 cursor-pointer transition",
                index === currentSlideIndex
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] h-5">
                      {index + 1}
                    </Badge>
                    <span className="text-xs font-medium truncate">
                      {slide.titulo || `Slide ${index + 1}`}
                    </span>
                  </div>
                  {slide.subtitulo && (
                    <p className="text-[10px] text-muted-foreground truncate">{slide.subtitulo}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); moveSlide(index, "up"); }}
                    disabled={index === 0}
                  >
                    <ChevronUp className="size-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); moveSlide(index, "down"); }}
                    disabled={index === slides.length - 1}
                  >
                    <ChevronDown className="size-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); removeSlide(index); }}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {slides.length < 5 && (
            <p className="text-[10px] text-muted-foreground text-center py-2">
              Mínimo de 5 slides
            </p>
          )}
        </CardContent>
      </Card>

      {/* Slide Editor */}
      <Card className="surface-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Editando Slide {currentSlideIndex + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Título</Label>
              <Input
                value={currentSlide.titulo}
                onChange={(e) => updateSlide({ titulo: e.target.value })}
                placeholder="Título do slide"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Subtítulo</Label>
              <Input
                value={currentSlide.subtitulo}
                onChange={(e) => updateSlide({ subtitulo: e.target.value })}
                placeholder="Subtítulo do slide"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Texto</Label>
              <Textarea
                value={currentSlide.texto}
                onChange={(e) => updateSlide({ texto: e.target.value })}
                placeholder="Conteúdo do slide"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">URL da Imagem</Label>
                <Input
                  value={currentSlide.imagem_url}
                  onChange={(e) => updateSlide({ imagem_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">URL do Vídeo</Label>
                <Input
                  value={currentSlide.video_url}
                  onChange={(e) => updateSlide({ video_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs">Elementos</Label>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => addElement("text")} className="gap-1 h-7 text-xs">
                  <Type className="size-3" /> Texto
                </Button>
                <Button size="sm" variant="outline" onClick={() => addElement("image")} className="gap-1 h-7 text-xs">
                  <Image className="size-3" /> Imagem
                </Button>
                <Button size="sm" variant="outline" onClick={() => addElement("video")} className="gap-1 h-7 text-xs">
                  <Video className="size-3" /> Vídeo
                </Button>
                <Button size="sm" variant="outline" onClick={() => addElement("list")} className="gap-1 h-7 text-xs">
                  <List className="size-3" /> Lista
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {currentSlide.elementos.map((element, index) => (
                <div key={element.id} className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-2">
                  <div className="flex items-center gap-1 mt-1">
                    <GripVertical className="size-4 text-muted-foreground cursor-move" />
                    <Badge variant="outline" className="text-[10px] h-5">
                      {element.type}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <Input
                      value={element.content}
                      onChange={(e) => updateElement(element.id, e.target.value)}
                      placeholder={`Conteúdo do ${element.type}`}
                      className="text-xs h-8"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => moveElement(index, "up")}
                      disabled={index === 0}
                    >
                      <ChevronUp className="size-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => moveElement(index, "down")}
                      disabled={index === currentSlide.elementos.length - 1}
                    >
                      <ChevronDown className="size-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => removeElement(element.id)}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {currentSlide.elementos.length === 0 && (
                <p className="text-[10px] text-muted-foreground text-center py-4">
                  Nenhum elemento adicionado. Clique nos botões acima para adicionar.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
