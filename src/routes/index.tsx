import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { StarterDashboard } from "@/components/starter-dashboard";
import { MODULES } from "@/lib/modules";
import { useStore, computeImplantation } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, Rocket, Sparkles, TrendingUp, Activity, Factory, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Industrial OS" },
      { name: "description", content: "Resumo industrial, evolução da implantação e próximas ações da sua fábrica." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const maturity = useStore((s) => s.maturityLevel);
  if (maturity === "starter") {
    return (
      <AppShell>
        <StarterDashboard />
      </AppShell>
    );
  }
  return <FullDashboard />;
}

function FullDashboard() {
  const records = useStore((s) => s.records);
  const companyName = useStore((s) => s.companyName);
  const stats = useMemo(() => computeImplantation({ records } as never), [records]);

  const pendings = MODULES
    .map((m) => ({ m, count: stats.perModule[m.key].count }))
    .filter((x) => x.count === 0)
    .slice(0, 6);

  const nextActions = MODULES
    .map((m) => ({ m, p: stats.perModule[m.key].progress, w: m.weight }))
    .filter((x) => x.p < 1)
    .sort((a, b) => b.w * (1 - b.p) - a.w * (1 - a.p))
    .slice(0, 4);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Hero */}
        <section className="surface-elevated relative overflow-hidden rounded-2xl p-6 md:p-8">
          <div className="grid-bg absolute inset-0 opacity-40" />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
                <Sparkles className="size-3.5" /> Industrial OS
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                {companyName ? `Olá, ${companyName}` : "Sua fábrica, em tempo real."}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Um sistema operacional industrial AI-First. Você acompanha a evolução da fábrica desde a implantação até a operação madura — sem ERP travado, sem tela vazia.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild><Link to="/implantacao"><Rocket className="size-4" /> Centro de Implantação</Link></Button>
                <Button asChild variant="ghost"><Link to="/copilot"><Sparkles className="size-4" /> Conversar com Copilot</Link></Button>
              </div>
            </div>
            <div className="w-full max-w-sm rounded-xl border border-border bg-card/60 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Implantação</span>
                <span className="font-mono text-2xl font-semibold text-primary">{stats.overall}%</span>
              </div>
              <Progress value={stats.overall} className="mt-3 h-2" />
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div><div className="font-mono text-base text-foreground">{stats.total}</div><div className="text-muted-foreground">registros</div></div>
                <div><div className="font-mono text-base text-foreground">{MODULES.length}</div><div className="text-muted-foreground">módulos</div></div>
                <div><div className="font-mono text-base text-foreground">{pendings.length}</div><div className="text-muted-foreground">pendentes</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* Stat cards */}
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard icon={Factory} label="Estrutura" value={countGroup(stats, "Estrutura")} hint="empresa + setores" />
          <StatCard icon={Activity} label="Recursos" value={countGroup(stats, "Recursos")} hint="pessoas + ativos" />
          <StatCard icon={ListChecks} label="Catálogo" value={countGroup(stats, "Catálogo")} hint="MP + produtos" />
          <StatCard icon={TrendingUp} label="Engenharia" value={countGroup(stats, "Engenharia")} hint="BOM + processos" />
        </section>

        {/* Implantation evolution */}
        <section className="surface-elevated rounded-2xl p-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold">Evolução da fábrica</h2>
              <p className="text-sm text-muted-foreground">Progresso por módulo — quanto mais completo, mais a fábrica respira dados.</p>
            </div>
            <Link to="/implantacao" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              Centro de Implantação <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {MODULES.map((m) => {
              const p = stats.perModule[m.key];
              const pct = Math.round(p.progress * 100);
              return (
                <Link key={m.key} to={m.path as never} className="group flex items-center gap-3 rounded-lg border border-border bg-card/40 p-3 transition hover:border-primary/40 hover:bg-card">
                  <div className="grid size-9 place-items-center rounded-md bg-primary/10 ring-1 ring-primary/20">
                    <m.icon className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{m.title}</span>
                      <span className="font-mono text-xs text-muted-foreground">{p.count} · {pct}%</span>
                    </div>
                    <Progress value={pct} className="mt-1.5 h-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Pendings + Next actions */}
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="surface-elevated rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Pendências</h2>
            <p className="text-sm text-muted-foreground">Módulos sem nenhum registro ainda.</p>
            <ul className="mt-4 space-y-2">
              {pendings.length === 0 && (
                <li className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success-foreground">
                  Tudo iniciado — siga refinando os módulos abaixo.
                </li>
              )}
              {pendings.map(({ m }) => (
                <li key={m.key}>
                  <Link to={m.path as never} className="flex items-center gap-3 rounded-lg border border-border p-3 transition hover:border-warning/40 hover:bg-warning/5">
                    <div className="grid size-8 place-items-center rounded-md bg-warning/15 ring-1 ring-warning/30">
                      <m.icon className="size-4 text-warning" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{m.title}</div>
                      <div className="truncate text-xs text-muted-foreground">{m.description}</div>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-elevated rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Próximas ações</h2>
            <p className="text-sm text-muted-foreground">Sugeridas pela priorização de impacto na implantação.</p>
            <ul className="mt-4 space-y-2">
              {nextActions.map(({ m }) => (
                <li key={m.key}>
                  <Link to={m.path as never} className="flex items-center gap-3 rounded-lg border border-border p-3 transition hover:border-primary/40 hover:bg-primary/5">
                    <div className="grid size-8 place-items-center rounded-md bg-primary/10 ring-1 ring-primary/20">
                      <m.icon className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{m.primaryCta}</div>
                      <div className="truncate text-xs text-muted-foreground">{m.benefit}</div>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
              {nextActions.length === 0 && (
                <li className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm">
                  Fábrica em operação madura. Avalie ativar módulos futuros: PCP, MRP, Qualidade.
                </li>
              )}
            </ul>
          </div>
        </section>

        {/* Future modules teaser */}
        <section className="rounded-2xl border border-dashed border-border p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Roadmap industrial</h2>
              <p className="text-sm text-muted-foreground">Estes módulos serão habilitados conforme sua fábrica amadurece — sem refatoração.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["PCP", "MRP", "Ordens de Produção", "Qualidade", "Manutenção", "Custos Industriais", "BI", "Industrial AI"].map((x) => (
                <span key={x} className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">{x}</span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: typeof Rocket; label: string; value: number; hint: string }) {
  return (
    <div className="surface-elevated rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="size-4 text-primary" />
      </div>
      <div className="mt-2 font-mono text-2xl">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function countGroup(stats: ReturnType<typeof computeImplantation>, group: string) {
  return MODULES.filter((m) => m.group === group).reduce((s, m) => s + stats.perModule[m.key].count, 0);
}
