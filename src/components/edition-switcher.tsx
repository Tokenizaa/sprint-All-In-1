import { Layers, Check, Rocket, TrendingUp, Sparkles } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore, setMaturityLevel } from "@/lib/store";
import { EDITIONS } from "@/lib/modules";
import type { MaturityLevel } from "@/lib/modules";

const ICONS: Record<MaturityLevel, typeof Rocket> = {
  starter: Rocket,
  growth: TrendingUp,
  mature: Sparkles,
};

export function EditionSwitcher() {
  const level = useStore((s) => s.maturityLevel);
  const current = EDITIONS[level];
  const Icon = ICONS[level];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-9">
          <Icon className="size-4 text-primary" />
          <span className="text-xs font-medium">Edição</span>
          <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">
            {current.label}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Layers className="size-4" /> Edição do Industrial OS
        </DropdownMenuLabel>
        <p className="px-2 pb-2 text-[11px] text-muted-foreground leading-snug">
          O sistema cresce com sua fábrica. Módulos ocultos continuam funcionando — apenas saem do menu.
        </p>
        <DropdownMenuSeparator />
        {(Object.keys(EDITIONS) as MaturityLevel[]).map((k) => {
          const ed = EDITIONS[k];
          const ItemIcon = ICONS[k];
          const active = k === level;
          return (
            <DropdownMenuItem
              key={k}
              onClick={() => setMaturityLevel(k)}
              className="flex items-start gap-3 py-2.5 cursor-pointer"
            >
              <ItemIcon className="size-4 mt-0.5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{ed.label}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{ed.tagline}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{ed.description}</p>
              </div>
              {active && <Check className="size-4 text-primary mt-0.5" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
