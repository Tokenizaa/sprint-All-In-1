export interface IndustrialCapability {
  id: string;
  name: string;
  description: string;
  domain: 'production' | 'inventory' | 'quality' | 'financial' | 'supplier' | 'pcp' | 'mrp';
  icon?: string;
  examples: string[];
}

export const industrialCapabilities: IndustrialCapability[] = [
  // Produção
  {
    id: 'consultar_ordens',
    name: 'Consultar ordens',
    description: 'Ver ordens de produção e seu status',
    domain: 'production',
    icon: '📋',
    examples: [
      'Quais OPs estão em andamento?',
      'Mostre as ordens de produção de hoje',
      'Liste todas as OPs atrasadas',
    ],
  },
  {
    id: 'acompanhar_producao',
    name: 'Acompanhar produção',
    description: 'Monitorar progresso da produção em tempo real',
    domain: 'production',
    icon: '📊',
    examples: [
      'Qual o progresso da OP-123?',
      'Como está a produção hoje?',
      'Mostre o status da linha 1',
    ],
  },
  {
    id: 'identificar_gargalos',
    name: 'Identificar gargalos',
    description: 'Encontrar pontos de estrangulamento na produção',
    domain: 'production',
    icon: '🔍',
    examples: [
      'Quais são os gargalos da fábrica?',
      'Existe alguma restrição de capacidade?',
      'Onde está ocorrendo atraso?',
    ],
  },
  {
    id: 'simular_cenarios',
    name: 'Simular cenários',
    description: 'Simular diferentes cenários de produção',
    domain: 'production',
    icon: '🎯',
    examples: [
      'Posso produzir 1000 unidades do Produto X?',
      'E se aumentarmos a capacidade em 20%?',
      'Simule a produção do próximo mês',
    ],
  },
  {
    id: 'planejar_capacidade',
    name: 'Planejar capacidade',
    description: 'Planejar a capacidade produtiva necessária',
    domain: 'production',
    icon: '📅',
    examples: [
      'Qual a capacidade disponível?',
      'Precisamos de mais capacidade?',
      'Planeje a produção para a próxima semana',
    ],
  },

  // Estoque
  {
    id: 'consultar_estoque',
    name: 'Consultar estoque',
    description: 'Ver saldos de estoque de materiais e produtos',
    domain: 'inventory',
    icon: '📦',
    examples: [
      'Qual meu estoque atual?',
      'Quanto temos de Material X?',
      'Mostre o saldo dos produtos acabados',
    ],
  },
  {
    id: 'itens_criticos',
    name: 'Itens críticos',
    description: 'Ver itens com estoque abaixo do mínimo',
    domain: 'inventory',
    icon: '⚠️',
    examples: [
      'Quais materiais estão críticos?',
      'Itens abaixo do estoque mínimo',
      'Existe risco de falta de material?',
    ],
  },
  {
    id: 'movimentacoes',
    name: 'Movimentações',
    description: 'Ver entradas e saídas de estoque',
    domain: 'inventory',
    icon: '🔄',
    examples: [
      'Quais movimentações ocorreram hoje?',
      'Mostre as entradas de material',
      'Histórico de saídas do Produto X',
    ],
  },
  {
    id: 'reservas',
    name: 'Reservas',
    description: 'Ver reservas de estoque para ordens de produção',
    domain: 'inventory',
    icon: '🔒',
    examples: [
      'Quais reservas existem?',
      'Material reservado para OP-123',
      'Estoque disponível vs reservado',
    ],
  },
  {
    id: 'disponibilidade',
    name: 'Disponibilidade',
    description: 'Ver disponibilidade de materiais para produção',
    domain: 'inventory',
    icon: '✅',
    examples: [
      'Tenho material para produzir?',
      'Disponibilidade para OP-123',
      'Posso atender o pedido do cliente?',
    ],
  },

  // Compras
  {
    id: 'pedidos_pendentes',
    name: 'Pedidos pendentes',
    description: 'Ver pedidos de compra em aberto',
    domain: 'supplier',
    icon: '📝',
    examples: [
      'Quais pedidos estão pendentes?',
      'Pedidos de compra em aberto',
      'Entregas previstas para esta semana',
    ],
  },
  {
    id: 'sugestoes_compra',
    name: 'Sugestões de compra',
    description: 'Gerar sugestões de compra baseadas em demanda',
    domain: 'supplier',
    icon: '💡',
    examples: [
      'Sugira compras para o próximo mês',
      'Quais materiais devo comprar?',
      'Gerar pedido de compra automático',
    ],
  },
  {
    id: 'lead_time',
    name: 'Lead time',
    description: 'Ver lead times de fornecedores',
    domain: 'supplier',
    icon: '⏱️',
    examples: [
      'Qual o lead time do Fornecedor X?',
      'Fornecedores com maior lead time',
      'Previsão de entrega dos pedidos',
    ],
  },
  {
    id: 'fornecedores_criticos',
    name: 'Fornecedores críticos',
    description: 'Identificar fornecedores com problemas',
    domain: 'supplier',
    icon: '🚨',
    examples: [
      'Quais fornecedores estão críticos?',
      'Fornecedores com atraso',
      'Avaliação dos fornecedores',
    ],
  },

  // Qualidade
  {
    id: 'refugos',
    name: 'Refugos',
    description: 'Ver taxa de refugo e não conformidades',
    domain: 'quality',
    icon: '🗑️',
    examples: [
      'Qual a taxa de refugo?',
      'Quais produtos têm mais refugo?',
      'Refugos do último mês',
    ],
  },
  {
    id: 'nao_conformidades',
    name: 'Não conformidades',
    description: 'Ver não conformidades registradas',
    domain: 'quality',
    icon: '❌',
    examples: [
      'Quais não conformidades estão abertas?',
      'Registros de qualidade',
      'Histórico de defeitos',
    ],
  },
  {
    id: 'retrabalhos',
    name: 'Retrabalhos',
    description: 'Ver retrabalhos realizados',
    domain: 'quality',
    icon: '🔧',
    examples: [
      'Quantos retrabalhos ocorreram?',
      'Custo dos retrabalhos',
      'Principais causas de retrabalho',
    ],
  },
  {
    id: 'indicadores',
    name: 'Indicadores',
    description: 'Ver indicadores de qualidade',
    domain: 'quality',
    icon: '📈',
    examples: [
      'Qual o índice de qualidade?',
      'Indicadores de qualidade do mês',
      'Evolução da qualidade',
    ],
  },

  // Financeiro
  {
    id: 'margem',
    name: 'Margem',
    description: 'Ver margens de lucro por produto',
    domain: 'financial',
    icon: '💰',
    examples: [
      'Qual a margem do Produto X?',
      'Produtos mais lucrativos',
      'Margem média da fábrica',
    ],
  },
  {
    id: 'custos',
    name: 'Custos',
    description: 'Ver custos de produção e materiais',
    domain: 'financial',
    icon: '💵',
    examples: [
      'Qual o custo do Produto X?',
      'Custo de produção do mês',
      'Análise de custos',
    ],
  },
  {
    id: 'rentabilidade',
    name: 'Rentabilidade',
    description: 'Ver rentabilidade por produto e cliente',
    domain: 'financial',
    icon: '📊',
    examples: [
      'Qual a rentabilidade do Produto X?',
      'Clientes mais rentáveis',
      'Análise de rentabilidade',
    ],
  },
  {
    id: 'roi',
    name: 'ROI',
    description: 'Ver retorno sobre investimento',
    domain: 'financial',
    icon: '📈',
    examples: [
      'Qual o ROI da produção?',
      'Retorno do último trimestre',
      'Análise de ROI',
    ],
  },
];

export function getCapabilitiesByDomain(domain: IndustrialCapability['domain']): IndustrialCapability[] {
  return industrialCapabilities.filter(cap => cap.domain === domain);
}

export function getAllCapabilities(): IndustrialCapability[] {
  return industrialCapabilities;
}

export function getCapabilityById(id: string): IndustrialCapability | undefined {
  return industrialCapabilities.find(cap => cap.id === id);
}
