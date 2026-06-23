import { ReactNode } from "react";
import { AlertTriangle, Lightbulb, Info, CheckCircle, XCircle, ArrowRight, Clock, Target, Zap, Star, Award, TrendingUp, BarChart3, Users, Calendar, MapPin, Phone, Mail, Link as LinkIcon, Copy, Download, Share2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { PresentationTheme } from "@/lib/presentation-themes";

// ============================================================================
// TÍTULO
// ============================================================================
interface SlideTitleProps {
  children: ReactNode;
  theme: PresentationTheme;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function SlideTitle({ children, theme, size = "lg", className }: SlideTitleProps) {
  const sizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
    xl: "text-5xl",
  };

  return (
    <h2 
      className={cn("font-bold", sizes[size], className)}
      style={{ 
        color: theme.textPrimary,
        fontFamily: theme.fontFamily 
      }}
    >
      {children}
    </h2>
  );
}

// ============================================================================
// SUBTÍTULO
// ============================================================================
interface SlideSubtitleProps {
  children: ReactNode;
  theme: PresentationTheme;
  className?: string;
}

export function SlideSubtitle({ children, theme, className }: SlideSubtitleProps) {
  return (
    <p 
      className={cn("text-xl mt-2", className)}
      style={{ 
        color: theme.textSecondary,
        fontFamily: theme.fontFamily 
      }}
    >
      {children}
    </p>
  );
}

// ============================================================================
// TEXTO
// ============================================================================
interface SlideTextProps {
  children: ReactNode;
  theme: PresentationTheme;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SlideText({ children, theme, size = "md", className }: SlideTextProps) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <p 
      className={cn(sizes[size], className)}
      style={{ 
        color: theme.textPrimary,
        fontFamily: theme.fontFamily 
      }}
    >
      {children}
    </p>
  );
}

// ============================================================================
// IMAGEM
// ============================================================================
interface SlideImageProps {
  src: string;
  alt?: string;
  theme: PresentationTheme;
  className?: string;
  caption?: string;
}

export function SlideImage({ src, alt, theme, className, caption }: SlideImageProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <img 
        src={src} 
        alt={alt} 
        className="rounded-lg max-w-full h-auto"
        style={{ border: `1px solid ${theme.border}` }}
      />
      {caption && (
        <p 
          className="text-sm mt-2 text-center"
          style={{ color: theme.textMuted, fontFamily: theme.fontFamily }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// VÍDEO
// ============================================================================
interface SlideVideoProps {
  src: string;
  theme: PresentationTheme;
  className?: string;
  caption?: string;
}

export function SlideVideo({ src, theme, className, caption }: SlideVideoProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div 
        className="aspect-video rounded-lg flex items-center justify-center w-full max-w-4xl"
        style={{ 
          backgroundColor: theme.surface,
          border: `1px solid ${theme.border}` 
        }}
      >
        <video 
          src={src} 
          controls 
          className="w-full h-full rounded-lg"
        />
      </div>
      {caption && (
        <p 
          className="text-sm mt-2 text-center"
          style={{ color: theme.textMuted, fontFamily: theme.fontFamily }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// LISTA
// ============================================================================
interface SlideListItem {
  text: string;
  checked?: boolean;
}

interface SlideListProps {
  items: SlideListItem[];
  theme: PresentationTheme;
  numbered?: boolean;
  className?: string;
}

export function SlideList({ items, theme, numbered = false, className }: SlideListProps) {
  return (
    <ul className={cn("space-y-2", className)} style={{ fontFamily: theme.fontFamily }}>
      {items.map((item, index) => (
        <li 
          key={index}
          className="flex items-start gap-3"
          style={{ color: theme.textPrimary }}
        >
          {numbered ? (
            <span 
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ 
                backgroundColor: theme.primary,
                color: "#FFFFFF"
              }}
            >
              {index + 1}
            </span>
          ) : (
            <span 
              className="flex-shrink-0 mt-1"
              style={{ color: theme.primary }}
            >
              {item.checked ? <CheckCircle className="size-5" /> : <div className="size-2 rounded-full bg-current" />}
            </span>
          )}
          <span className={cn(item.checked && "line-through opacity-60")}>
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ============================================================================
// CHECKLIST
// ============================================================================
interface SlideChecklistProps {
  items: string[];
  theme: PresentationTheme;
  className?: string;
}

export function SlideChecklist({ items, theme, className }: SlideChecklistProps) {
  return (
    <div 
      className={cn("space-y-3", className)}
      style={{ fontFamily: theme.fontFamily }}
    >
      {items.map((item, index) => (
        <div 
          key={index}
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{ 
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`
          }}
        >
          <div 
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.border }}
          >
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: theme.background }}
            />
          </div>
          <span style={{ color: theme.textPrimary }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// ALERTA
// ============================================================================
interface AlertProps {
  type: "warning" | "error" | "info" | "success";
  children: ReactNode;
  theme: PresentationTheme;
  className?: string;
}

export function Alert({ type, children, theme, className }: AlertProps) {
  const types = {
    warning: { icon: AlertTriangle, color: theme.accent, bg: `${theme.accent}20` },
    error: { icon: XCircle, color: "#DC2626", bg: "rgba(220, 38, 38, 0.1)" },
    info: { icon: Info, color: theme.primary, bg: `${theme.primary}20` },
    success: { icon: CheckCircle, color: "#10B981", bg: "rgba(16, 185, 129, 0.1)" },
  };

  const { icon: Icon, color, bg } = types[type];

  return (
    <div 
      className={cn("flex items-start gap-3 p-4 rounded-lg", className)}
      style={{ 
        backgroundColor: bg,
        border: `1px solid ${color}`,
        fontFamily: theme.fontFamily
      }}
    >
      <Icon className="size-5 flex-shrink-0 mt-0.5" style={{ color }} />
      <div style={{ color: theme.textPrimary }}>{children}</div>
    </div>
  );
}

// ============================================================================
// DICA
// ============================================================================
interface TipProps {
  children: ReactNode;
  theme: PresentationTheme;
  className?: string;
}

export function Tip({ children, theme, className }: TipProps) {
  return (
    <div 
      className={cn("flex items-start gap-3 p-4 rounded-lg", className)}
      style={{ 
        backgroundColor: `${theme.accent}20`,
        border: `1px solid ${theme.accent}`,
        fontFamily: theme.fontFamily
      }}
    >
      <Lightbulb className="size-5 flex-shrink-0 mt-0.5" style={{ color: theme.accent }} />
      <div>
        <p 
          className="font-semibold mb-1"
          style={{ color: theme.accent, fontFamily: theme.fontFamily }}
        >
          Dica
        </p>
        <div style={{ color: theme.textPrimary }}>{children}</div>
      </div>
    </div>
  );
}

// ============================================================================
// DESTAQUE
// ============================================================================
interface HighlightProps {
  children: ReactNode;
  theme: PresentationTheme;
  className?: string;
}

export function Highlight({ children, theme, className }: HighlightProps) {
  return (
    <div 
      className={cn("p-4 rounded-lg", className)}
      style={{ 
        backgroundColor: `${theme.primary}20`,
        border: `2px solid ${theme.primary}`,
        fontFamily: theme.fontFamily
      }}
    >
      <div style={{ color: theme.textPrimary }}>{children}</div>
    </div>
  );
}

// ============================================================================
// TIMELINE
// ============================================================================
interface TimelineItem {
  date: string;
  title: string;
  description?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  theme: PresentationTheme;
  className?: string;
}

export function Timeline({ items, theme, className }: TimelineProps) {
  return (
    <div className={cn("space-y-4", className)} style={{ fontFamily: theme.fontFamily }}>
      {items.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div 
            className="flex flex-col items-center"
            style={{ color: theme.primary }}
          >
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: theme.primary }}
            />
            {index < items.length - 1 && (
              <div 
                className="w-0.5 flex-1 mt-2"
                style={{ backgroundColor: theme.border }}
              />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p 
              className="text-sm font-semibold mb-1"
              style={{ color: theme.accent }}
            >
              {item.date}
            </p>
            <h4 
              className="font-semibold mb-1"
              style={{ color: theme.textPrimary }}
            >
              {item.title}
            </h4>
            {item.description && (
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// PROCESSO
// ============================================================================
interface ProcessStep {
  title: string;
  description?: string;
  icon?: ReactNode;
}

interface ProcessProps {
  steps: ProcessStep[];
  theme: PresentationTheme;
  className?: string;
}

export function Process({ steps, theme, className }: ProcessProps) {
  return (
    <div className={cn("flex items-center gap-4 flex-wrap justify-center", className)} style={{ fontFamily: theme.fontFamily }}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-4">
          <div 
            className="p-4 rounded-lg text-center min-w-[120px]"
            style={{ 
              backgroundColor: theme.surface,
              border: `2px solid ${theme.primary}`
            }}
          >
            {step.icon && (
              <div className="mb-2 flex justify-center" style={{ color: theme.primary }}>
                {step.icon}
              </div>
            )}
            <h4 
              className="font-semibold text-sm"
              style={{ color: theme.textPrimary }}
            >
              {step.title}
            </h4>
            {step.description && (
              <p 
                className="text-xs mt-1"
                style={{ color: theme.textSecondary }}
              >
                {step.description}
              </p>
            )}
          </div>
          
          {index < steps.length - 1 && (
            <ArrowRight className="size-6" style={{ color: theme.border }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// FLUXOGRAMA
// ============================================================================
interface FlowNode {
  id: string;
  label: string;
  description?: string;
}

interface FlowchartProps {
  nodes: FlowNode[];
  theme: PresentationTheme;
  className?: string;
}

export function Flowchart({ nodes, theme, className }: FlowchartProps) {
  return (
    <div 
      className={cn("flex items-center gap-4 flex-wrap justify-center", className)}
      style={{ fontFamily: theme.fontFamily }}
    >
      {nodes.map((node, index) => (
        <div key={node.id}>
          <div 
            className="p-4 rounded-lg text-center min-w-[150px]"
            style={{ 
              backgroundColor: theme.surface,
              border: `2px solid ${theme.primary}`
            }}
          >
            <h4 
              className="font-semibold mb-1"
              style={{ color: theme.textPrimary }}
            >
              {node.label}
            </h4>
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
  );
}

// ============================================================================
// CARD INFORMATIVO
// ============================================================================
interface InfoCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  theme: PresentationTheme;
  className?: string;
}

export function InfoCard({ title, description, icon, theme, className }: InfoCardProps) {
  return (
    <div 
      className={cn("p-6 rounded-lg", className)}
      style={{ 
        backgroundColor: theme.surface,
        border: `1px solid ${theme.border}`,
        fontFamily: theme.fontFamily
      }}
    >
      {icon && (
        <div className="mb-3" style={{ color: theme.primary }}>
          {icon}
        </div>
      )}
      <h3 
        className="font-semibold mb-2"
        style={{ color: theme.textPrimary }}
      >
        {title}
      </h3>
      {description && (
        <p 
          className="text-sm"
          style={{ color: theme.textSecondary }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// CARD DE MÉTRICA
// ============================================================================
interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  theme: PresentationTheme;
  className?: string;
}

export function MetricCard({ label, value, icon, trend, theme, className }: MetricCardProps) {
  const trendColors = {
    up: "#10B981",
    down: "#DC2626",
    neutral: theme.textMuted,
  };

  return (
    <div 
      className={cn("p-4 rounded-lg", className)}
      style={{ 
        backgroundColor: theme.surface,
        border: `1px solid ${theme.border}`,
        fontFamily: theme.fontFamily
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span 
          className="text-sm"
          style={{ color: theme.textSecondary }}
        >
          {label}
        </span>
        {icon && <div style={{ color: theme.primary }}>{icon}</div>}
      </div>
      <div 
        className="text-2xl font-bold"
        style={{ color: theme.textPrimary }}
      >
        {value}
      </div>
      {trend && (
        <div 
          className="text-xs mt-1"
          style={{ color: trendColors[trend] }}
        >
          {trend === "up" && <TrendingUp className="size-3 inline mr-1" />}
          {trend === "down" && <TrendingUp className="size-3 inline mr-1 rotate-180" />}
          {trend === "neutral" && <BarChart3 className="size-3 inline mr-1" />}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CARD DE CONTATO
// ============================================================================
interface ContactCardProps {
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  theme: PresentationTheme;
  className?: string;
}

export function ContactCard({ email, phone, address, website, theme, className }: ContactCardProps) {
  return (
    <div 
      className={cn("space-y-3", className)}
      style={{ fontFamily: theme.fontFamily }}
    >
      {email && (
        <div className="flex items-center gap-3" style={{ color: theme.textPrimary }}>
          <Mail className="size-5" style={{ color: theme.primary }} />
          <span>{email}</span>
        </div>
      )}
      {phone && (
        <div className="flex items-center gap-3" style={{ color: theme.textPrimary }}>
          <Phone className="size-5" style={{ color: theme.primary }} />
          <span>{phone}</span>
        </div>
      )}
      {address && (
        <div className="flex items-center gap-3" style={{ color: theme.textPrimary }}>
          <MapPin className="size-5" style={{ color: theme.primary }} />
          <span>{address}</span>
        </div>
      )}
      {website && (
        <div className="flex items-center gap-3" style={{ color: theme.textPrimary }}>
          <LinkIcon className="size-5" style={{ color: theme.primary }} />
          <span>{website}</span>
        </div>
      )}
    </div>
  );
}
