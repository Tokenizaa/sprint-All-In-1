import type { LucideIcon } from "lucide-react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  benefit: string;
  checklist: string[];
  primaryCta: string;
  onPrimary?: () => void;
  secondaryCta?: string;
  onSecondary?: () => void;
}

export function EmptyState({
  icon: Icon, title, description, benefit, checklist, primaryCta, onPrimary, secondaryCta, onSecondary,
}: Props) {
  return (
    <div className="surface-elevated relative overflow-hidden rounded-2xl p-6 md:p-10">
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div className="max-w-xl space-y-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
            <Icon className="size-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" /> Por que importa
            </div>
            <p className="text-muted-foreground">{benefit}</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={onPrimary}>{primaryCta}</Button>
            {secondaryCta && (
              <Button variant="ghost" onClick={onSecondary}>{secondaryCta}</Button>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/60 p-4 md:w-72">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Checklist inicial</div>
          <ul className="space-y-2">
            {checklist.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 grid size-4 place-items-center rounded-full border border-border bg-background">
                  <Check className="size-2.5 text-muted-foreground" />
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
