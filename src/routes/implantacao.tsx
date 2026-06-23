import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { MODULES, MODULE_GROUPS } from "@/lib/modules";
import { useStore, computeImplantation, seedAll, cleanupAll } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import {
  Rocket,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  Database,
  Trash2,
  Sparkles,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/implantacao")({
  head: () => ({ meta: [{ title: "Centro de Implantação — Industrial OS" }] }),
  component: Implantation,
});

function Implantation() {
  const records = useStore((s) => s.records);
  const stats = useMemo(() => computeImplantation({ records } as never), [records]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const handleSeedAll = async () => {
    setIsDeploying(true);
    try {
      const result = await seedAll();
      toast.success("Banco de dados populado com sucesso!", {
        description: `${result.totalRecords} registros inseridos no Supabase. Copilot, KPIs e Analytics atualizados.`,
      });
    } catch (error) {
      toast.error("Erro ao popular banco de dados", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCleanupAll = async () => {
    setIsCleaning(true);
    try {
      const result = await cleanupAll();
      toast.success("Dados de implantação removidos com sucesso!", {
        description: `${result.removedRecords} registros removidos do Supabase. Dados reais protegidos.`,
      });
    } catch (error) {
      toast.error("Erro ao remover dados de implantação", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde",
      });
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="surface-elevated relative overflow-hidden rounded-2xl p-6 md:p-8">
          <div className="grid-bg absolute inset-0 opacity-40" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
                <Rocket className="size-3.5" /> Centro de Implantação
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Da implantação à fábrica madura.
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Acompanhe a evolução por módulo. Cada cadastro deixa a fábrica mais inteligente e
                desbloqueia capacidade, custos e — em breve — agentes especializados.
              </p>
            </div>
            <div className="w-full max-w-xs rounded-xl border border-border bg-card/60 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Progresso geral
                </span>
                <span className="font-mono text-3xl font-semibold text-primary">
                  {stats.overall}%
                </span>
              </div>
              <Progress value={stats.overall} className="mt-3 h-2" />
            </div>
          </div>
        </header>

        {MODULE_GROUPS.map((group) => (
          <section key={group}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {MODULES.filter((m) => m.group === group).map((m) => {
                const p = stats.perModule[m.key];
                const pct = Math.round(p.progress * 100);
                const done = pct >= 100;
                return (
                  <Link
                    key={m.key}
                    to={m.path as never}
                    className="surface-elevated group block rounded-xl p-4 transition hover:border-primary/40"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                        <m.icon className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate font-medium">{m.title}</h3>
                          <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                            {done ? (
                              <CheckCircle2 className="size-3.5 text-success" />
                            ) : (
                              <Circle className="size-3.5" />
                            )}
                            {pct}%
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {m.description}
                        </p>
                        <Progress value={pct} className="mt-3 h-1" />
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{p.count} registros</span>
                          <span className="inline-flex items-center gap-1 text-primary opacity-0 transition group-hover:opacity-100">
                            Abrir <ArrowUpRight className="size-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

      </div>

      {/* Painel Sandbox de Testes / Ferramentas do Desenvolvedor */}
      <section className="rounded-2xl border border-dashed border-border bg-card/20 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Database className="size-4" /> Ambiente Sandbox / Testes
            </div>
            <h3 className="text-lg font-semibold">Provisionamento de Banco de Dados</h3>
            <p className="text-sm text-muted-foreground">
              Deploy de seeds para o Supabase (fonte oficial). Os dados ficam disponíveis para
              Copilot, KPIs, Analytics, PCP, MRP e todos os sistemas da plataforma.
              <br />
              <span className="text-warning">Safe cleanup remove apenas registros gerados pelo seed.</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="outline"
              onClick={handleSeedAll}
              disabled={isDeploying}
              className="gap-2 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="size-4 text-primary animate-spin" /> Deployando...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 text-primary" /> Deploy Seed (Supabase)
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCleanupAll}
              disabled={isCleaning}
              className="gap-2 cursor-pointer hover:bg-destructive/20 transition-colors"
            >
              {isCleaning ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Limpando...
                </>
              ) : (
                <>
                  <Trash2 className="size-4" /> Remover Seed (Safe)
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
