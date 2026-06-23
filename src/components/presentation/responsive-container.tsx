import { ReactNode, useEffect, useState } from "react";
import { Monitor, Tablet, Smartphone, Tv } from "lucide-react";
import { cn } from "@/lib/utils";
import { PresentationTheme } from "@/lib/presentation-themes";

type Breakpoint = "mobile" | "tablet" | "desktop" | "tv";

interface ResponsiveContainerProps {
  children: ReactNode;
  theme: PresentationTheme;
  className?: string;
}

export function ResponsiveContainer({ children, theme, className }: ResponsiveContainerProps) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint("mobile");
      } else if (width < 1024) {
        setBreakpoint("tablet");
      } else if (width < 1920) {
        setBreakpoint("desktop");
      } else {
        setBreakpoint("tv");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const breakpointStyles = {
    mobile: {
      padding: "1rem",
      fontSize: "0.875rem",
      headerHeight: "60px",
      footerHeight: "80px",
    },
    tablet: {
      padding: "2rem",
      fontSize: "1rem",
      headerHeight: "70px",
      footerHeight: "90px",
    },
    desktop: {
      padding: "3rem",
      fontSize: "1rem",
      headerHeight: "80px",
      footerHeight: "100px",
    },
    tv: {
      padding: "4rem",
      fontSize: "1.125rem",
      headerHeight: "90px",
      footerHeight: "110px",
    },
  };

  const styles = breakpointStyles[breakpoint];

  return (
    <div
      className={cn("h-screen w-screen overflow-hidden", className)}
      style={{
        backgroundColor: theme.background,
        fontFamily: theme.fontFamily,
        fontSize: styles.fontSize,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// INDICADOR DE DISPOSITIVO
// ============================================================================
interface DeviceIndicatorProps {
  breakpoint: Breakpoint;
  theme: PresentationTheme;
}

export function DeviceIndicator({ breakpoint, theme }: DeviceIndicatorProps) {
  const devices = {
    mobile: { icon: Smartphone, label: "Mobile" },
    tablet: { icon: Tablet, label: "Tablet" },
    desktop: { icon: Monitor, label: "Desktop" },
    tv: { icon: Tv, label: "TV" },
  };

  const { icon: Icon, label } = devices[breakpoint];

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
      style={{
        backgroundColor: theme.surface,
        border: `1px solid ${theme.border}`,
        color: theme.textMuted,
        fontFamily: theme.fontFamily,
      }}
    >
      <Icon className="size-3" />
      <span>{label}</span>
    </div>
  );
}

// ============================================================================
// CONTAINER RESPONSIVO PARA SLIDES
// ============================================================================
interface ResponsiveSlideContainerProps {
  children: ReactNode;
  theme: PresentationTheme;
  className?: string;
}

export function ResponsiveSlideContainer({ children, theme, className }: ResponsiveSlideContainerProps) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint("mobile");
      } else if (width < 1024) {
        setBreakpoint("tablet");
      } else if (width < 1920) {
        setBreakpoint("desktop");
      } else {
        setBreakpoint("tv");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const containerStyles = {
    mobile: {
      padding: "1rem",
      gap: "0.75rem",
      titleSize: "text-2xl",
      textSize: "text-sm",
    },
    tablet: {
      padding: "2rem",
      gap: "1rem",
      titleSize: "text-3xl",
      textSize: "text-base",
    },
    desktop: {
      padding: "3rem",
      gap: "1.5rem",
      titleSize: "text-4xl",
      textSize: "text-base",
    },
    tv: {
      padding: "4rem",
      gap: "2rem",
      titleSize: "text-5xl",
      textSize: "text-lg",
    },
  };

  const styles = containerStyles[breakpoint];

  return (
    <div
      className={cn("flex-1 flex flex-col", className)}
      style={{
        padding: styles.padding,
        gap: styles.gap,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// GRID RESPONSIVO
// ============================================================================
interface ResponsiveGridProps {
  children: ReactNode;
  theme: PresentationTheme;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    tv?: number;
  };
  gap?: string;
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  theme, 
  columns = { mobile: 1, tablet: 2, desktop: 3, tv: 4 },
  gap = "1rem",
  className 
}: ResponsiveGridProps) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint("mobile");
      } else if (width < 1024) {
        setBreakpoint("tablet");
      } else if (width < 1920) {
        setBreakpoint("desktop");
      } else {
        setBreakpoint("tv");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentColumns = columns[breakpoint] || columns.desktop || 1;

  return (
    <div
      className={cn("grid", className)}
      style={{
        gridTemplateColumns: `repeat(${currentColumns}, 1fr)`,
        gap,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// TEXTO RESPONSIVO
// ============================================================================
interface ResponsiveTextProps {
  children: ReactNode;
  theme: PresentationTheme;
  sizes?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    tv?: string;
  };
  className?: string;
}

export function ResponsiveText({ 
  children, 
  theme, 
  sizes = { mobile: "text-sm", tablet: "text-base", desktop: "text-base", tv: "text-lg" },
  className 
}: ResponsiveTextProps) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint("mobile");
      } else if (width < 1024) {
        setBreakpoint("tablet");
      } else if (width < 1920) {
        setBreakpoint("desktop");
      } else {
        setBreakpoint("tv");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentSize = sizes[breakpoint] || sizes.desktop || "text-base";

  return (
    <p
      className={cn(currentSize, className)}
      style={{
        color: theme.textPrimary,
        fontFamily: theme.fontFamily,
      }}
    >
      {children}
    </p>
  );
}

// ============================================================================
// HOOK PARA BREAKPOINT
// ============================================================================
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint("mobile");
      } else if (width < 1024) {
        setBreakpoint("tablet");
      } else if (width < 1920) {
        setBreakpoint("desktop");
      } else {
        setBreakpoint("tv");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
}
