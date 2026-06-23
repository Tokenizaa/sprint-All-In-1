import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Rocket, Boxes, Package, ClipboardList, Factory, ShieldCheck, Search, PlayCircle, Truck, GitBranch, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStore, computeImplantation } from "@/lib/store";
import { MODULES, STARTER_MODULE_KEYS, EDITIONS } from "@/lib/modules";
import type { ModuleKey } from "@/lib/modules";
import { useMemo } from "react";

const STARTER_FLOW: { title: string; modules: ModuleKey[]; desc: string }[] = [
  { title: "Cadastros", modules: ["produtos", "materias-primas", "fornecedores"], desc: "O que vou fabricar e com quem comprar." },
  { title: "Planejamento", modules: ["bom", "ordens-producao"], desc: "O que preciso produzir hoje." },
  { title: "Operação", modules: ["apontamentos", "estoque-industrial"], desc: "O que está acontecendo no chão de fábrica." },
  { title: "Controle", modules: ["qualidade", "rastreabilidade"], desc: "O lote foi aprovado? Posso entregar?" },
];

export function StarterDashboard() {
  const records = useStore((s) => s.records);
  const companyName = useStore((s) => s.companyName);
  const stats = useMemo(() => computeImplantation({ records } as never), [records]);

  const opsCount = records["ordens-producao"]?.length ?? 0;
  const apontamentosHoje = records["apontamentos"]?.length ?? 0;
  const estoqueRegistros = records["estoque-industrial"]?.length ?? 0;
  const qualidadeRegistros = records["qualidade"]?.length ?? 0;

  // Heurística de "estoque crítico": registros cujo meta indica saldo baixo
  const estoqueCritico = (records["estoque-industrial"] ?? []).filter((r) => {
    const m = r.meta ?? {};
    const s = Number(m.saldo ?? m.quantidade ?? NaN);
    const min = Number(m.minimo ?? m.estoque_minimo ?? NaN);
    return Number.isFinite(s) && Number.isFinite(min) && s <= min;
  }).length;

  const starterModules = MODULES.filter((m) => STARTER_MODULE_KEYS.includes(m.key));
  const starterDone = starterModules.filter((m) => stats.perModule[m.key].count > 0).length;
  const starterPct = Math.round((starterDone / starterModules.length) * 100);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Hero — Starter Edition */}
      <section className="surface-elevated relative overflow-hidden rounded-2xl p-6 md:p-8">
        <div className="grid-bg absolute inset-0 opacity-40" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
              <Rocket className="size-3.5" /> Industrial OS · {EDITIONS.starter.label}
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              {companyName ? `Olá, ${companyName}` : "Vamos produzir o primeiro lote."}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Modo enxuto: só o essencial para fabricar, controlar qualidade e entregar. Conforme a fábrica amadurece, você libera PCP avançado, MRP, IA industrial e indicadores executivos.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild><Link to="/ordens-producao"><ClipboardList className="size-4" /> Ordens de Produção</Link></Button>
              <Button asChild variant="ghost"><Link to="/configuracoes-modulos"><ArrowUpRight className="size-4" /> Trocar edição</Link></Button>
            </div>
          </div>
          <div className="w-full max-w-sm rounded-xl border border-border bg-card/60 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Implantação Starter</span>
              <span className="font-mono text-2xl font-semibold text-primary">{starterPct}%</span>
            </div>
            <Progress value={starterPct} className="mt-3 h-2" />
            <p className="mt-2 text-[11px] text-muted-foreground">
              {starterDone} de {starterModules.length} módulos iniciados · {stats.total} registros
            </p>
          </div>
        </div>
      </section>

      {/* As 3 perguntas do dia */}
      <section className="grid gap-4 md:grid-cols-3">
        <DayCard
          icon={ClipboardList}
          title="O que devo produzir hoje?"
          value={opsCount}
          unit={opsCount === 1 ? "ordem aberta" : "ordens abertas"}
          empty="Nenhuma OP criada"
          to="/ordens-producao"
          cta={opsCount === 0 ? "Criar primeira OP" : "Ver produção"}
        />
        <DayCard
          icon={AlertTriangle}
          title="Estoque crítico?"
          value={estoqueCritico}
          unit={estoqueCritico === 1 ? "item abaixo do mínimo" : "itens abaixo do mínimo"}
          empty={`${estoqueRegistros} itens monitorados`}
          to="/estoque-industrial"
          cta="Abrir estoque"
          variant={estoqueCritico > 0 ? "warning" : "default"}
        />
        <DayCard
          icon={CheckCircle2}
          title="Posso entregar?"
          value={qualidadeRegistros}
          unit={qualidadeRegistros === 1 ? "inspeção registrada" : "inspeções registradas"}
          empty="Sem inspeções ainda"
          to="/qualidade"
          cta="Abrir qualidade"
        />
      </section>

      {/* Fluxo Starter */}
      <section className="surface-elevated rounded-2xl p-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">Fluxo do primeiro lote</h2>
            <p className="text-sm text-muted-foreground">Caminho mínimo para sair do zero até a entrega — sem PCP avançado, sem MRP, sem distração.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STARTER_FLOW.map((stage, idx) => (
            <div key={stage.title} className="rounded-xl border border-border bg-card/40 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <span className="font-mono">{String(idx + 1).padStart(2, "0")}</span>
                <span>{stage.title}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-snug">{stage.desc}</p>
              <div className="mt-3 space-y-1.5">
                {stage.modules.map((k) => {
                  const m = MODULES.find((mm) => mm.key === k);
                  if (!m) return null;
                  const count = stats.perModule[k].count;
                  const done = count > 0;
                  return (
                    <Link
                      key={k}
                      to={m.path as never}
                      className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-sm transition hover:border-primary/30 hover:bg-primary/5"
                    >
                      <m.icon className={`size-4 ${done ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="flex-1 truncate">{m.title}</span>
                      {done ? (
                        <span className="font-mono text-[10px] text-primary">{count}</span>
                      ) : (
                        <span className="font-mono text-[10px] text-muted-foreground">—</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Próximas ações Starter */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="surface-elevated rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Pendências do Starter</h2>
          <p className="text-sm text-muted-foreground">Módulos essenciais ainda sem registros.</p>
          <ul className="mt-4 space-y-2">
            {starterModules.filter((m) => stats.perModule[m.key].count === 0).slice(0, 6).map((m) => (
              <li key={m.key}>
                <Link to={m.path as never} className="flex items-center gap-3 rounded-lg border border-border p-3 transition hover:border-warning/40 hover:bg-warning/5">
                  <div className="grid size-8 place-items-center rounded-md bg-warning/15 ring-1 ring-warning/30">
                    <m.icon className="size-4 text-warning" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{m.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{m.primaryCta}</div>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
            {starterModules.every((m) => stats.perModule[m.key].count > 0) && (
              <li className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm">
                Starter completo. Considere avançar para a edição <strong>Growth</strong>.
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-dashed border-border p-6">
          <h2 className="text-base font-semibold">O que está oculto agora</h2>
          <p className="text-sm text-muted-foreground">
            Estes módulos continuam disponíveis, apenas saem do menu até a fábrica amadurecer.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["PCP avançado", "MRP", "Capacidade & simulações", "Cronometragem", "Tempo real", "Copilot industrial", "OEE & BI"].map((x) => (
              <span key={x} className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">{x}</span>
            ))}
          </div>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/configuracoes-modulos">Configurar edição & módulos <ArrowUpRight className="size-3.5 ml-1" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function DayCard({
  icon: Icon, title, value, unit, empty, to, cta, variant = "default",
}: {
  icon: typeof Rocket; title: string; value: number; unit: string;
  empty: string; to: string; cta: string; variant?: "default" | "warning";
}) {
  const tone = variant === "warning" && value > 0
    ? "border-warning/40 bg-warning/5"
    : "border-border bg-card/40";
  const iconTone = variant === "warning" && value > 0 ? "text-warning" : "text-primary";
  return (
    <Link to={to as never} className={`group surface-elevated rounded-2xl p-5 border ${tone} transition hover:border-primary/40`}>
      <div className="flex items-start justify-between">
        <Icon className={`size-5 ${iconTone}`} />
        <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="mt-3 text-sm font-medium">{title}</div>
      {value > 0 ? (
        <div className="mt-1">
          <div className="font-mono text-3xl">{value}</div>
          <div className="text-xs text-muted-foreground">{unit}</div>
        </div>
      ) : (
        <div className="mt-1">
          <div className="text-xs text-muted-foreground">{empty}</div>
          <div className="mt-2 text-xs text-primary">{cta} →</div>
        </div>
      )}
    </Link>
  );
}
