import { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Home, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { PresentationTheme } from "@/lib/presentation-themes";

interface SlideHeaderProps {
  title?: string;
  subtitle?: string;
  logo?: string;
  theme: PresentationTheme;
  showProgress?: boolean;
  currentSlide: number;
  totalSlides: number;
}

export function SlideHeader({ 
  title, 
  subtitle, 
  logo, 
  theme, 
  showProgress = true,
  currentSlide,
  totalSlides 
}: SlideHeaderProps) {
  return (
    <header 
      className="relative border-b p-6"
      style={{ 
        borderColor: theme.border,
        backgroundColor: theme.surface 
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {logo && (
            <img 
              src={logo} 
              alt="Logo" 
              className="h-10 w-auto"
            />
          )}
          <div>
            {title && (
              <h1 
                className="text-2xl font-bold"
                style={{ color: theme.textPrimary, fontFamily: theme.fontFamily }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p 
                className="text-sm"
                style={{ color: theme.textSecondary, fontFamily: theme.fontFamily }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {showProgress && (
          <div 
            className="text-sm font-mono"
            style={{ color: theme.textMuted, fontFamily: theme.fontFamily }}
          >
            {currentSlide + 1} / {totalSlides}
          </div>
        )}
      </div>
      
      {showProgress && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: theme.border }}
        >
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${((currentSlide + 1) / totalSlides) * 100}%`,
              backgroundColor: theme.primary 
            }}
          />
        </div>
      )}
    </header>
  );
}

interface SlideContentProps {
  children: ReactNode;
  theme: PresentationTheme;
  layout?: "centered" | "top" | "two-columns" | "steps" | "checklist" | "video" | "flow";
}

export function SlideContent({ children, theme, layout = "top" }: SlideContentProps) {
  const layoutClasses = {
    centered: "flex items-center justify-center text-center",
    top: "",
    "two-columns": "grid grid-cols-2 gap-8",
    steps: "",
    checklist: "",
    video: "flex items-center justify-center",
    flow: "",
  };

  return (
    <main 
      className={cn("flex-1 p-8 overflow-auto", layoutClasses[layout])}
      style={{ 
        backgroundColor: theme.background,
        fontFamily: theme.fontFamily 
      }}
    >
      {children}
    </main>
  );
}

interface SlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onPrevious: () => void;
  onNext: () => void;
  onHome?: () => void;
  onMenu?: () => void;
  theme: PresentationTheme;
  showTopics?: boolean;
  topics?: string[];
  onTopicClick?: (index: number) => void;
}

export function SlideNavigation({ 
  currentSlide, 
  totalSlides, 
  onPrevious, 
  onNext, 
  onHome,
  onMenu,
  theme,
  showTopics = false,
  topics = [],
  onTopicClick
}: SlideNavigationProps) {
  return (
    <nav 
      className="border-t p-4"
      style={{ 
        borderColor: theme.border,
        backgroundColor: theme.surface 
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onHome && (
            <button
              onClick={onHome}
              className={cn(
                "p-2 rounded-lg transition",
                "hover:opacity-80"
              )}
              style={{ color: theme.textSecondary }}
              title="Início"
            >
              <Home className="size-5" />
            </button>
          )}
          
          {onMenu && (
            <button
              onClick={onMenu}
              className={cn(
                "p-2 rounded-lg transition",
                "hover:opacity-80"
              )}
              style={{ color: theme.textSecondary }}
              title="Menu"
            >
              <Menu className="size-5" />
            </button>
          )}
          
          {showTopics && topics.length > 0 && (
            <div className="flex items-center gap-1 ml-4">
              {topics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => onTopicClick?.(index)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs transition",
                    index === currentSlide
                      ? "font-semibold"
                      : "opacity-60 hover:opacity-100"
                  )}
                  style={{
                    backgroundColor: index === currentSlide ? theme.primary : theme.border,
                    color: index === currentSlide ? "#FFFFFF" : theme.textSecondary,
                    fontFamily: theme.fontFamily
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevious}
            disabled={currentSlide === 0}
            className={cn(
              "p-2 rounded-lg transition",
              currentSlide === 0 ? "opacity-30 cursor-not-allowed" : "hover:opacity-80"
            )}
            style={{ color: theme.textSecondary }}
            title="Slide anterior"
          >
            <ChevronLeft className="size-5" />
          </button>
          
          <button
            onClick={onNext}
            disabled={currentSlide === totalSlides - 1}
            className={cn(
              "p-2 rounded-lg transition",
              currentSlide === totalSlides - 1 ? "opacity-30 cursor-not-allowed" : "hover:opacity-80"
            )}
            style={{ color: theme.textSecondary }}
            title="Próximo slide"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

interface SlideFooterProps {
  presenterNotes?: string;
  theme: PresentationTheme;
  showNotes?: boolean;
}

export function SlideFooter({ presenterNotes, theme, showNotes = false }: SlideFooterProps) {
  if (!showNotes || !presenterNotes) return null;

  return (
    <footer 
      className="border-t p-4 text-xs"
      style={{ 
        borderColor: theme.border,
        backgroundColor: theme.surface,
        color: theme.textMuted,
        fontFamily: theme.fontFamily 
      }}
    >
      <div className="font-semibold mb-1" style={{ color: theme.textSecondary }}>
        Notas do Apresentador:
      </div>
      <p>{presenterNotes}</p>
    </footer>
  );
}

interface SlideContainerProps {
  children: ReactNode;
  theme: PresentationTheme;
  className?: string;
}

export function SlideContainer({ children, theme, className }: SlideContainerProps) {
  return (
    <div 
      className={cn("h-screen flex flex-col", className)}
      style={{ 
        backgroundColor: theme.background,
        fontFamily: theme.fontFamily 
      }}
    >
      {children}
    </div>
  );
}
