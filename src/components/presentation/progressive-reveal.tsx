import { ReactNode, useState, useEffect } from "react";
import { ChevronRight, Circle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PresentationTheme } from "@/lib/presentation-themes";

export interface ProgressiveTopic {
  id: string;
  content: ReactNode;
  revealed?: boolean;
}

interface ProgressiveRevealProps {
  topics: ProgressiveTopic[];
  theme: PresentationTheme;
  onReveal?: (topicIndex: number) => void;
  autoAdvance?: boolean;
  currentTopicIndex?: number;
}

export function ProgressiveReveal({ 
  topics, 
  theme, 
  onReveal,
  autoAdvance = false,
  currentTopicIndex: externalCurrentTopicIndex
}: ProgressiveRevealProps) {
  const [internalCurrentTopicIndex, setInternalCurrentTopicIndex] = useState(0);
  const currentTopicIndex = externalCurrentTopicIndex !== undefined 
    ? externalCurrentTopicIndex 
    : internalCurrentTopicIndex;

  const handleNext = () => {
    if (currentTopicIndex < topics.length - 1) {
      const nextIndex = currentTopicIndex + 1;
      if (onReveal) {
        onReveal(nextIndex);
      } else {
        setInternalCurrentTopicIndex(nextIndex);
      }
    }
  };

  const handleTopicClick = (index: number) => {
    if (onReveal) {
      onReveal(index);
    } else {
      setInternalCurrentTopicIndex(index);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTopicIndex, topics.length]);

  return (
    <div className="space-y-4" style={{ fontFamily: theme.fontFamily }}>
      {topics.map((topic, index) => {
        const isRevealed = index <= currentTopicIndex;
        const isCurrent = index === currentTopicIndex;

        return (
          <div
            key={topic.id}
            className={cn(
              "flex items-start gap-4 p-4 rounded-lg transition-all duration-300",
              isRevealed ? "opacity-100" : "opacity-30",
              isCurrent && "ring-2"
            )}
            style={{
              backgroundColor: isRevealed ? theme.surface : `${theme.surface}50`,
              borderColor: isCurrent ? theme.primary : theme.border,
              borderWidth: isCurrent ? "2px" : "1px"
            }}
          >
            <button
              onClick={() => handleTopicClick(index)}
              className="flex-shrink-0 mt-1"
              disabled={!isRevealed && index !== currentTopicIndex + 1}
            >
              {isRevealed ? (
                <CheckCircle2 
                  className="size-6" 
                  style={{ color: theme.accent }} 
                />
              ) : (
                <Circle 
                  className="size-6" 
                  style={{ color: theme.border }} 
                />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  "transition-all duration-300",
                  isRevealed ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                )}
              >
                {topic.content}
              </div>
            </div>

            {isCurrent && (
              <ChevronRight 
                className="size-5 flex-shrink-0 mt-1 animate-pulse" 
                style={{ color: theme.primary }} 
              />
            )}
          </div>
        );
      })}

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-2">
          {topics.map((_, index) => (
            <div
              key={index}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: "24px",
                backgroundColor: index <= currentTopicIndex ? theme.primary : theme.border,
                opacity: index === currentTopicIndex ? 1 : 0.5
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentTopicIndex >= topics.length - 1}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition",
            currentTopicIndex >= topics.length - 1 && "opacity-50 cursor-not-allowed"
          )}
          style={{
            backgroundColor: theme.primary,
            color: "#FFFFFF"
          }}
        >
          {currentTopicIndex >= topics.length - 1 ? "Concluído" : "Próximo"}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE DE REVELAÇÃO POR CLIQUE (CLICK-TO-REVEAL)
// ============================================================================
interface ClickToRevealProps {
  children: ReactNode;
  revealed: boolean;
  onReveal: () => void;
  theme: PresentationTheme;
  hint?: string;
}

export function ClickToReveal({ children, revealed, onReveal, theme, hint = "Clique para revelar" }: ClickToRevealProps) {
  return (
    <button
      onClick={onReveal}
      className={cn(
        "w-full text-left p-6 rounded-lg transition-all duration-300",
        revealed ? "opacity-100" : "opacity-60 hover:opacity-80"
      )}
      style={{
        backgroundColor: theme.surface,
        border: `1px solid ${theme.border}`,
        cursor: revealed ? "default" : "pointer"
      }}
    >
      {!revealed && (
        <div className="flex items-center gap-2 mb-4" style={{ color: theme.textMuted }}>
          <Circle className="size-4" />
          <span className="text-sm">{hint}</span>
        </div>
      )}
      
      <div
        className={cn(
          "transition-all duration-300",
          revealed ? "opacity-100" : "blur-sm"
        )}
      >
        {children}
      </div>
    </button>
  );
}

// ============================================================================
// COMPONENTE DE REVELAÇÃO AUTOMÁTICA (AUTO-REVEAL)
// ============================================================================
interface AutoRevealProps {
  children: ReactNode[];
  theme: PresentationTheme;
  delay?: number; // delay between reveals in ms
  onAllRevealed?: () => void;
}

export function AutoReveal({ children, theme, delay = 1000, onAllRevealed }: AutoRevealProps) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (revealedCount < children.length) {
      const timer = setTimeout(() => {
        setRevealedCount(prev => {
          const next = prev + 1;
          if (next === children.length && onAllRevealed) {
            onAllRevealed();
          }
          return next;
        });
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [revealedCount, children.length, delay, onAllRevealed]);

  return (
    <div className="space-y-4" style={{ fontFamily: theme.fontFamily }}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(
            "p-4 rounded-lg transition-all duration-500",
            index <= revealedCount ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
          )}
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// HOOK PARA CONTROLE DE REVELAÇÃO PROGRESSIVA
// ============================================================================
export function useProgressiveReveal(totalTopics: number) {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const next = () => {
    if (currentTopicIndex < totalTopics - 1) {
      setCurrentTopicIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const previous = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(prev => prev - 1);
      setIsComplete(false);
    }
  };

  const reset = () => {
    setCurrentTopicIndex(0);
    setIsComplete(false);
  };

  const jumpTo = (index: number) => {
    setCurrentTopicIndex(index);
    setIsComplete(index >= totalTopics - 1);
  };

  return {
    currentTopicIndex,
    isComplete,
    next,
    previous,
    reset,
    jumpTo,
    progress: (currentTopicIndex + 1) / totalTopics
  };
}
