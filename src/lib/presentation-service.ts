import { supabase } from './supabase';
import { Presentation, Slide, MediaAsset, Category, Status, ListItem, FlowNode } from './presentation-types';

// ============================================================================
// CONVERSÃO DE TIPOS
// ============================================================================

// Converter Presentation para formato do banco
function presentationToDb(presentation: Presentation) {
  return {
    id: presentation.id,
    titulo: presentation.title,
    descricao: presentation.description,
    categoria: presentation.category,
    status: presentation.status.toLowerCase(),
    meta: {
      themeColor: presentation.themeColor,
      themeStyle: presentation.themeStyle,
      slideCount: presentation.slides.length
    },
    created_at: presentation.createdAt,
    updated_at: presentation.updatedAt
  };
}

// Converter do banco para Presentation
function dbToPresentation(db: any): Presentation {
  return {
    id: db.id,
    title: db.titulo,
    description: db.descricao,
    category: db.categoria as Category,
    status: db.status === 'publicado' ? 'Publicado' : db.status === 'revisao' ? 'Em Revisão' : 'Rascunho',
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    themeColor: db.meta?.themeColor,
    themeStyle: db.meta?.themeStyle,
    slides: [] // Será carregado separadamente
  };
}

// Converter Slide para formato do banco
function slideToDb(slide: Slide, apresentacaoId: string, ordem: number) {
  return {
    id: slide.id,
    apresentacao_id: apresentacaoId,
    titulo: slide.titulo || slide.title,
    subtitulo: slide.subtitulo || slide.subtitle,
    texto: slide.texto || slide.freeText,
    imagem_url: slide.imagem_url || slide.imageUrl,
    video_url: slide.video_url || slide.videoUrl,
    icones: slide.iconName ? [slide.iconName] : [],
    listas: slide.listItems || slide.topicos?.map((text, i) => ({ id: `item-${i}`, text })) || [],
    ordem,
    elementos: {
      layout: slide.layout,
      alertText: slide.alertText,
      tipText: slide.tipText,
      highlightText: slide.highlightText,
      flowNodes: slide.flowNodes
    },
    notas: slide.notas
  };
}

// Converter do banco para Slide
function dbToSlide(db: any): Slide {
  const elementos = db.elementos || {};
  return {
    id: db.id,
    titulo: db.titulo,
    subtitulo: db.subtitulo,
    texto: db.texto,
    imagem_url: db.imagem_url,
    video_url: db.video_url,
    iconName: db.icones?.[0],
    listItems: db.listas?.map((item: any) => ({
      id: item.id,
      text: item.text
    })) || [],
    layout: elementos.layout,
    alertText: elementos.alertText,
    tipText: elementos.tipText,
    highlightText: elementos.highlightText,
    flowNodes: elementos.flowNodes,
    ordem: db.ordem,
    notas: db.notas
  };
}

// Converter MediaAsset para formato do banco
function mediaToDb(media: MediaAsset) {
  return {
    id: media.id,
    nome: media.title,
    descricao: media.title,
    tipo: media.type,
    url: media.url,
    metadados: {
      category: media.category
    }
  };
}

// Converter do banco para MediaAsset
function dbToMedia(db: any): MediaAsset {
  return {
    id: db.id,
    title: db.nome,
    type: db.tipo as 'image' | 'video',
    url: db.url,
    category: db.metadados?.category || 'Geral'
  };
}

// ============================================================================
// SERVIÇOS DE APRESENTAÇÕES
// ============================================================================

export async function fetchPresentations(): Promise<Presentation[]> {
  try {
    const { data, error } = await supabase
      .from('apresentacoes')
      .select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const presentations = (data || []).map(dbToPresentation);

    // Carregar slides para cada apresentação
    for (const presentation of presentations) {
      const slides = await fetchSlides(presentation.id);
      presentation.slides = slides;
    }

    return presentations;
  } catch (error) {
    console.error('Erro ao buscar apresentações:', error);
    throw error;
  }
}

export async function fetchPresentation(id: string): Promise<Presentation | null> {
  try {
    const { data, error } = await supabase
      .from('apresentacoes')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    if (!data) return null;

    const presentation = dbToPresentation(data);
    presentation.slides = await fetchSlides(id);

    return presentation;
  } catch (error) {
    console.error('Erro ao buscar apresentação:', error);
    throw error;
  }
}

export async function createPresentation(presentation: Presentation): Promise<Presentation> {
  try {
    const dbData = presentationToDb(presentation);

    const { data, error } = await supabase
      .from('apresentacoes')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    const newPresentation = dbToPresentation(data);

    // Criar slides
    if (presentation.slides.length > 0) {
      const slides = await Promise.all(
        presentation.slides.map((slide, index) =>
          createSlide(slide, data.id, index)
        )
      );
      newPresentation.slides = slides;
    }

    return newPresentation;
  } catch (error) {
    console.error('Erro ao criar apresentação:', error);
    throw error;
  }
}

export async function updatePresentation(id: string, presentation: Partial<Presentation>): Promise<Presentation> {
  try {
    const { id: _, slides, ...updateData } = presentation;
    const dbData = presentationToDb({ ...presentation, id, slides: slides || [] } as Presentation);

    const { data, error } = await supabase
      .from('apresentacoes')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const updatedPresentation = dbToPresentation(data);

    // Atualizar slides se fornecidos
    if (slides) {
      // Deletar slides existentes
      await deleteSlides(id);
      
      // Recriar slides
      const newSlides = await Promise.all(
        slides.map((slide, index) =>
          createSlide(slide, id, index)
        )
      );
      updatedPresentation.slides = newSlides;
    } else {
      updatedPresentation.slides = await fetchSlides(id);
    }

    return updatedPresentation;
  } catch (error) {
    console.error('Erro ao atualizar apresentação:', error);
    throw error;
  }
}

export async function deletePresentation(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('apresentacoes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar apresentação:', error);
    throw error;
  }
}

// ============================================================================
// SERVIÇOS DE SLIDES
// ============================================================================

export async function fetchSlides(apresentacaoId: string): Promise<Slide[]> {
  try {
    const { data, error } = await supabase
      .from('slides')
      .select('*')
      .eq('apresentacao_id', apresentacaoId)
      .is('deleted_at', null)
      .order('ordem', { ascending: true });

    if (error) throw error;

    return (data || []).map(dbToSlide);
  } catch (error) {
    console.error('Erro ao buscar slides:', error);
    throw error;
  }
}

export async function createSlide(slide: Slide, apresentacaoId: string, ordem: number): Promise<Slide> {
  try {
    const dbData = slideToDb(slide, apresentacaoId, ordem);

    const { data, error } = await supabase
      .from('slides')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    return dbToSlide(data);
  } catch (error) {
    console.error('Erro ao criar slide:', error);
    throw error;
  }
}

export async function updateSlide(id: string, slide: Partial<Slide>): Promise<Slide> {
  try {
    const { id: _, apresentacao_id, ...updateData } = slide;
    const dbData = slideToDb({ ...slide, id, apresentacao_id: '' } as Slide, '', 0);

    const { data, error } = await supabase
      .from('slides')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return dbToSlide(data);
  } catch (error) {
    console.error('Erro ao atualizar slide:', error);
    throw error;
  }
}

export async function deleteSlide(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('slides')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar slide:', error);
    throw error;
  }
}

export async function deleteSlides(apresentacaoId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('slides')
      .update({ deleted_at: new Date().toISOString() })
      .eq('apresentacao_id', apresentacaoId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar slides:', error);
    throw error;
  }
}

// ============================================================================
// SERVIÇOS DE MÍDIA
// ============================================================================

export async function fetchMedia(): Promise<MediaAsset[]> {
  try {
    const { data, error } = await supabase
      .from('midia')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(dbToMedia);
  } catch (error) {
    console.error('Erro ao buscar mídia:', error);
    throw error;
  }
}

export async function createMedia(media: MediaAsset): Promise<MediaAsset> {
  try {
    const dbData = mediaToDb(media);

    const { data, error } = await supabase
      .from('midia')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    return dbToMedia(data);
  } catch (error) {
    console.error('Erro ao criar mídia:', error);
    throw error;
  }
}

export async function updateMedia(id: string, media: Partial<MediaAsset>): Promise<MediaAsset> {
  try {
    const { id: _, ...updateData } = media;
    const dbData = mediaToDb({ ...media, id } as MediaAsset);

    const { data, error } = await supabase
      .from('midia')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return dbToMedia(data);
  } catch (error) {
    console.error('Erro ao atualizar mídia:', error);
    throw error;
  }
}

export async function deleteMedia(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('midia')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar mídia:', error);
    throw error;
  }
}
