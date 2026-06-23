import { Presentation, MediaAsset, Category } from './presentation-types';

export const CATEGORIES: Category[] = [
  'Visão Geral',
  'Implantação',
  'Cadastros',
  'Produção',
  'Estoque',
  'Qualidade',
  'Treinamentos'
];

export const INITIAL_MEDIA_LIBRARY: MediaAsset[] = [
  {
    id: '1',
    title: 'Painel Geral do Industrial OS',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    category: 'Dashboard'
  },
  {
    id: '2',
    title: 'Linha de Montagem IoT',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    category: 'Produção'
  },
  {
    id: '3',
    title: 'Estoque Avançado FIFO',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    category: 'Estoque'
  },
  {
    id: '4',
    title: 'Estação de Controle de Qualidade',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581091225303-d2411e28228d?auto=format&fit=crop&w=800&q=80',
    category: 'Qualidade'
  },
  {
    id: '5',
    title: 'Maquinário de Fundição Secundária',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    category: 'Produção'
  },
  {
    id: '6',
    title: 'Vídeo Demonstrativo Operacional',
    type: 'video',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    category: 'Geral'
  },
  {
    id: '7',
    title: 'Vídeo Treinamento Avançado',
    type: 'video',
    url: 'https://www.w3schools.com/html/movie.mp4',
    category: 'Produção'
  }
];

export const INITIAL_PRESENTATIONS: Presentation[] = [
  {
    id: 'pres-1',
    title: 'Conhecendo o Industrial OS',
    description: 'Uma introdução completa sobre o sistema operacional industrial unificado. Cobrindo módulos de manufatura, rastreabilidade e análise de gargalos em tempo real.',
    category: 'Visão Geral',
    createdAt: '2026-06-15T09:00:00Z',
    updatedAt: '2026-06-21T14:30:00Z',
    status: 'Publicado',
    themeColor: 'yellow',
    themeStyle: 'industrial',
    slides: [
      {
        id: 'slide-1-1',
        titulo: 'Bem-vindo ao Industrial OS',
        subtitulo: 'A Revolução no Chão de Fábrica',
        texto: 'O Industrial OS é a primeira plataforma de software integrada que centraliza e orquestra todas as camadas produtivas de sua fábrica em tempo real. Desde a matéria-prima até a expedição de produto acabado.',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        iconName: 'Presentation',
        layout: 'hero'
      },
      {
        id: 'slide-1-2',
        titulo: 'Principais Módulos do Sistema',
        subtitulo: 'Operação de Ponta a Ponta',
        texto: 'Nossa arquitetura modular permite habilitar recursos de forma autônoma de acordo com o ritmo e maturidade digital da sua indústria.',
        iconName: 'Layers',
        layout: 'bullets-only',
        listItems: [
          { id: '1-2-1', text: 'Engenharia & Cadastro: Árvores de produtos (BOM) e roteiros.' },
          { id: '1-2-2', text: 'Planejamento (PCP): Carga de ordens automática e sequenciamento finito.' },
          { id: '1-2-3', text: 'Chão de Fábrica: Apontamentos web e via coletores de código de barras.' },
          { id: '1-2-4', text: 'Estoque Dinâmico: Alocação automática por lote e FIFO.' },
          { id: '1-2-5', text: 'Garantia de Qualidade: Inspeções automáticas integradas às paradas de linha.' }
        ]
      },
      {
        id: 'slide-1-3',
        titulo: 'Gestão Baseada em Dados em Tempo Real',
        subtitulo: 'Dashboard Operacional Consolidado',
        texto: 'Monitore métricas como OEE (Eficiência Global do Equipamento), disponibilidade física, ritmo de produção e incidência de refugo direto no painel industrial unificado.',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        iconName: 'Activity',
        layout: 'split-image'
      },
      {
        id: 'slide-1-4',
        titulo: 'Treinamento Prático Operacional',
        subtitulo: 'Guia de Operação Básica de Apontamentos',
        texto: 'Assista ao vídeo abaixo para compreender a jornada típica de um operador ao realizar a abertura e apontamento de produção usando o terminal de borda do Industrial OS.',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        iconName: 'Video',
        layout: 'split-video'
      },
      {
        id: 'slide-1-5',
        titulo: 'Checklist de Sucesso',
        subtitulo: 'Pronto para começar',
        texto: 'Siga estas etapas para testar sua implantação inicial com a equipe piloto no seu primeiro posto produtivo.',
        iconName: 'ShieldCheck',
        layout: 'bullets-only',
        listItems: [
          { id: '1-5-1', text: 'Verificar conexão estável dos terminais coletores de dados' },
          { id: '1-5-2', text: 'Realizar o login dos operadores com CPF e senha na interface web' },
          { id: '1-5-3', text: 'Fazer o primeiro apontamento teste de entrada e de parada programada' },
          { id: '1-5-4', text: 'Validar se os dados sincronizaram no painel central do gerente industrial' }
        ]
      }
    ]
  },
  {
    id: 'pres-2',
    title: 'Configuração Inicial da Fábrica',
    description: 'Passo a passo para modelar a estrutura organizacional da sua fábrica dentro do Industrial OS: postos de trabalho, centros de custo e roteiros produtivos.',
    category: 'Implantação',
    createdAt: '2026-06-18T14:15:00Z',
    updatedAt: '2026-06-21T10:00:00Z',
    status: 'Em Revisão',
    themeColor: 'green',
    themeStyle: 'industrial',
    slides: [
      {
        id: 'slide-2-1',
        titulo: 'Modelando sua Fábrica',
        subtitulo: 'Gêmeo Digital de Produção',
        texto: 'A primeira fase da implantação envolve mapear as entidades físicas reais para as correspondentes lógicas dentro do Industrial OS. Isso garante que os cálculos de capacidade operem adequadamente.',
        imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
        iconName: 'Database',
        layout: 'split-image'
      },
      {
        id: 'slide-2-2',
        titulo: 'Estruturação de Postos de Trabalho',
        subtitulo: 'Postos de Trabalho e Recursos',
        texto: 'Cadastre suas injetoras, prensas ou células de montagem manual. Certifique-se de associar cada posto a um Setor Produtivo e definir sua capacidade horária.',
        iconName: 'Cog',
        layout: 'bullets-only',
        listItems: [
          { id: '2-2-1', text: 'Navegar até Menu > Cadastros Básicos > Postos de Trabalho' },
          { id: '2-2-2', text: 'Preencher o código único, tag e descrição operacional do equipamento' },
          { id: '2-2-3', text: 'Adicionar a eficiência padrão estimada (ex: 85%) para o motor de sequenciamento' }
        ]
      },
      {
        id: 'slide-2-3',
        titulo: 'Roteiros de Fabricação',
        subtitulo: 'Sequenciando as Etapas Físicas',
        texto: 'O roteiro define o caminho obrigatório que a matéria-prima percorre para virar produto. Indique os tempos padrão de Configuração (Setup) e tempo de Ciclo Unitário de Processo.',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        iconName: 'Workflow',
        layout: 'hero'
      },
      {
        id: 'slide-2-4',
        titulo: 'Treinamento Prático de Setup',
        subtitulo: 'Como ajustar tempos de troca de molde',
        texto: 'Neste treinamento em vídeo, demonstramos a tela de engenharia de ciclo e como preencher matriz de setup cruzado.',
        videoUrl: 'https://www.w3schools.com/html/movie.mp4',
        iconName: 'Video',
        layout: 'split-video'
      },
      {
        id: 'slide-2-5',
        titulo: 'Padrão Homologado',
        subtitulo: 'Verificação Final das Rotas',
        texto: 'Antes de liberar os apontamentos em produção viva, certifique-se de que os cadastros foram validados pelos analistas de processos corporativos.',
        iconName: 'CheckCircle',
        layout: 'bullets-only',
        listItems: [
          { id: '2-5-1', text: 'Revisão da lista de peças de reposição críticas e setups na engenharia' },
          { id: '2-5-2', text: 'Aprovação formal do fluxo pelo engenheiro industrial corporativo' },
          { id: '2-5-3', text: 'Treinamento piloto entregue a todos os líderes de turno cadastrados' }
        ]
      }
    ]
  }
];
