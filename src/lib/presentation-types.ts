export type ThemeStyle = 'racing' | 'industrial' | 'corporate' | 'modern' | 'dark' | 'light';

export type Category = 
  | 'Visão Geral'
  | 'Implantação'
  | 'Cadastros'
  | 'Produção'
  | 'Estoque'
  | 'Qualidade'
  | 'Treinamentos';

export type Status = 'Rascunho' | 'Em Revisão' | 'Publicado';

export interface ListItem {
  id: string;
  text: string;
  checked?: boolean;
}

export interface FlowNode {
  id: string;
  label: string;
  description?: string;
}

export type SlideLayout = 
  | 'hero' 
  | 'text-only' 
  | 'split-image' 
  | 'split-video' 
  | 'bullets-only'
  | 'cover'
  | 'content'
  | 'step-by-step'
  | 'two-columns'
  | 'checklist'
  | 'conclusion'
  | 'video'
  | 'flow';

export interface Slide {
  id: string;
  titulo: string;
  subtitulo?: string;
  texto?: string;
  imagem_url?: string;
  video_url?: string;
  notas?: string;
  topicos?: string[];
  // Enhanced fields from criador-de-treinamento (aliases for compatibility)
  title?: string;
  subtitle?: string;
  freeText?: string;
  imageUrl?: string;
  videoUrl?: string;
  iconName?: string;
  listItems?: ListItem[];
  layout?: SlideLayout;
  alertText?: string;
  tipText?: string;
  highlightText?: string;
  flowNodes?: FlowNode[];
  ordem?: number;
  apresentacao_id?: string;
}

export type ThemeColor = 'yellow' | 'green' | 'red' | 'cyan' | 'purple';

export interface Presentation {
  id: string;
  title: string;
  description: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
  status: Status;
  slides: Slide[];
  themeColor?: ThemeColor;
  themeStyle?: ThemeStyle;
}

export interface MediaAsset {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  category: string;
}
