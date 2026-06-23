import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BarChart3, Play, Pause, AlertCircle, TrendingUp, TrendingDown, Clock, Users, Cog, Package, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ModuleHeader } from "@/components/module-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { IndustrialAgent } from "@/components/industrial-copilot";
import { MODULES } from "@/lib/modules";
import { useStore } from "@/lib/store";

const mod = MODULES.find((m) => m.key === "producao-tempo-real")!;

export const Route = createFileRoute("/producao-tempo-real")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

function Page() {
  const ops = useStore((s) => s.records["ordens-producao"] || []);
  const apontamentos = useStore((s) => s.records["apontamentos"] || []);
  const equipamentos = useStore((s) => s.records["equipamentos"] || []);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const opsEmAndamento = ops.filter((op) => op.meta.status === "em_producao" || op.meta.status === "liberada");
  const opsFinalizadas = ops.filter((op) => op.meta.status === "finalizada");
  const opsPausadas = ops.filter((op) => op.meta.status === "pausada");

  const totalProduzido = apontamentos.reduce((sum, a) => sum + (parseFloat(a.meta.quantidade_produzida as string) || 0), 0);
  const totalRefugo = apontamentos.reduce((sum, a) => sum + (parseFloat(a.meta.refugo as string) || 0), 0);
  const eficiencia = totalProduzido > 0 ? ((totalProduzido - totalRefugo) / totalProduzido * 100).toFixed(1) : "0";

  // Derive machine status from real apontamentos
  const maquinas = equipamentos.length > 0 ? equipamentos.map((eq) => {
    const eqApontamentos = apontamentos.filter((a) => a.meta.equipamento === eq.name);
    const latestApontamento = eqApontamentos.length > 0 ? eqApontamentos[eqApontamentos.length - 1] : null;
    
    let status = "parada";
    let op = null;
    let motivo = "";
    let eficiencia = 0;

    if (latestApontamento) {
      const horaFim = latestApontamento.meta.hora_fim as string;
      if (!horaFim) {
        status = "produzindo";
        op = latestApontamento.meta.op as string;
        // Calculate efficiency from this apontamento
        const produzido = parseFloat(latestApontamento.meta.quantidade_produzida as string) || 0;
        const refugo = parseFloat(latestApontamento.meta.refugo as string) || 0;
        eficiencia = produzido > 0 ? ((produzido - refugo) / produzido * 100) : 0;
      } else {
        motivo = latestApontamento.meta.motivo_parada as string || "Aguardando";
      }
    }

    return {
      nome: eq.name,
      status,
      op,
      motivo,
      eficiencia: Math.round(eficiencia),
    };
  }) : [
    // Fallback to mock data if no equipment registered
    { nome: "MaxFoam XF-2000", status: "produzindo", op: opsEmAndamento[0]?.meta.numero || null, eficiencia: 92 },
    { nome: "Brother PR670E", status: "parada", op: null, motivo: "Manutenção", eficiencia: 0 },
    { nome: "Juki DDL-8700", status: "produzindo", op: opsEmAndamento[0]?.meta.numero || null, eficiencia: 88 },
    { nome: "Cortadora Laser", status: "produzindo", op: opsEmAndamento[1]?.meta.numero || null, eficiencia: 95 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "produzindo": return "bg-green-500";
      case "parada": return "bg-red-500";
      case "setup": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <ModuleHeader mod={mod} />

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Atualizado em {currentTime.toLocaleTimeString('pt-BR')}
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <BarChart3 className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OPs em Andamento</CardTitle>
            <Play className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opsEmAndamento.length}</div>
            <p className="text-xs text-muted-foreground">
              {opsPausadas.length} pausadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produção do Dia</CardTitle>
            <Package className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProduzido}</div>
            <p className="text-xs text-muted-foreground">
              {totalRefugo} refugo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eficiencia}%</div>
            <p className="text-xs text-muted-foreground">
              {parseFloat(eficiencia) >= 90 ? "Excelente" : parseFloat(eficiencia) >= 80 ? "Bom" : "Atenção"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Máquinas Ativas</CardTitle>
            <Cog className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maquinas.filter(m => m.status === "produzindo").length}</div>
            <p className="text-xs text-muted-foreground">
              de {maquinas.length} totais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* OPs em Andamento */}
      <Card>
        <CardHeader>
          <CardTitle>OPs em Andamento</CardTitle>
          <CardDescription>Ordens de produção ativas na fábrica</CardDescription>
        </CardHeader>
        <CardContent>
          {opsEmAndamento.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Pause className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma OP em andamento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {opsEmAndamento.map((op) => {
                const opApontamentos = apontamentos.filter((a) => a.meta.op === op.meta.numero);
                const opProduzido = opApontamentos.reduce((sum, a) => sum + (parseFloat(a.meta.quantidade_produzida as string) || 0), 0);
                const opQuantidade = parseFloat(op.meta.quantidade as string) || 1;
                const progresso = (opProduzido / opQuantidade * 100).toFixed(0);

                return (
                  <div key={op.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="default" className="bg-blue-500">{op.meta.status as string}</Badge>
                        <h3 className="font-semibold">{op.meta.numero as string}</h3>
                        <span className="text-sm text-muted-foreground">{op.meta.produto as string}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Previsão: {op.meta.data_previsao as string}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span className="font-medium">{opProduzido} / {opQuantidade} un ({progresso}%)</span>
                      </div>
                      <Progress value={parseFloat(progresso)} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Prioridade:</span>
                        <p className="font-medium capitalize">{op.meta.prioridade as string}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Responsável:</span>
                        <p className="font-medium">{op.meta.responsavel as string}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Início:</span>
                        <p className="font-medium">{op.meta.data_inicio as string}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status das Máquinas */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Máquinas</CardTitle>
          <CardDescription>Visibilidade em tempo real dos equipamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maquinas.map((maquina, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(maquina.status)}`} />
                    <h3 className="font-semibold">{maquina.nome}</h3>
                  </div>
                  <Badge variant={maquina.status === "produzindo" ? "default" : "destructive"}>
                    {maquina.status === "produzindo" ? "Produzindo" : "Parada"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">OP Atual:</span>
                    <p className="font-medium">{maquina.op || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Eficiência:</span>
                    <p className="font-medium">{maquina.eficiencia}%</p>
                  </div>
                </div>
                {maquina.motivo && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Motivo:</span>
                    <p className="text-red-600 font-medium">{maquina.motivo}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Próximas OPs */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas OPs</CardTitle>
          <CardDescription>Ordens planejadas para iniciar</CardDescription>
        </CardHeader>
        <CardContent>
          {ops.filter((op) => op.meta.status === "planejada").length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma OP planejada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ops.filter((op) => op.meta.status === "planejada").slice(0, 5).map((op) => (
                <div key={op.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{op.meta.numero as string}</Badge>
                    <span className="font-medium">{op.meta.produto as string}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {op.meta.quantidade as string} un • {op.meta.data_previsao as string}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <IndustrialAgent moduleKey="producao-tempo-real" />
    </div>
  );
}
