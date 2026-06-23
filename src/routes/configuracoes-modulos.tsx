import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore, store, setMaturityLevel } from "@/lib/store";
import { MODULES, type ModuleKey, type MaturityLevel, EDITIONS } from "@/lib/modules";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Eye, EyeOff, Info } from "lucide-react";

export const Route = createFileRoute("/configuracoes-modulos")({
  component: ConfiguracoesModulos,
});

function toggleModuleVisibility(moduleKey: ModuleKey, visible: boolean) {
  store.set((s) => ({
    ...s,
    moduleConfigurations: { ...s.moduleConfigurations, [moduleKey]: visible },
  }));
}

function ConfiguracoesModulos() {
  const moduleConfigurations = useStore((s) => s.moduleConfigurations);
  const currentMaturity = useStore((s) => s.maturityLevel);

  const handleToggleModule = (moduleKey: ModuleKey, visible: boolean) => {
    toggleModuleVisibility(moduleKey, visible);
  };

  const handleMaturityChange = (level: MaturityLevel) => {
    setMaturityLevel(level);
  };


  const groupedModules = MODULES.reduce((acc, module) => {
    if (!acc[module.group]) {
      acc[module.group] = [];
    }
    acc[module.group].push(module);
    return acc;
  }, {} as Record<string, typeof MODULES>);

  const maturityLevels: { value: MaturityLevel; label: string; description: string }[] = [
    { value: "starter", label: "Starter", description: "Módulos essenciais para o primeiro lote" },
    { value: "growth", label: "Growth", description: "Módulos para estabilização e estruturação" },
    { value: "mature", label: "Mature", description: "Módulos avançados para maturidade completa" },
  ];

  return (
    <AppShell>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configurações de Módulos</h1>
          <p className="text-muted-foreground">
            Habilite ou desabilite módulos individualmente conforme a necessidade da sua fábrica
          </p>
        </div>

        <Tabs defaultValue="modulos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="modulos">Módulos</TabsTrigger>
            <TabsTrigger value="maturidade">Nível de Maturidade</TabsTrigger>
          </TabsList>

          <TabsContent value="modulos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visibilidade de Módulos no Menu</CardTitle>
                <CardDescription>
                  Mostre ou oculte módulos no menu lateral. Todos os módulos continuam funcionando normalmente, apenas a visibilidade no menu é controlada.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {Object.entries(groupedModules).map(([group, modules]) => (
                    <div key={group}>
                      <h3 className="text-lg font-semibold mb-4">{group}</h3>
                      <div className="grid gap-4">
                        {modules.map((module) => {
                          const isVisible = moduleConfigurations[module.key] ?? true;

                          return (
                            <div
                              key={module.key}
                              className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-medium">{module.title}</h4>
                                  <Badge variant={module.maturity === "starter" ? "default" : module.maturity === "growth" ? "secondary" : "outline"}>
                                    {module.maturity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  Benefício: {module.benefit}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                {isVisible ? (
                                  <Eye className="h-5 w-5 text-primary" />
                                ) : (
                                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                                )}
                                <Switch
                                  checked={isVisible}
                                  onCheckedChange={(checked) => handleToggleModule(module.key, checked)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maturidade" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nível de Maturidade da Fábrica</CardTitle>
                <CardDescription>
                  Defina o nível de maturidade atual da sua fábrica para filtrar os módulos disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {maturityLevels.map((level) => (
                    <div
                      key={level.value}
                      className={`p-6 border rounded-lg cursor-pointer transition-colors ${
                        currentMaturity === level.value
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleMaturityChange(level.value)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold mb-2">{level.label}</h4>
                          <p className="text-sm text-muted-foreground">{level.description}</p>
                        </div>
                        {currentMaturity === level.value && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Resumo por Nível</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Starter:</span>
                      <span>{MODULES.filter((m) => m.maturity === "starter").length} módulos</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Growth:</span>
                      <span>{MODULES.filter((m) => m.maturity === "growth").length} módulos</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mature:</span>
                      <span>{MODULES.filter((m) => m.maturity === "mature").length} módulos</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
