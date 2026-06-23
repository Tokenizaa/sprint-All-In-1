import { useState, useEffect, useCallback, useMemo } from "react";
import { Sparkles, Send, Bot, X, AlertCircle, CheckCircle2, Search, Lightbulb, FileText, Activity, Wrench, Package, Factory, Truck, Building2, BarChart3, Plus, RefreshCw, ChevronRight, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, computeImplantation } from "@/lib/store";
import { MODULES, type ModuleKey } from "@/lib/modules";
import { aiService } from "@/services/AIService";
import { toolRegistry } from "@/services/ToolRegistry";
import { useLocation, useNavigate } from "@tanstack/react-router";

interface AgentMessage {
  role: "user" | "ai";
  text: string;
  actions?: Array<{
    label: string;
    action: string;
    icon?: any;
  }>;
}

interface AgentCache {
  [key: string]: {
    response: string;
    timestamp: number;
    context: string;
  };
}

interface AgentMemory {
  [module: string]: AgentMessage[];
}

interface AgentContext {
  module: ModuleKey;
  page: string;
  selectedRecord?: any;
  data?: any;
  metrics?: any;
}

interface AgentConfig {
  id: string;
  name: string;
  icon: any;
  domain: string;
  systemPrompt: string;
  quickActions: Array<{ icon: any; label: string; action: string }>;
  diagnosticPrompt: string;
  suggestedActions: Array<{ label: string; action: string; icon?: any; route?: string }>;
}

const AGENT_CONFIGS: Partial<Record<ModuleKey, AgentConfig>> = {
  empresa: {
    id: "agent-administrativo",
    name: "Agent Administrativo",
    icon: Building2,
    domain: "Gestão Empresarial",
    systemPrompt: "Você é um especialista em gestão empresarial industrial. Ajudar com cadastro de empresas, endereços, dados fiscais, regimes tributários e configurações organizacionais. Focar em compliance, estrutura legal e organizacional.",
    diagnosticPrompt: "Faça um diagnóstico completo do cadastro da empresa. Verifique: 1) Dados cadastrais completos (razão social, CNPJ, endereço), 2) Dados fiscais (regime tributário, inscrições estaduais/municipais), 3) Estrutura organizacional (unidades, responsáveis), 4) Compliance e documentação. Liste problemas, campos faltando e riscos.",
    quickActions: [
      { icon: Search, label: "Analisar cadastro", action: "analyze" },
      { icon: AlertCircle, label: "Verificar dados fiscais", action: "fiscal" },
      { icon: FileText, label: "Explicar regime", action: "explain" },
      { icon: Lightbulb, label: "O que falta?", action: "missing" },
    ],
    suggestedActions: [
      { label: "Cadastrar empresa", action: "create", icon: Plus, route: "/empresa/novo" },
      { label: "Editar dados fiscais", action: "edit-fiscal", icon: FileText },
      { label: "Adicionar unidade", action: "add-unit", icon: Building2 },
    ],
  },
  equipamentos: {
    id: "agent-ativos-industriais",
    name: "Agent Ativos Industriais",
    icon: Wrench,
    domain: "Gestão de Ativos",
    systemPrompt: "Você é um especialista em gestão de ativos industriais. Ajudar com cadastro de máquinas, capacidade produtiva, manutenção preventiva, performance e OEE. Focar em maximizar disponibilidade e eficiência dos equipamentos.",
    diagnosticPrompt: "Faça um diagnóstico do parque de equipamentos. Verifique: 1) Cadastro completo (fabricante, modelo, série, capacidade), 2) Localização correta (setor, linha, posição), 3) Capacidade produtiva cadastrada, 4) Status atual (ativos, em manutenção, inativos), 5) Equipamentos sem capacidade definida. Liste gargalos e oportunidades.",
    quickActions: [
      { icon: Search, label: "Analisar parque", action: "analyze" },
      { icon: AlertCircle, label: "Gargalos", action: "bottlenecks" },
      { icon: Activity, label: "Capacidade", action: "capacity" },
      { icon: Lightbulb, label: "O que falta?", action: "missing" },
    ],
    suggestedActions: [
      { label: "Cadastrar equipamento", action: "create", icon: Plus },
      { label: "Definir capacidade", action: "add-capacity", icon: Activity },
      { label: "Agendar manutenção", action: "schedule-maintenance", icon: Wrench },
    ],
  },
  "materias-primas": {
    id: "agent-materiais",
    name: "Agent Gestão de Materiais",
    icon: Package,
    domain: "Gestão de Materiais",
    systemPrompt: "Você é um especialista em gestão de materiais industriais. Ajudar com cadastro de espumas, tecidos, molejos, insumos e estoque. Focar em controle de estoque, lead time e qualidade dos materiais.",
    diagnosticPrompt: "Faça um diagnóstico do estoque de matérias-primas. Verifique: 1) Materiais cadastrados com dados completos, 2) Estoques mínimos definidos, 3) Materiais com estoque abaixo do mínimo, 4) Lead times cadastrados, 5) Fornecedores associados. Liste riscos de falta e oportunidades de otimização.",
    quickActions: [
      { icon: Search, label: "Analisar estoque", action: "analyze" },
      { icon: AlertCircle, label: "Riscos de falta", action: "risks" },
      { icon: Truck, label: "Fornecedores", action: "suppliers" },
      { icon: Lightbulb, label: "O que falta?", action: "missing" },
    ],
    suggestedActions: [
      { label: "Cadastrar material", action: "create", icon: Plus },
      { label: "Ajustar estoque mínimo", action: "adjust-min", icon: Activity },
      { label: "Associar fornecedor", action: "add-supplier", icon: Truck },
    ],
  },
  produtos: {
    id: "agent-engenharia-produto",
    name: "Agent Engenharia de Produto",
    icon: Package,
    domain: "Engenharia de Produto",
    systemPrompt: "Você é um especialista em engenharia de produto para colchões. Ajudar com SKUs, linhas comerciais, dimensões, especificações técnicas e BOM. Focar em qualidade, padronização e engenharia de produto.",
    diagnosticPrompt: "Faça um diagnóstico do portfólio de produtos. Verifique: 1) SKUs com dados completos (dimensões, densidade, conforto), 2) BOMs completas e consistentes, 3) Linhas comerciais definidas, 4) Produtos sem BOM, 5) Complexidade do portfólio. Liste inconsistências e oportunidades de padronização.",
    quickActions: [
      { icon: Search, label: "Analisar portfólio", action: "analyze" },
      { icon: FileText, label: "BOM incompletas", action: "bom" },
      { icon: Activity, label: "Complexidade", action: "complexity" },
      { icon: Lightbulb, label: "O que falta?", action: "missing" },
    ],
    suggestedActions: [
      { label: "Cadastrar produto", action: "create", icon: Plus },
      { label: "Criar BOM", action: "create-bom", icon: FileText },
      { label: "Padronizar linha", action: "standardize", icon: Activity },
    ],
  },
  processos: {
    id: "agent-engenharia-processos",
    name: "Agent Engenharia de Processos",
    icon: Factory,
    domain: "Engenharia de Processos",
    systemPrompt: "Você é um especialista em engenharia industrial e processos. Ajudar com roteiros de fabricação, operações, sequenciamento e layout. Focar em otimização de fluxo, redução de setup e eficiência operacional.",
    diagnosticPrompt: "Faça um diagnóstico dos processos de fabricação. Verifique: 1) Roteiros completos com todas as etapas, 2) Tempos padrões definidos, 3) Equipamentos associados a cada etapa, 4) Gargalos identificados, 5) Ineficiências no fluxo. Liste oportunidades de melhoria e otimização.",
    quickActions: [
      { icon: Search, label: "Analisar fluxo", action: "analyze" },
      { icon: AlertCircle, label: "Ineficiências", action: "inefficiencies" },
      { icon: Activity, label: "Gargalos", action: "bottlenecks" },
      { icon: Lightbulb, label: "O que falta?", action: "missing" },
    ],
    suggestedActions: [
      { label: "Criar processo", action: "create", icon: Plus },
      { label: "Adicionar etapa", action: "add-step", icon: ChevronRight },
      { label: "Definir tempo padrão", action: "set-time", icon: Clock },
    ],
  },
  capacidade: {
    id: "agent-planejamento-industrial",
    name: "Agent Planejamento Industrial",
    icon: BarChart3,
    domain: "Planejamento Industrial",
    systemPrompt: "Você é um especialista em planejamento industrial e PCP. Ajudar com capacidade produtiva, gargalos, eficiência, turnos e programação. Focar em maximizar throughput e balancear carga.",
    diagnosticPrompt: "Faça um diagnóstico da capacidade produtiva. Verifique: 1) Capacidade instalada por recurso, 2) Turnos definidos, 3) Eficiência atual vs potencial, 4) Gargalos de capacidade, 5) Balanceamento de carga entre setores. Liste oportunidades de expansão e otimização.",
    quickActions: [
      { icon: Search, label: "Analisar capacidade", action: "analyze" },
      { icon: AlertCircle, label: "Gargalos", action: "bottlenecks" },
      { icon: Activity, label: "Eficiência", action: "efficiency" },
      { icon: Lightbulb, label: "O que falta?", action: "missing" },
    ],
    suggestedActions: [
      { label: "Cadastrar capacidade", action: "create", icon: Plus },
      { label: "Simular cenário", action: "simulate", icon: Zap },
      { label: "Ajustar turnos", action: "adjust-shifts", icon: Clock },
    ],
  },
  fornecedores: {
    id: "agent-supply-chain",
    name: "Agent Supply Chain",
    icon: Truck,
    domain: "Supply Chain",
    systemPrompt: "Você é um especialista em gestão de fornecedores e supply chain. Ajudar com cadastro, lead times, condições comerciais e relacionamento. Focar em confiabilidade, custo e qualidade de fornecimento.",
    diagnosticPrompt: "Faça um diagnóstico da base de fornecedores. Verifique: 1) Cadastro completo (CNPJ, contato, condições), 2) Lead times cadastrados, 3) Avaliação de desempenho, 4) Riscos de dependência, 5) Diversificação por categoria. Liste riscos de supply chain e oportunidades de negociação.",
    quickActions: [
      { icon: Search, label: "Analisar base", action: "analyze" },
      { icon: AlertCircle, label: "Riscos", action: "risks" },
      { icon: Activity, label: "Lead times", action: "leadtime" },
      { icon: Lightbulb, label: "O que falta?", action: "missing" },
    ],
    suggestedActions: [
      { label: "Cadastrar fornecedor", action: "create", icon: Plus },
      { label: "Avaliar desempenho", action: "evaluate", icon: Activity },
      { label: "Negociar condições", action: "negotiate", icon: FileText },
    ],
  },
};

interface IndustrialAgentProps {
  moduleKey: ModuleKey;
  selectedRecord?: any;
}

export function IndustrialAgent({ moduleKey, selectedRecord }: IndustrialAgentProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const records = useStore((s) => s.records);
  const company = useStore((s) => s.companyName);
  const stats = useMemo(() => computeImplantation({ records } as never), [records]);
  
  const agentConfig = AGENT_CONFIGS[moduleKey] || AGENT_CONFIGS.empresa!;
  const AgentIcon = agentConfig.icon;
  
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ollamaHealthy, setOllamaHealthy] = useState<boolean | null>(null);
  const [diagnosticMode, setDiagnosticMode] = useState(false);
  const [cache, setCache] = useState<AgentCache>({});
  const [memory, setMemory] = useState<AgentMemory>(() => {
    // Load memory from localStorage
    try {
      const saved = localStorage.getItem("industrial-agent-memory");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  
  const [messages, setMessages] = useState<AgentMessage[]>(() => {
    // Load conversation from memory for this module
    const moduleMemory = memory[moduleKey] || [];
    if (moduleMemory.length > 0) {
      return moduleMemory;
    }
    return [{
      role: "ai",
      text: `Olá! Sou ${agentConfig.name}, especialista em ${agentConfig.domain}. Sua implantação está em ${stats.overall}%. Como posso ajudar com ${moduleKey}?`,
    }];
  });

  const getCurrentContext = (): AgentContext => {
    const moduleData = records[moduleKey] || [];
    const moduleStats = stats.perModule[moduleKey];
    
    return {
      module: moduleKey,
      page: location.pathname,
      selectedRecord,
      data: moduleData,
      metrics: moduleStats,
    };
  };

  const getSystemPrompt = (): string => {
    const context = getCurrentContext();
    
    return `${agentConfig.systemPrompt}

Contexto da fábrica:
- Empresa: ${company || "Não cadastrada"}
- Progresso da implantação: ${stats.overall}%
- Módulo atual: ${moduleKey}
- Registros neste módulo: ${context.data?.length || 0}
- Progresso do módulo: ${context.metrics?.progress ? Math.round(context.metrics.progress * 100) : 0}%
${selectedRecord ? `- Registro selecionado: ${selectedRecord.name || selectedRecord.id}` : ""}

Seu papel é ajudar o usuário a:
1. Entender o contexto atual do módulo
2. Identificar problemas ou inconsistências
3. Sugerir ações relevantes e específicas
4. Explicar conceitos do domínio
5. Orientar próximos passos

Seja conciso, prático e use linguagem técnica do domínio ${agentConfig.domain}.`;
  };

  useEffect(() => {
    // Check Ollama health only when drawer is open to avoid console spam
    if (!isOpen) return;
    
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        setOllamaHealthy(response.ok);
      } catch {
        setOllamaHealthy(false);
      }
    };
    checkHealth();
  }, [isOpen]);

  // Persist memory to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("industrial-agent-memory", JSON.stringify(memory));
    } catch (error) {
      console.error("Error saving agent memory:", error);
    }
  }, [memory]);

  // Update memory when messages change
  useEffect(() => {
    setMemory((prev) => ({
      ...prev,
      [moduleKey]: messages,
    }));
  }, [messages, moduleKey]);

  // Clean old cache entries (older than 1 hour)
  useEffect(() => {
    const now = Date.now();
    setCache((prev) => {
      const cleaned: AgentCache = {};
      for (const [key, value] of Object.entries(prev as any)) {
        if (now - (value as any).timestamp < 3600000) { // 1 hour
          cleaned[key] = value as any;
        }
      }
      return cleaned;
    });
  }, []);

  const send = async (quickAction?: string) => {
    const q = quickAction || input.trim();
    if (!q) return;

    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);

    try {
      const context = getCurrentContext();
      const cacheKey = `${moduleKey}-${q}-${JSON.stringify(context.data?.length || 0)}`;
      
      // Check cache
      if (cache[cacheKey]) {
        const cachedReply = cache[cacheKey].response;
        setMessages((m) => [...m, { role: "ai", text: cachedReply }]);
        setLoading(false);
        return;
      }

      // Build messages for AIService
      const chatMessages = [
        {
          role: "system" as const,
          content: diagnosticMode ? agentConfig.diagnosticPrompt : getSystemPrompt(),
        },
        ...messages.slice(1).map((m) => ({
          role: (m.role === "ai" ? "assistant" : "user") as "user" | "assistant",
          content: m.text,
        })),
        { role: "user" as const, content: q },
      ];

      // Get available tools for current module and map them to AIService ToolDefinition format
      const availableTools = toolRegistry.getToolsByDomain(agentConfig.domain).map(t => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters
        }
      }));

      // Call AIService with streaming
      let fullResponse = "";
      const result = await aiService.sendMessageWithStreaming(
        chatMessages,
        availableTools,
        (chunk) => {
          if (chunk.content) {
            fullResponse += chunk.content;
            // Update the last AI message with streaming content
            setMessages((m) => {
              const newMessages = [...m];
              const lastMsg = newMessages[newMessages.length - 1];
              if (lastMsg && lastMsg.role === "ai") {
                newMessages[newMessages.length - 1] = { ...lastMsg, text: fullResponse };
              } else {
                newMessages.push({ role: "ai", text: fullResponse });
              }
              return newMessages;
            });
          }
        },
        {
          module: moduleKey,
          page: location.pathname,
          selectedRecord,
          data: context.data,
          metrics: context.metrics,
        } as any
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      // Cache the response
      setCache((prev) => ({
        ...prev,
        [cacheKey]: {
          response: fullResponse,
          timestamp: Date.now(),
          context: JSON.stringify(context),
        },
      }));

      // Parse action suggestions from AI response
      const actions = parseActionSuggestions(fullResponse);
      setMessages((m) => {
        const newMessages = [...m];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === "ai") {
          newMessages[newMessages.length - 1] = { ...lastMsg, text: fullResponse, actions };
        }
        return newMessages;
      });
    } catch (error) {
      console.error("Error calling AIService:", error);
      const fallbackReply = `Não foi possível conectar ao serviço de IA. Verifique se o Ollama está rodando em http://localhost:11434.`;
      setMessages((m) => [...m, { role: "ai", text: fallbackReply }]);
    } finally {
      setLoading(false);
    }
  };

  const parseActionSuggestions = (text: string): Array<{ label: string; action: string; icon?: any }> => {
    // Simple heuristic to extract action suggestions from AI response
    const actions: Array<{ label: string; action: string; icon?: any }> = [];
    
    // If AI mentions specific actions, suggest them
    if (text.toLowerCase().includes("cadastrar") || text.toLowerCase().includes("criar")) {
      actions.push({ label: "Cadastrar novo", action: "create", icon: Plus });
    }
    if (text.toLowerCase().includes("editar") || text.toLowerCase().includes("atualizar")) {
      actions.push({ label: "Editar", action: "edit", icon: FileText });
    }
    if (text.toLowerCase().includes("analisar") || text.toLowerCase().includes("diagnóstico")) {
      actions.push({ label: "Análise detalhada", action: "analyze", icon: Search });
    }
    
    return actions;
  };

  const handleSuggestedAction = (action: string) => {
    const suggestedAction = agentConfig.suggestedActions.find((a) => a.action === action);
    if (suggestedAction?.route) {
      navigate({ to: suggestedAction.route });
    } else {
      // Send the action as a prompt to the agent
      const actionPrompts: Record<string, string> = {
        create: `Quero criar um novo registro em ${moduleKey}. Por favor, me oriente sobre o processo de cadastro.`,
        'edit-fiscal': `Quero editar os dados fiscais da empresa. Por favor, me oriente sobre os campos necessários.`,
        'add-unit': `Quero adicionar uma nova unidade à empresa. Por favor, me oriente sobre o processo.`,
        'add-capacity': `Quero definir a capacidade produtiva de um equipamento. Por favor, me oriente.`,
        'schedule-maintenance': `Quero agendar uma manutenção preventiva. Por favor, me oriente sobre o processo.`,
        'adjust-min': `Quero ajustar o estoque mínimo de um material. Por favor, me oriente.`,
        'add-supplier': `Quero associar um fornecedor a um material. Por favor, me oriente.`,
        'create-bom': `Quero criar uma BOM para um produto. Por favor, me oriente sobre o processo.`,
        standardize: `Quero padronizar a linha de produtos. Por favor, me oriente sobre como simplificar o portfólio.`,
        'add-step': `Quero adicionar uma etapa ao processo de fabricação. Por favor, me oriente.`,
        'set-time': `Quero definir o tempo padrão de uma operação. Por favor, me oriente.`,
        simulate: `Quero simular um cenário de capacidade. Por favor, me oriente.`,
        'adjust-shifts': `Quero ajustar os turnos de trabalho. Por favor, me oriente.`,
        evaluate: `Quero avaliar o desempenho de um fornecedor. Por favor, me oriente.`,
        negotiate: `Quero negociar condições comerciais com um fornecedor. Por favor, me oriente.`,
      };
      
      const prompt = actionPrompts[action] || action;
      setInput(prompt);
    }
  };

  const handleDiagnosticMode = () => {
    setDiagnosticMode(!diagnosticMode);
    if (!diagnosticMode) {
      send(agentConfig.diagnosticPrompt);
    }
  };

  const handleQuickAction = (action: string) => {
    const context = getCurrentContext();
    const actionPrompts: Record<string, string> = {
      analyze: `Analise o módulo ${moduleKey} com ${context.data?.length || 0} registros. Identifique pontos de atenção, oportunidades e sugestões específicas para ${agentConfig.domain}.`,
      fiscal: `Verifique os dados fiscais e cadastrais da empresa. Identifique possíveis inconsistências, campos faltando ou problemas de compliance.`,
      explain: `Explique como funciona o módulo ${moduleKey} no contexto de ${agentConfig.domain}. Qual sua importância na operação industrial?`,
      missing: `O que está faltando no módulo ${moduleKey}? Liste os campos ou informações essenciais que ainda não foram cadastradas.`,
      bottlenecks: `Identifique gargalos e limitações no módulo ${moduleKey}. Quais são os principais pontos de restrição em ${agentConfig.domain}?`,
      capacity: `Analise a capacidade produtiva atual. Quais são as limitações e oportunidades de expansão?`,
      risks: `Identifique riscos no módulo ${moduleKey}. Quais são os principais pontos de atenção em ${agentConfig.domain}?`,
      suppliers: `Analise a base de fornecedores. Quais são os pontos de atenção e oportunidades de melhoria?`,
      bom: `Verifique as BOMs dos produtos. Identifique BOMs incompletas, inconsistentes ou com problemas de estrutura.`,
      complexity: `Analise a complexidade do portfólio de produtos. Quais são os produtos mais complexos e por quê?`,
      inefficiencies: `Identifique ineficiências nos processos atuais. Quais são as principais oportunidades de melhoria?`,
      efficiency: `Analise a eficiência operacional. Quais são os indicadores e como podem ser melhorados?`,
      leadtime: `Analise os lead times dos fornecedores. Quais são os pontos de atenção e riscos?`,
    };
    
    send(actionPrompts[action] || action);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
          title={`${agentConfig.name} - ${agentConfig.domain}`}
        >
          <AgentIcon className="size-5" />
          <span className="font-medium">Agent</span>
        </button>
      )}

      {/* Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl flex flex-col animate-in slide-in-from-right">
            {/* Header */}
            <header className="flex items-center justify-between gap-3 border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
                  <AgentIcon className="size-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">{agentConfig.name}</h1>
                  <p className="text-xs text-muted-foreground">{agentConfig.domain}</p>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    {ollamaHealthy === null ? (
                      <span className="text-muted-foreground">Verificando...</span>
                    ) : ollamaHealthy ? (
                      <div className="flex items-center gap-1.5 text-success">
                        <CheckCircle2 className="size-3.5" />
                        <span>Conectado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-destructive">
                        <AlertCircle className="size-3.5" />
                        <span>Offline</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={diagnosticMode ? "default" : "ghost"}
                  size="sm"
                  onClick={handleDiagnosticMode}
                  className="gap-2"
                >
                  <Zap className="size-4" />
                  <span className="text-xs">Diagnóstico</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="size-4" />
                </Button>
              </div>
            </header>

            {/* Quick Actions */}
            <div className="border-b border-border p-4">
              <div className="flex flex-wrap gap-2">
                {agentConfig.quickActions.map((action) => (
                  <button
                    key={action.action}
                    onClick={() => handleQuickAction(action.action)}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    <action.icon className="size-3.5" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Actions */}
            {agentConfig.suggestedActions.length > 0 && (
              <div className="border-b border-border p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Ações sugeridas</p>
                <div className="flex flex-wrap gap-2">
                  {agentConfig.suggestedActions.map((action) => (
                    <button
                      key={action.action}
                      onClick={() => handleSuggestedAction(action.action)}
                      className="flex items-center gap-1.5 rounded-lg border border-border bg-primary/5 px-3 py-2 text-xs font-medium hover:bg-primary/10 transition-colors"
                    >
                      {action.icon && <action.icon className="size-3.5" />}
                      {action.label}
                      {action.route && <ChevronRight className="size-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "ai" && (
                    <div className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 ring-1 ring-primary/20">
                      <Bot className="size-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] space-y-2 ${m.role === "user" ? "flex flex-col items-end" : ""}`}>
                    <div className={`rounded-2xl px-3.5 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {m.text}
                    </div>
                    {m.actions && m.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {m.actions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestedAction(action.action)}
                            className="flex items-center gap-1.5 rounded-lg border border-border bg-primary/5 px-3 py-1.5 text-xs font-medium hover:bg-primary/10 transition-colors"
                          >
                            {action.icon && <action.icon className="size-3.5" />}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 ring-1 ring-primary/20">
                    <Bot className="size-4 text-primary" />
                  </div>
                  <div className="rounded-2xl bg-muted px-3.5 py-2 text-sm">
                    <div className="flex gap-1">
                      <div className="size-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
                      <div className="size-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
                      <div className="size-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-center gap-2 border-t border-border p-4"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Pergunte sobre ${moduleKey}...`}
                disabled={loading}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                {loading ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
