import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight, ChevronLeft, Plus, Building2, Users, Cog, Package, Truck, Boxes, Workflow, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { completeOnboarding, useStore, setOnboardingStep, addRecord, type ModuleRecord } from "@/lib/store";
import { EmpresaForm } from "@/components/empresa-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [{ title: "Onboarding — Industrial OS" }, { name: "description", content: "Configuração inicial rápida" }],
  }),
  component: Onboarding,
});

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  moduleKey: string;
  icon: any;
}

const steps: OnboardingStep[] = [
  {
    id: 0,
    title: "Empresa",
    description: "Cadastre a razão social e dados básicos da sua empresa",
    moduleKey: "empresa",
    icon: Building2,
  },
  {
    id: 1,
    title: "Setores",
    description: "Defina as áreas físicas da fábrica (galpões, linhas, estoque)",
    moduleKey: "setores",
    icon: Building2,
  },
  {
    id: 2,
    title: "Funcionários",
    description: "Cadastre colaboradores, turnos e funções",
    moduleKey: "funcionarios",
    icon: Users,
  },
  {
    id: 3,
    title: "Equipamentos",
    description: "Registre máquinas e ferramentas industriais",
    moduleKey: "equipamentos",
    icon: Cog,
  },
  {
    id: 4,
    title: "Matérias-Primas",
    description: "Cadastre espumas, tecidos e insumos",
    moduleKey: "materias-primas",
    icon: Package,
  },
  {
    id: 5,
    title: "Fornecedores",
    description: "Configure fornecedores e lead times",
    moduleKey: "fornecedores",
    icon: Truck,
  },
  {
    id: 6,
    title: "Produtos",
    description: "Defina o catálogo de colchões",
    moduleKey: "produtos",
    icon: Boxes,
  },
  {
    id: 7,
    title: "Processos",
    description: "Configure os roteiros de fabricação",
    moduleKey: "processos",
    icon: Workflow,
  },
  {
    id: 8,
    title: "Conclusão",
    description: "Resumo do cadastro inicial",
    moduleKey: "conclusao",
    icon: CheckCircle2,
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const onboardingProgress = useStore((s) => s.onboardingProgress);
  const [currentStep, setCurrentStep] = useState(onboardingProgress.currentStep);
  const [showForm, setShowForm] = useState(false);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const records = useStore((s) => s.records[step.moduleKey as keyof typeof s.records] || []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setOnboardingStep(currentStep + 1);
      setShowForm(false);
    } else {
      completeOnboarding();
      navigate({ to: "/" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setOnboardingStep(currentStep - 1);
      setShowForm(false);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setOnboardingStep(currentStep + 1);
      setShowForm(false);
    } else {
      completeOnboarding();
      navigate({ to: "/" });
    }
  };

  const handleAddNew = () => {
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  const handleGoToDashboard = () => {
    completeOnboarding();
    navigate({ to: "/" });
  };

  if (step.moduleKey === "conclusao") {
    return <ConclusionStep records={useStore((s) => s.records)} onGoToDashboard={handleGoToDashboard} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid-bg absolute inset-0 -z-10 opacity-30" />
      <header className="flex items-center justify-between p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-md bg-primary/15 ring-1 ring-primary/30">
            <Sparkles className="size-4 text-primary" />
          </div>
          <span className="text-sm font-semibold">Industrial OS</span>
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Sparkles className="size-3.5" /> Configuração Inicial
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Etapa {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="surface-elevated rounded-2xl p-6 md:p-8">
          <div className="mb-6 flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <step.icon className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight mb-2">{step.title}</h1>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>

          {showForm ? (
            <div className="mb-6">
              <StepForm step={step} onClose={handleFormClose} />
            </div>
          ) : (
            <>
              <Button onClick={handleAddNew} className="w-full gap-2 mb-6">
                <Plus className="size-4" /> Adicionar novo
              </Button>

              {records.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    <CheckCircle2 className="size-3.5" /> Registros cadastrados ({records.length})
                  </div>
                  <div className="space-y-2">
                    {records.slice(0, 5).map((record: ModuleRecord) => (
                      <div key={record.id} className="rounded-lg border border-border bg-muted/30 p-3 flex items-center justify-between">
                        <span className="text-sm font-medium">{record.name}</span>
                      </div>
                    ))}
                    {records.length > 5 && (
                      <div className="text-xs text-muted-foreground text-center">+ {records.length - 5} registros</div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
            <Button variant="ghost" onClick={handlePrevious} disabled={currentStep === 0} className="gap-2">
              <ChevronLeft className="size-4" /> Anterior
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSkip} className="gap-2">
                Pular
              </Button>
              <Button onClick={handleNext} className="gap-2">
                Próximo <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepForm({ step, onClose }: { step: OnboardingStep; onClose: () => void }) {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const setFormField = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleAddRecord = () => {
    if (formData.name && formData.name.trim()) {
      const meta: Record<string, string> = {};
      for (const [key, value] of Object.entries(formData)) {
        const strVal = value as string;
        if (key !== "name" && strVal && strVal.trim()) {
          meta[key] = strVal.trim();
        }
      }
      addRecord(step.moduleKey as any, formData.name.trim(), meta);
      setFormData({});
      onClose();
    }
  };

  // Use EmpresaForm for empresa step
  if (step.moduleKey === "empresa") {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10"
        >
          ✕
        </Button>
        <EmpresaForm mode={{ kind: "create" as const }} />
      </div>
    );
  }

  const getFields = () => {
    switch (step.moduleKey) {
      case "setores":
        return [
          { key: "name", label: "Nome do setor *", placeholder: "Ex.: Galpão A - Corte" },
          { key: "tipo", label: "Tipo", placeholder: "Produção / Estoque / Administrativo" },
          { key: "unidade", label: "Unidade", placeholder: "Matriz / Filial" },
          { key: "responsavel", label: "Responsável", placeholder: "Gerente do setor" },
        ];
      case "funcionarios":
        return [
          { key: "name", label: "Nome completo *", placeholder: "Ex.: João Silva" },
          { key: "cargo", label: "Cargo", placeholder: "Ex.: Operador CNC" },
          { key: "turno", label: "Turno", placeholder: "Manhã / Tarde / Noite" },
          { key: "setor", label: "Setor", placeholder: "Ex.: Galpão A" },
        ];
      case "equipamentos":
        return [
          { key: "name", label: "Nome do equipamento *", placeholder: "Ex.: Máquina de Espumação" },
          { key: "fabricante", label: "Fabricante", placeholder: "Ex.: MaxFoam" },
          { key: "modelo", label: "Modelo", placeholder: "Ex.: XF-2000" },
          { key: "capacidade", label: "Capacidade", placeholder: "Ex.: 150 kg/min" },
        ];
      case "materias-primas":
        return [
          { key: "name", label: "Nome da matéria-prima *", placeholder: "Ex.: Espuma D33" },
          { key: "categoria", label: "Categoria", placeholder: "Espuma / Tecido / Mola" },
          { key: "unidade", label: "Unidade de medida", placeholder: "kg / m / un" },
          { key: "fornecedor", label: "Fornecedor principal", placeholder: "Ex.: Espumas Brasil" },
        ];
      case "fornecedores":
        return [
          { key: "name", label: "Nome da empresa *", placeholder: "Ex.: Espumas Brasil Ltda" },
          { key: "cnpj", label: "CNPJ", placeholder: "00.000.000/0001-00" },
          { key: "contato", label: "Contato", placeholder: "Nome do contato" },
          { key: "telefone", label: "Telefone", placeholder: "(11) 99999-9999" },
        ];
      case "produtos":
        return [
          { key: "name", label: "Nome do produto *", placeholder: "Ex.: Colchão Premium King" },
          { key: "linha", label: "Linha", placeholder: "Premium / Básica" },
          { key: "tamanho", label: "Tamanho", placeholder: "Ex.: King / Queen / Solteiro" },
          { key: "categoria", label: "Categoria", placeholder: "Ex.: Box / Colchão" },
        ];
      case "processos":
        return [
          { key: "name", label: "Nome do processo *", placeholder: "Ex.: Montagem de Colchão" },
          { key: "descricao", label: "Descrição", placeholder: "Breve descrição do processo" },
          { key: "setor", label: "Setor", placeholder: "Ex.: Montagem" },
          { key: "tempo", label: "Tempo padrão (min)", placeholder: "Ex.: 45" },
        ];
      default:
        return [
          { key: "name", label: "Nome *", placeholder: "Nome do registro" },
        ];
    }
  };

  const fields = getFields();

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Plus className="size-3.5" /> Adicionar novo
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label className="text-xs">{field.label}</Label>
            <Input
              value={formData[field.key] || ""}
              onChange={(e) => setFormField(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        ))}
        <Button onClick={handleAddRecord} disabled={!formData.name || !formData.name.trim()} className="w-full gap-2">
          <Plus className="size-4" /> Adicionar
        </Button>
      </div>
    </div>
  );
}

function ConclusionStep({ records, onGoToDashboard }: { records: any; onGoToDashboard: () => void }) {
  const summary = [
    { label: "Empresa", count: records.empresa?.length || 0, key: "empresa" },
    { label: "Setores", count: records.setores?.length || 0, key: "setores" },
    { label: "Funcionários", count: records.funcionarios?.length || 0, key: "funcionarios" },
    { label: "Equipamentos", count: records.equipamentos?.length || 0, key: "equipamentos" },
    { label: "Matérias-Primas", count: records["materias-primas"]?.length || 0, key: "materias-primas" },
    { label: "Fornecedores", count: records.fornecedores?.length || 0, key: "fornecedores" },
    { label: "Produtos", count: records.produtos?.length || 0, key: "produtos" },
    { label: "Processos", count: records.processos?.length || 0, key: "processos" },
  ];

  const totalRecords = summary.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="grid-bg absolute inset-0 -z-10 opacity-30" />
      <header className="flex items-center justify-between p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-md bg-primary/15 ring-1 ring-primary/30">
            <Sparkles className="size-4 text-primary" />
          </div>
          <span className="text-sm font-semibold">Industrial OS</span>
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="surface-elevated rounded-2xl p-6 md:p-8 text-center">
          <div className="grid size-16 mx-auto mb-6 place-items-center rounded-full bg-green-500/10 ring-1 ring-green-500/30">
            <CheckCircle2 className="size-8 text-green-500" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Configuração Concluída!</h1>
          <p className="text-muted-foreground mb-8">Seu cadastro inicial foi concluído. Você poderá adicionar ou editar qualquer informação posteriormente.</p>

          <div className="grid gap-4 md:grid-cols-4 mb-8">
            {summary.map((item) => (
              <div key={item.key} className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="text-2xl font-semibold">{item.count}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 mb-8">
            <div className="text-sm font-medium">Total de registros: {totalRecords}</div>
          </div>

          <Button onClick={onGoToDashboard} size="lg" className="gap-2">
            Ir para o Dashboard <ArrowRight className="size-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
