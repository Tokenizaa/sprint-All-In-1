import { useState } from "react";
import { X, ChevronRight, List, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PresentationTheme } from "@/lib/presentation-themes";

export interface Topic {
  id: string;
  title: string;
  slideIndex: number;
  completed?: boolean;
}

interface TopicNavigationProps {
  topics: Topic[];
  currentSlideIndex: number;
  onTopicClick: (slideIndex: number) => void;
  theme: PresentationTheme;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TopicNavigation({ 
  topics, 
  currentSlideIndex, 
  onTopicClick, 
  theme,
  isOpen = false,
  onOpenChange 
}: TopicNavigationProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const currentTopic = topics.find(t => t.slideIndex === currentSlideIndex);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => handleOpenChange(true)}
        className={cn(
          "fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg transition",
          "hover:scale-105"
        )}
        style={{
          backgroundColor: theme.surface,
          border: `1px solid ${theme.border}`,
          color: theme.textPrimary
        }}
        title="Índice"
      >
        <Menu className="size-6" />
      </button>

      {/* Topic Navigation Panel */}
      {open && (
        <div 
          className="fixed inset-y-0 right-0 z-50 w-80 shadow-2xl overflow-hidden"
          style={{ backgroundColor: theme.background }}
        >
          <div 
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: theme.border, backgroundColor: theme.surface }}
          >
            <div className="flex items-center gap-2">
              <List className="size-5" style={{ color: theme.primary }} />
              <h2 
                className="font-semibold"
                style={{ color: theme.textPrimary, fontFamily: theme.fontFamily }}
              >
                Índice
              </h2>
            </div>
            <button
              onClick={() => handleOpenChange(false)}
              className="p-2 rounded-lg hover:opacity-80 transition"
              style={{ color: theme.textSecondary }}
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {topics.map((topic, index) => (
                <button
                  key={topic.id}
                  onClick={() => {
                    onTopicClick(topic.slideIndex);
                    handleOpenChange(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition text-left",
                    topic.slideIndex === currentSlideIndex
                      ? "ring-2"
                      : "hover:opacity-80"
                  )}
                  style={{
                    backgroundColor: topic.slideIndex === currentSlideIndex 
                      ? `${theme.primary}20` 
                      : theme.surface,
                    borderColor: topic.slideIndex === currentSlideIndex 
                      ? theme.primary 
                      : theme.border,
                    borderWidth: topic.slideIndex === currentSlideIndex ? "2px" : "1px"
                  }}
                >
                  <div 
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{
                      backgroundColor: topic.completed ? theme.accent : theme.border,
                      color: topic.completed ? "#FFFFFF" : theme.textSecondary
                    }}
                  >
                    {topic.completed ? "✓" : index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p 
                      className={cn(
                        "font-medium truncate",
                        topic.slideIndex === currentSlideIndex && "font-semibold"
                      )}
                      style={{ 
                        color: topic.slideIndex === currentSlideIndex 
                          ? theme.primary 
                          : theme.textPrimary,
                        fontFamily: theme.fontFamily
                      }}
                    >
                      {topic.title}
                    </p>
                  </div>

                  {topic.slideIndex === currentSlideIndex && (
                    <ChevronRight 
                      className="size-4 flex-shrink-0" 
                      style={{ color: theme.primary }} 
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Current Topic Indicator */}
          {currentTopic && (
            <div 
              className="p-4 border-t"
              style={{ 
                borderColor: theme.border,
                backgroundColor: theme.surface 
              }}
            >
              <p 
                className="text-xs mb-1"
                style={{ color: theme.textMuted, fontFamily: theme.fontFamily }}
              >
                Tópico Atual
              </p>
              <p 
                className="font-semibold"
                style={{ color: theme.primary, fontFamily: theme.fontFamily }}
              >
                {currentTopic.title}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => handleOpenChange(false)}
        />
      )}
    </>
  );
}

// ============================================================================
// FUNÇÃO PARA GERAR TÓPICOS AUTOMATICAMENTE
// ============================================================================
export function generateTopicsFromSlides(slides: any[]): Topic[] {
  return slides.map((slide, index) => ({
    id: slide.id || crypto.randomUUID(),
    title: slide.titulo || `Slide ${index + 1}`,
    slideIndex: index,
    completed: index < Math.floor(slides.length / 2), // Simulação: primeiros 50% como completos
  }));
}

// ============================================================================
// COMPONENTE DE NAVEGAÇÃO POR TÓPICOS (INLINE)
// ============================================================================
interface InlineTopicNavigationProps {
  topics: Topic[];
  currentSlideIndex: number;
  onTopicClick: (slideIndex: number) => void;
  theme: PresentationTheme;
  compact?: boolean;
}

export function InlineTopicNavigation({ 
  topics, 
  currentSlideIndex, 
  onTopicClick, 
  theme,
  compact = false 
}: InlineTopicNavigationProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-2 overflow-x-auto",
        compact ? "p-2" : "p-4"
      )}
      style={{ 
        backgroundColor: theme.surface,
        borderColor: theme.border,
        borderWidth: "1px"
      }}
    >
      {topics.map((topic, index) => (
        <button
          key={topic.id}
          onClick={() => onTopicClick(topic.slideIndex)}
          className={cn(
            "flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap",
            topic.slideIndex === currentSlideIndex
              ? "ring-2"
              : "hover:opacity-80"
          )}
          style={{
            backgroundColor: topic.slideIndex === currentSlideIndex 
              ? theme.primary 
              : theme.border,
            color: topic.slideIndex === currentSlideIndex 
              ? "#FFFFFF" 
              : theme.textSecondary,
            fontFamily: theme.fontFamily,
            borderColor: topic.slideIndex === currentSlideIndex 
              ? theme.primary 
              : theme.border,
            borderWidth: topic.slideIndex === currentSlideIndex ? "2px" : "1px"
          }}
        >
          {compact ? index + 1 : topic.title}
        </button>
      ))}
    </div>
  );
}
