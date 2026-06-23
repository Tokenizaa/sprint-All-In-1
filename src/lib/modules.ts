import {
  Building2, Network, Users, Cog, Wrench, Package, Truck, Boxes,
  Component, GitBranch, Workflow, Timer, Gauge, ClipboardList,
  PackageSearch, ArrowUpDown, Factory, PlayCircle, Activity, BarChart3,
  ShieldCheck, Search, Presentation, type LucideIcon,
} from "lucide-react";

export type ModuleKey =
  | "empresa" | "setores" | "funcionarios" | "equipamentos" | "ferramentas"
  | "materias-primas" | "fornecedores" | "produtos" | "componentes" | "bom"
  | "processos" | "cronometragem" | "capacidade"
  | "ordens-producao" | "lotes" | "estoque-industrial" | "movimentacoes"
  | "apontamentos" | "consumo-materiais" | "producao-tempo-real"
  | "qualidade" | "rastreabilidade" | "apresentacoes";

export type MaturityLevel = "starter" | "growth" | "mature";

export interface ModuleDef {
  key: ModuleKey;
  title: string;
  path: string;
  icon: LucideIcon;
  group: "Estrutura" | "Recursos" | "Catálogo" | "Engenharia" | "Operações";
  description: string;
  benefit: string;
  checklist: string[];
  primaryCta: string;
  weight: number; // contribution to implantation %
  maturity: MaturityLevel; // minimum maturity level to show this module
}

export const MODULES: ModuleDef[] = [
  { key: "empresa", title: "Empresa", path: "/empresa", icon: Building2, group: "Estrutura",
    description: "Cadastre a identidade da sua fábrica: razão social, unidades, regimes fiscais e marca.",
    benefit: "É o ponto de partida para qualquer documento, relatório e integração futura com PCP, MRP e BI.",
    checklist: ["Razão social e CNPJ", "Endereço da unidade", "Logotipo da marca", "Responsável técnico"],
    primaryCta: "Cadastrar empresa", weight: 8, maturity: "growth" },
  { key: "setores", title: "Setores", path: "/setores", icon: Network, group: "Estrutura",
    description: "Estruture a hierarquia da fábrica em setores produtivos e administrativos.",
    benefit: "Permite alocar equipamentos, pessoas e custos por área — base para apontamento e BI.",
    checklist: ["Setores produtivos", "Setores de apoio", "Responsáveis por setor"],
    primaryCta: "Criar setor", weight: 6, maturity: "growth" },
  { key: "funcionarios", title: "Funcionários", path: "/funcionarios", icon: Users, group: "Recursos",
    description: "Mapeie a equipe da fábrica, funções, turnos e centros de custo.",
    benefit: "Base para apontamento de produção, controle de capacidade e custo de mão-de-obra.",
    checklist: ["Cadastro com função", "Turno e jornada", "Vínculo com setor"],
    primaryCta: "Adicionar funcionário", weight: 7, maturity: "growth" },
  { key: "equipamentos", title: "Equipamentos", path: "/equipamentos", icon: Cog, group: "Recursos",
    description: "Cadastre máquinas, linhas e estações de trabalho da fábrica.",
    benefit: "Habilita cálculo de capacidade, manutenção preventiva e custo hora-máquina.",
    checklist: ["Máquinas principais", "Capacidade nominal", "Setor de origem"],
    primaryCta: "Cadastrar equipamento", weight: 9, maturity: "growth" },
  { key: "ferramentas", title: "Ferramentas", path: "/ferramentas", icon: Wrench, group: "Recursos",
    description: "Controle moldes, gabaritos, dispositivos e ferramentas auxiliares.",
    benefit: "Evita parada de linha por ferramenta indisponível e organiza setup de produção.",
    checklist: ["Moldes e gabaritos", "Localização", "Status de uso"],
    primaryCta: "Cadastrar ferramenta", weight: 4, maturity: "mature" },
  { key: "materias-primas", title: "Matérias-Primas", path: "/materias-primas", icon: Package, group: "Catálogo",
    description: "Estruture o catálogo de espumas, tecidos, molas, linhas e insumos.",
    benefit: "Pré-requisito de BOM, custos e do futuro MRP — comprar na hora certa.",
    checklist: ["Famílias de insumos", "Unidade de medida", "Fornecedor principal"],
    primaryCta: "Cadastrar matéria-prima", weight: 10, maturity: "starter" },
  { key: "fornecedores", title: "Fornecedores", path: "/fornecedores", icon: Truck, group: "Catálogo",
    description: "Cadastre fornecedores estratégicos, lead times e condições comerciais.",
    benefit: "Permite calcular ponto de pedido, comparar custos e habilitar futuras compras automatizadas.",
    checklist: ["Dados fiscais", "Lead time médio", "Vínculo com matérias-primas"],
    primaryCta: "Adicionar fornecedor", weight: 6, maturity: "starter" },
  { key: "produtos", title: "Produtos", path: "/produtos", icon: Boxes, group: "Catálogo",
    description: "Defina o portfólio de colchões: linhas, modelos, dimensões e SKU.",
    benefit: "Conecta vendas, BOM, processos e capacidade — o centro do seu negócio.",
    checklist: ["Linhas comerciais", "Modelos e tamanhos", "SKU padronizado"],
    primaryCta: "Cadastrar produto", weight: 10, maturity: "starter" },
  { key: "componentes", title: "Componentes", path: "/componentes", icon: Component, group: "Engenharia",
    description: "Cadastre semi-acabados e subconjuntos usados em vários produtos.",
    benefit: "Reduz duplicidade em BOM e prepara terreno para produção em estágios.",
    checklist: ["Capa montada", "Núcleo de molas", "Conjuntos pillow-top"],
    primaryCta: "Cadastrar componente", weight: 6, maturity: "mature" },
  { key: "bom", title: "BOM", path: "/bom", icon: GitBranch, group: "Engenharia",
    description: "Estruture a árvore de materiais (Bill of Materials) de cada produto.",
    benefit: "Fundação para custo padrão, MRP, PCP e ordens de produção.",
    checklist: ["BOM dos modelos principais", "Quantidades e perdas", "Versão ativa"],
    primaryCta: "Montar BOM", weight: 10, maturity: "starter" },
  { key: "processos", title: "Processos", path: "/processos", icon: Workflow, group: "Engenharia",
    description: "Mapeie o roteiro de fabricação: operações, sequência e recursos.",
    benefit: "Habilita cálculo de tempo padrão, capacidade real e apontamento por operação.",
    checklist: ["Roteiro por produto", "Operações e recursos", "Pré-requisitos"],
    primaryCta: "Criar processo", weight: 9, maturity: "growth" },
  { key: "cronometragem", title: "Cronometragem", path: "/cronometragem", icon: Timer, group: "Engenharia",
    description: "Registre tempos cronometrados por operação para gerar tempo padrão.",
    benefit: "Sem tempo padrão não há PCP confiável. Mede a fábrica de verdade.",
    checklist: ["Tomadas de tempo", "PF e tolerâncias", "Tempo padrão aprovado"],
    primaryCta: "Nova cronometragem", weight: 8, maturity: "mature" },
  { key: "capacidade", title: "Capacidade", path: "/capacidade", icon: Gauge, group: "Engenharia",
    description: "Calcule a capacidade produtiva por recurso, turno e período.",
    benefit: "Revela gargalos, sustenta promessas comerciais e orienta investimentos.",
    checklist: ["Capacidade por recurso", "Turnos ativos", "Cenário base aprovado"],
    primaryCta: "Calcular capacidade", weight: 7, maturity: "growth" },
  { key: "ordens-producao", title: "Ordens de Produção", path: "/ordens-producao", icon: ClipboardList, group: "Operações",
    description: "Crie e gerencie ordens de produção com status, prioridade, datas e responsáveis.",
    benefit: "Centro de toda a produção — conecta planejamento, execução e rastreabilidade.",
    checklist: ["OPs criadas", "Status definidos", "Vínculo com produtos"],
    primaryCta: "Criar ordem de produção", weight: 10, maturity: "starter" },
  { key: "lotes", title: "Lotes", path: "/lotes", icon: PackageSearch, group: "Operações",
    description: "Rastreie lotes de produção com matérias-primas, operadores e equipamentos.",
    benefit: "Garante rastreabilidade completa — do insumo ao produto final.",
    checklist: ["Lotes criados", "Vínculo com OPs", "Rastreabilidade de materiais"],
    primaryCta: "Criar lote", weight: 8, maturity: "growth" },
  { key: "estoque-industrial", title: "Estoque Industrial", path: "/estoque-industrial", icon: Factory, group: "Operações",
    description: "Controle estoque de matéria-prima, semi-acabado, produto acabado e materiais auxiliares.",
    benefit: "Evita paradas por falta de material e otimiza capital de giro.",
    checklist: ["Categorias de estoque", "Saldos iniciais", "Classificação ABC"],
    primaryCta: "Registrar estoque", weight: 9, maturity: "starter" },
  { key: "movimentacoes", title: "Movimentações", path: "/movimentacoes", icon: ArrowUpDown, group: "Operações",
    description: "Registre entradas, saídas, consumos, produções e transferências de estoque.",
    benefit: "Histórico automático de todas as movimentações — nunca edite saldo diretamente.",
    checklist: ["Tipos de movimentação", "Histórico registrado", "Integridade de saldos"],
    primaryCta: "Registrar movimentação", weight: 7, maturity: "growth" },
  { key: "apontamentos", title: "Apontamentos", path: "/apontamentos", icon: PlayCircle, group: "Operações",
    description: "Registre apontamentos de produção: OP, processo, equipamento, operador, horas, quantidade e refugo.",
    benefit: "Base para cálculo de eficiência, custos reais e rastreabilidade completa da produção.",
    checklist: ["Apontamentos por operação", "Horas trabalhadas", "Quantidade produzida e refugo"],
    primaryCta: "Novo apontamento", weight: 10, maturity: "starter" },
  { key: "consumo-materiais", title: "Consumo de Materiais", path: "/consumo-materiais", icon: Activity, group: "Operações",
    description: "Registre automaticamente o consumo de espuma, tecido, cola e outros materiais durante a produção.",
    benefit: "Controle preciso de custos, identificação de desperdícios e cálculo de rendimento.",
    checklist: ["Consumo por OP", "Comparação com BOM", "Identificação de desperdícios"],
    primaryCta: "Registrar consumo", weight: 8, maturity: "growth" },
  { key: "producao-tempo-real", title: "Produção em Tempo Real", path: "/producao-tempo-real", icon: BarChart3, group: "Operações",
    description: "Painel em tempo real mostrando OPs em andamento, máquinas produzindo/paradas e eficiência.",
    benefit: "Visibilidade instantânea da fábrica para tomada de decisões ágeis e correção de desvios.",
    checklist: ["OPs em andamento", "Status das máquinas", "Produção do dia e refugo"],
    primaryCta: "Abrir painel", weight: 9, maturity: "mature" },
  { key: "qualidade", title: "Qualidade", path: "/qualidade", icon: ShieldCheck, group: "Operações",
    description: "Registre inspeções, não conformidades, retrabalho e aprovações durante a produção.",
    benefit: "Garante a qualidade do produto final, reduz retrabalho e mantém histórico de problemas.",
    checklist: ["Inspeções por OP", "Não conformidades registradas", "Retrabalho documentado", "Aprovações finais"],
    primaryCta: "Nova inspeção", weight: 8, maturity: "starter" },
  { key: "rastreabilidade", title: "Rastreabilidade", path: "/rastreabilidade", icon: Search, group: "Operações",
    description: "Visualize a cadeia completa: lote → OP → matérias-primas → fornecedores → equipamentos → operadores.",
    benefit: "Rastreabilidade total para recalls, auditorias e análise de problemas.",
    checklist: ["Rastreabilidade por lote", "Cadeia de fornecedores", "Histórico de operadores", "Registro de inspeções"],
    primaryCta: "Buscar lote", weight: 7, maturity: "starter" },
  { key: "apresentacoes", title: "Apresentações", path: "/apresentacoes", icon: Presentation, group: "Operações",
    description: "Crie e gerencie apresentações de treinamento do Industrial OS com editor visual drag-and-drop.",
    benefit: "Centralize todo o material de treinamento em um único lugar, facilitando onboarding e capacitação da equipe.",
    checklist: ["Apresentações criadas", "Slides estruturados", "Biblioteca de mídia organizada", "Categorias definidas"],
    primaryCta: "Nova apresentação", weight: 5, maturity: "growth" },
];

export const TOTAL_WEIGHT = MODULES.reduce((s, m) => s + m.weight, 0);

export const MODULE_GROUPS: Array<ModuleDef["group"]> = [
  "Estrutura", "Recursos", "Catálogo", "Engenharia", "Operações",
];

/**
 * Industrial OS — Editions
 * Cada edição representa um estágio de maturidade da fábrica. Módulos não exibidos
 * continuam totalmente funcionais — apenas ficam ocultos no menu até a fábrica
 * amadurecer e habilitar Growth ou Mature.
 */
export const EDITIONS: Record<MaturityLevel, { label: string; tagline: string; description: string }> = {
  starter: {
    label: "Starter",
    tagline: "Primeiro lote",
    description: "Tudo que uma fábrica precisa para produzir o primeiro lote. Menu enxuto, sem distrações.",
  },
  growth: {
    label: "Growth",
    tagline: "Estabilização",
    description: "Estrutura completa: setores, equipamentos, processos e capacidade. Para fábricas estabilizando rotina.",
  },
  mature: {
    label: "Mature",
    tagline: "Operação madura",
    description: "Todos os módulos habilitados: cronometragem, painéis em tempo real, IA industrial e indicadores avançados.",
  },
};

/** Módulos oficiais da edição Starter — o que a fábrica precisa para o primeiro lote. */
export const STARTER_MODULE_KEYS: ModuleKey[] = MODULES
  .filter((m) => m.maturity === "starter")
  .map((m) => m.key);
