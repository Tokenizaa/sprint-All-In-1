import { useState, useEffect, useRef } from "react";
import { Clock, ChevronLeft, ChevronRight, Expand, Minimize, Eye, EyeOff, Timer, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PresentationTheme } from "@/lib/presentation-themes";

export interface Slide {
  id: string;
  titulo: string;
  subtitulo?: string;
  texto?: string;
  imagem_url?: string;
  video_url?: string;
  notas?: string;
  topicos?: string[];
}

interface PresenterModeProps {
  slides: Slide[];
  theme: PresentationTheme;
  presentationTitle: string;
  onExit: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSlideChange?: (index: number) => void;
}

export function PresenterMode({ 
  slides, 
  theme, 
  presentationTitle,
  onExit,
  onNext,
  onPrevious,
  onSlideChange 
}: PresenterModeProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [showNextSlide, setShowNextSlide] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[currentSlideIndex];
  const nextSlide = slides[currentSlideIndex + 1];
  const progress = ((currentSlideIndex + 1) / slides.length) * 100;

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "Enter":
          e.preventDefault();
          handleNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrevious();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "n":
        case "N":
          e.preventDefault();
          setShowNotes(prev => !prev);
          break;
        case "p":
        case "P":
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case "Escape":
          if (isFullscreen) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlideIndex, isFullscreen, isPlaying]);

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      const nextIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIndex);
      onSlideChange?.(nextIndex);
      onNext?.();
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      const prevIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(prevIndex);
      onSlideChange?.(prevIndex);
      onPrevious?.();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className="h-screen flex flex-col"
      style={{ 
        backgroundColor: theme.background,
        fontFamily: theme.fontFamily 
      }}
    >
      {/* Top Bar */}
      <div 
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ 
          borderColor: theme.border,
          backgroundColor: theme.surface 
        }}
      >
        <div className="flex items-center gap-4">
          <h1 
            className="font-semibold"
            style={{ color: theme.textPrimary }}
          >
            {presentationTitle}
          </h1>
          
          <div 
            className="flex items-center gap-2 px-3 py-1 rounded-md"
            style={{ backgroundColor: theme.border }}
          >
            <Clock className="size-4" style={{ color: theme.textSecondary }} />
            <span 
              className="font-mono text-sm"
              style={{ color: theme.textPrimary }}
            >
              {formatTime(elapsedTime)}
            </span>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg hover:opacity-80 transition"
            style={{ color: theme.textSecondary }}
            title={isPlaying ? "Pausar" : "Iniciar"}
          >
            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="p-2 rounded-lg hover:opacity-80 transition"
            style={{ color: theme.textSecondary }}
            title={showNotes ? "Ocultar notas" : "Mostrar notas"}
          >
            {showNotes ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:opacity-80 transition"
            style={{ color: theme.textSecondary }}
            title={isFullscreen ? "Sair do modo tela cheia" : "Modo tela cheia"}
          >
            {isFullscreen ? <Minimize className="size-4" /> : <Expand className="size-4" />}
          </button>

          <Button
            onClick={onExit}
            variant="outline"
            size="sm"
          >
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Current Slide */}
        <div className="flex-1 p-8 flex items-center justify-center">
          <div 
            className="w-full max-w-5xl aspect-video rounded-lg p-12 flex flex-col items-center justify-center text-center"
            style={{ 
              backgroundColor: theme.surface,
              border: `2px solid ${theme.border}`
            }}
          >
            {currentSlide.imagem_url && (
              <img 
                src={currentSlide.imagem_url} 
                alt="" 
                className="max-h-48 w-auto mb-6"
              />
            )}
            
            <h2 
              className="text-4xl font-bold mb-4"
              style={{ color: theme.textPrimary }}
            >
              {currentSlide.titulo}
            </h2>
            
            {currentSlide.subtitulo && (
              <p 
                className="text-2xl mb-6"
                style={{ color: theme.textSecondary }}
              >
                {currentSlide.subtitulo}
              </p>
            )}
            
            {currentSlide.texto && (
              <p 
                className="text-lg max-w-3xl"
                style={{ color: theme.textPrimary }}
              >
                {currentSlide.texto}
              </p>
            )}

            {currentSlide.topicos && currentSlide.topicos.length > 0 && (
              <div className="mt-8 space-y-2">
                {currentSlide.topicos.map((topico, index) => (
                  <div 
                    key={index}
                    className="text-left"
                    style={{ color: theme.textPrimary }}
                  >
                    {topico}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div 
          className={cn(
            "w-80 border-l transition-all duration-300",
            showNotes ? "translate-x-0" : "translate-x-full absolute right-0 h-full"
          )}
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          {/* Progress */}
          <div className="p-4 border-b" style={{ borderColor: theme.border }}>
            <div className="flex items-center justify-between mb-2">
              <span 
                className="text-sm font-medium"
                style={{ color: theme.textSecondary }}
              >
                Progresso
              </span>
              <span 
                className="text-sm font-mono"
                style={{ color: theme.textPrimary }}
              >
                {currentSlideIndex + 1} / {slides.length}
              </span>
            </div>
            <div 
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: theme.border }}
            >
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: theme.primary 
                }}
              />
            </div>
          </div>

          {/* Next Slide Preview */}
          {showNextSlide && nextSlide && (
            <div className="p-4 border-b" style={{ borderColor: theme.border }}>
              <span 
                className="text-xs font-medium mb-2 block"
                style={{ color: theme.textMuted }}
              >
                PRÓXIMO SLIDE
              </span>
              <div 
                className="p-3 rounded-lg text-center"
                style={{ backgroundColor: theme.background, border: `1px solid ${theme.border}` }}
              >
                <h3 
                  className="text-sm font-semibold mb-1"
                  style={{ color: theme.textPrimary }}
                >
                  {nextSlide.titulo}
                </h3>
                {nextSlide.subtitulo && (
                  <p 
                    className="text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    {nextSlide.subtitulo}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Presenter Notes */}
          {currentSlide.notas && (
            <div className="p-4 flex-1 overflow-auto">
              <span 
                className="text-xs font-medium mb-2 block"
                style={{ color: theme.textMuted }}
              >
                NOTAS DO APRESENTADOR
              </span>
              <Textarea
                defaultValue={currentSlide.notas}
                className="w-full min-h-[200px] resize-none text-sm"
                style={{ 
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                  fontFamily: theme.fontFamily
                }}
                placeholder="Adicione notas para este slide..."
              />
            </div>
          )}

          {/* Slide Thumbnails */}
          <div className="p-4 border-t" style={{ borderColor: theme.border }}>
            <span 
              className="text-xs font-medium mb-2 block"
              style={{ color: theme.textMuted }}
            >
              MINIATURAS
            </span>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => {
                    setCurrentSlideIndex(index);
                    onSlideChange?.(index);
                  }}
                  className={cn(
                    "aspect-video rounded-lg p-2 text-center transition",
                    index === currentSlideIndex && "ring-2"
                  )}
                  style={{
                    backgroundColor: index === currentSlideIndex 
                      ? `${theme.primary}30` 
                      : theme.background,
                    borderColor: index === currentSlideIndex ? theme.primary : theme.border,
                    borderWidth: index === currentSlideIndex ? "2px" : "1px"
                  }}
                >
                  <span 
                    className="text-[10px] font-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    {index + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-t"
        style={{ 
          borderColor: theme.border,
          backgroundColor: theme.surface 
        }}
      >
        <Button
          onClick={handlePrevious}
          disabled={currentSlideIndex === 0}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          <span 
            className="text-sm"
            style={{ color: theme.textMuted }}
          >
            Use as setas ← → ou Espaço para navegar
          </span>
        </div>

        <Button
          onClick={handleNext}
          disabled={currentSlideIndex === slides.length - 1}
          size="sm"
          className="gap-2"
          style={{ backgroundColor: theme.primary }}
        >
          Próximo
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
