import { ReactNode } from "react";
import { CheckCircle, Circle, Play, ArrowRight, Lightbulb, Phone, Mail, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { PresentationTheme } from "@/lib/presentation-themes";

interface LayoutProps {
  children: ReactNode;
  theme: PresentationTheme;
  className?: string;
}

// ============================================================================
// LAYOUT CAPA
// ============================================================================
interface CoverLayoutProps {
  title: string;
  subtitle?: string;
  presenter?: string;
  date?: string;
  logo?: string;
  theme: PresentationTheme;
}

export function CoverLayout({ title, subtitle, presenter, date, logo, theme }: CoverLayoutProps) {
  return (
    <div 
      className="h-full flex flex-col items-center justify-center text-center p-12"
      style={{ backgroundColor: theme.background, fontFamily: theme.fontFamily }}
    >
      {logo && (
        <img src={logo} alt="Logo" className="h-20 w-auto mb-8" />
      )}
      
      <h1 
        className="text-5xl font-bold mb-6"
        style={{ color: theme.textPrimary }}
      >
        {title}
      </h1>
      
      {subtitle && (
        <p 
          className="text-2xl mb-12"
          style={{ color: theme.textSecondary }}
        >
          {subtitle}
        </p>
      )}
      
      <div 
        className="mt-auto pt-12 border-t"
        style={{ borderColor: theme.border }}
      >
        {presenter && (
          <p className="text-lg mb-2" style={{ color: theme.textSecondary }}>
            {presenter}
          </p>
        )}
        {date && (
          <p className="text-sm" style={{ color: theme.textMuted }}>
            {date}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// LAYOUT CONTEÚDO
// ============================================================================
interface ContentLayoutProps {
  title: string;
  subtitle?: string;
  content: ReactNode;
  theme: PresentationTheme;
}

export function ContentLayout({ title, subtitle, content, theme }: ContentLayoutProps) {
  return (
    <div 
      className="h-full flex flex-col p-12"
      style={{ backgroundColor: theme.background, fontFamily: theme.fontFamily }}
    >
      <div className="mb-8">
        <h2 
          className="text-3xl font-bold mb-4"
          style={{ color: theme.textPrimary }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg" style={{ color: theme.textSecondary }}>
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="flex-1 overflow-auto" style={{ color: theme.textPrimary }}>
        {content}
      </div>
    </div>
  );
}

// ============================================================================
// LAYOUT DUAS COLUNAS
// ============================================================================
interface TwoColumnLayoutProps {
  title: string;
  leftContent: ReactNode;
  rightContent: ReactNode;
  theme: PresentationTheme;
}

export function TwoColumnLayout({ title, leftContent, rightContent, theme }: TwoColumnLayoutProps) {
  return (
    <div 
      className="h-full flex flex-col p-12"
      style={{ backgroundColor: theme.background, fontFamily: theme.fontFamily }}
    >
      <h2 
        className="text-3xl font-bold mb-8"
        style={{ color: theme.textPrimary }}
      >
        {title}
      </h2>
      
      <div className="flex-1 grid grid-cols-2 gap-8">
        <div className="overflow-auto" style={{ color: theme.textPrimary }}>
          {leftContent}
        </div>
        <div className="overflow-auto" style={{ color: theme.textPrimary }}>
          {rightContent}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LAYOUT PASSO A PASSO
// ============================================================================
interface Step {
  title: string;
  description?: string;
  completed?: boolean;
}

interface StepByStepLayoutProps {
  title: string;
  steps: Step[];
  theme: PresentationTheme;
  currentStep?: number;
}

export function StepByStepLayout({ title, steps, theme, currentStep }: StepByStepLayoutProps) {
  return (
    <div 
      className="h-full flex flex-col p-12"
      style={{ backgroundColor: theme.background, fontFamily: theme.fontFamily }}
    >
      <h2 
        className="text-3xl font-bold mb-8"
        style={{ color: theme.textPrimary }}
      >
        {title}
      </h2>
      
      <div className="flex-1 space-y-4">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={cn(
              "flex items-start gap-4 p-4 rounded-lg transition",
              currentStep === index && "ring-2"
            )}
            style={{
              backgroundColor: theme.surface,
              borderColor: currentStep === index ? theme.primary : theme.border,
              borderWidth: currentStep === index ? "2px" : "1px"
            }}
          >
            <div 
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: step.completed ? theme.accent : theme.border,
                color: step.completed ? "#FFFFFF" : theme.textSecondary
              }}
            >
              {step.completed ? (
                <CheckCircle className="size-5" />
              ) : (
                <span className="font-semibold">{index + 1}</span>
              )}
            </div>
            
            <div className="flex-1">
              <h3 
                className="text-lg font-semibold mb-1"
                style={{ color: theme.textPrimary }}
              >
                {step.title}
              </h3>
              {step.description && (
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  {step.description}
                </p>
              )}
            </div>
            
            {index < steps.length - 1 && (
              <ArrowRight className="size-5 flex-shrink-0" style={{ color: theme.border }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// LAYOUT CHECKLIST
// ============================================================================
interface ChecklistItem {
  text: string;
  checked?: boolean;
}

interface ChecklistLayoutProps {
  title: string;
  items: ChecklistItem[];
  theme: PresentationTheme;
  tip?: string;
}

export function ChecklistLayout({ title, items, theme, tip }: ChecklistLayoutProps) {
  return (
    <div 
      className="h-full flex flex-col p-12"
      style={{ backgroundColor: theme.background, fontFamily: theme.fontFamily }}
    >
      <h2 
        className="text-3xl font-bold mb-8"
        style={{ color: theme.textPrimary }}
      >
        {title}
      </h2>
      
      <div className="flex-1 space-y-3">
        {items.map((item, index) => (
          <div 
            key={index}
            className="flex items-center gap-4 p-4 rounded-lg"
            style={{ backgroundColor: theme.surface }}
          >
            {item.checked ? (
              <CheckCircle 
                className="size-6 flex-shrink-0" 
                style={{ color: theme.accent }} 
              />
            ) : (
              <Circle 
                className="size-6 flex-shrink-0" 
                style={{ color: theme.border }} 
              />
            )}
            
            <span 
              className={cn("text-lg", item.checked && "line-through opacity-60")}
              style={{ color: theme.textPrimary }}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
      
      {tip && (
        <div 
          className="mt-8 p-4 rounded-lg flex items-start gap-3"
          style={{ backgroundColor: `${theme.accent}20`, border: `1px solid ${theme.accent}` }}
        >
          <Lightbulb className="size-5 flex-shrink-0 mt-0.5" style={{ color: theme.accent }} />
          <div>
            <p className="font-semibold mb-1" style={{ color: theme.accent }}>
              Dica
            </p>
            <p className="text-sm" style={{ color: theme.textSecondary }}>
              {tip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LAYOUT VÍDEO
// ============================================================================
interface VideoLayoutProps {
  title: string;
  videoUrl: string;
  description?: string;
  theme: PresentationTheme;
}

export function VideoLayout({ title, videoUrl, description, theme }: VideoLayoutProps) {
  return (
    <div 
      className="h-full flex flex-col p-12"
      style={{ backgroundColor: theme.background, fontFamily: theme.fontFamily }}
    >
      <h2 
        className="text-3xl font-bold mb-8"
        style={{ color: theme.textPrimary }}
      >
        {title}
      </h2>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <div 
          className="w-full max-w-4xl aspect-video rounded-lg flex items-center justify-center mb-6"
          style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
        >
          <Play className="size-16" style={{ color: theme.primary }} />
        </div>
        
        {description && (
          <p 
            className="text-center max-w-2xl"
            style={{ color: theme.textSecondary }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// LAYOUT FLUXO
// ============================================================================
interface FlowNode {
  id: string;
  label: string;
  description?: string;
}

interface FlowLayoutProps {
  title: string;
  nodes: FlowNode[];
  theme: PresentationTheme;
}

export function FlowLayout({ title, nodes, theme }: FlowLayoutProps) {
  return (
    <div 
      className="h-full flex flex-col p-12"
      style={{ backgroundColor: theme.background, fontFamily: theme.fontFamily }}
    >
      <h2 
        className="text-3xl font-bold mb-8"
        style={{ color: theme.textPrimary }}
      >
        {title}
      </h2>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {nodes.map((node, index) => (
            <div key={node.id}>
              <div 
                className="p-6 rounded-lg text-center min-w-[150px]"
                style={{ 
                  backgroundColor: theme.surface,
                  border: `2px solid ${theme.primary}`
                }}
              >
                <h3 
                  className="font-semibold mb-2"
                  style={{ color: theme.textPrimary }}
                >
                  {node.label}
                </h3>
                {node.description && (
                  <p 
                    className="text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    {node.description}
                  </p>
                )}
              </div>
              
              {index < nodes.length - 1 && (
                <ArrowRight 
                  className="size-6 mx-auto mt-2" 
                  style={{ color: theme.border }} 
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LAYOUT ENCERRAMENTO
// ============================================================================
interface ClosingLayoutProps {
  title: string;
  message?: string;
  cta?: string;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  theme: PresentationTheme;
}

export function ClosingLayout({ title, message, cta, contact, theme }: ClosingLayoutProps) {
  return (
    <div 
      className="h-full flex flex-col items-center justify-center text-center p-12"
      style={{ backgroundColor: theme.background, fontFamily: theme.fontFamily }}
    >
      <h1 
        className="text-5xl font-bold mb-6"
        style={{ color: theme.textPrimary }}
      >
        {title}
      </h1>
      
      {message && (
        <p 
          className="text-2xl mb-8 max-w-2xl"
          style={{ color: theme.textSecondary }}
        >
          {message}
        </p>
      )}
      
      {cta && (
        <button 
          className="px-8 py-4 rounded-lg text-lg font-semibold mb-12"
          style={{ 
            backgroundColor: theme.primary,
            color: "#FFFFFF"
          }}
        >
          {cta}
        </button>
      )}
      
      {contact && (
        <div 
          className="flex items-center gap-8 mt-auto pt-8 border-t"
          style={{ borderColor: theme.border }}
        >
          {contact.email && (
            <div className="flex items-center gap-2" style={{ color: theme.textSecondary }}>
              <Mail className="size-5" />
              <span>{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2" style={{ color: theme.textSecondary }}>
              <Phone className="size-5" />
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.address && (
            <div className="flex items-center gap-2" style={{ color: theme.textSecondary }}>
              <MapPin className="size-5" />
              <span>{contact.address}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
