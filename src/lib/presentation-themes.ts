export interface PresentationTheme {
  id: string;
  name: string;
  description: string;
  
  // Cores principais
  primary: string;
  secondary: string;
  accent: string;
  
  // Cores de fundo
  background: string;
  surface: string;
  
  // Cores de texto
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Bordas e sombras
  border: string;
  shadow: string;
  
  // Tipografia
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
  };
  
  // Espaçamento
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Bordas
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export const PRESENTATION_THEMES: Record<string, PresentationTheme> = {
  industrial: {
    id: "industrial",
    name: "Industrial",
    description: "Tema robusto com tons de azul e cinza, ideal para ambientes industriais",
    primary: "#3B82F6",
    secondary: "#64748B",
    accent: "#F59E0B",
    background: "#0F172A",
    surface: "#1E293B",
    textPrimary: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    border: "#334155",
    shadow: "rgba(0, 0, 0, 0.3)",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
    },
    spacing: {
      xs: "0.5rem",
      sm: "0.75rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
    },
    borderRadius: {
      sm: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
    },
  },
  
  racing: {
    id: "racing",
    name: "Racing",
    description: "Tema dinâmico com vermelho e preto, inspirado em automobilismo",
    primary: "#DC2626",
    secondary: "#1F2937",
    accent: "#FBBF24",
    background: "#111827",
    surface: "#1F2937",
    textPrimary: "#F9FAFB",
    textSecondary: "#D1D5DB",
    textMuted: "#9CA3AF",
    border: "#374151",
    shadow: "rgba(220, 38, 38, 0.3)",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
    },
    spacing: {
      xs: "0.5rem",
      sm: "0.75rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
    },
    borderRadius: {
      sm: "0.125rem",
      md: "0.25rem",
      lg: "0.375rem",
      xl: "0.5rem",
    },
  },
  
  corporativo: {
    id: "corporativo",
    name: "Corporativo",
    description: "Tema profissional com azul marinho e cinza, ideal para empresas",
    primary: "#1E40AF",
    secondary: "#475569",
    accent: "#0891B2",
    background: "#FFFFFF",
    surface: "#F8FAFC",
    textPrimary: "#0F172A",
    textSecondary: "#334155",
    textMuted: "#64748B",
    border: "#E2E8F0",
    shadow: "rgba(0, 0, 0, 0.1)",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
    },
    spacing: {
      xs: "0.5rem",
      sm: "0.75rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
    },
    borderRadius: {
      sm: "0.375rem",
      md: "0.5rem",
      lg: "0.625rem",
      xl: "0.875rem",
    },
  },
  
  moderno: {
    id: "moderno",
    name: "Moderno",
    description: "Tema contemporâneo com gradientes e cores vibrantes",
    primary: "#8B5CF6",
    secondary: "#EC4899",
    accent: "#10B981",
    background: "#0F0F23",
    surface: "#1A1A2E",
    textPrimary: "#FFFFFF",
    textSecondary: "#E0E0E0",
    textMuted: "#A0A0A0",
    border: "#2A2A4A",
    shadow: "rgba(139, 92, 246, 0.3)",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
    },
    spacing: {
      xs: "0.5rem",
      sm: "0.75rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
    },
    borderRadius: {
      sm: "0.5rem",
      md: "0.75rem",
      lg: "1rem",
      xl: "1.25rem",
    },
  },
  
  dark: {
    id: "dark",
    name: "Dark",
    description: "Tema escuro minimalista com alto contraste",
    primary: "#6366F1",
    secondary: "#4B5563",
    accent: "#10B981",
    background: "#000000",
    surface: "#111111",
    textPrimary: "#FFFFFF",
    textSecondary: "#D1D5DB",
    textMuted: "#9CA3AF",
    border: "#222222",
    shadow: "rgba(0, 0, 0, 0.5)",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
    },
    spacing: {
      xs: "0.5rem",
      sm: "0.75rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
    },
    borderRadius: {
      sm: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
    },
  },
  
  light: {
    id: "light",
    name: "Light",
    description: "Tema claro e limpo, ideal para ambientes bem iluminados",
    primary: "#2563EB",
    secondary: "#6B7280",
    accent: "#059669",
    background: "#FFFFFF",
    surface: "#F3F4F6",
    textPrimary: "#111827",
    textSecondary: "#374151",
    textMuted: "#6B7280",
    border: "#D1D5DB",
    shadow: "rgba(0, 0, 0, 0.1)",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
    },
    spacing: {
      xs: "0.5rem",
      sm: "0.75rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
    },
    borderRadius: {
      sm: "0.375rem",
      md: "0.5rem",
      lg: "0.625rem",
      xl: "0.875rem",
    },
  },
};

export function getTheme(themeId: string): PresentationTheme {
  return PRESENTATION_THEMES[themeId] || PRESENTATION_THEMES.industrial;
}

export function getAllThemes(): PresentationTheme[] {
  return Object.values(PRESENTATION_THEMES);
}
