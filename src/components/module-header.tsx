import type { ReactNode } from "react";
import type { ModuleDef } from "@/lib/modules";

export function ModuleHeader({ mod, action }: { mod: ModuleDef; action?: ReactNode }) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <mod.icon className="size-3.5 shrink-0" /> <span className="truncate">{mod.group}</span>
        </div>
        <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">{mod.title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{mod.description}</p>
      </div>
      {action}
    </header>
  );
}
