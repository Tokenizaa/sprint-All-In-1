import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { LayoutDashboard, Rocket, Sparkles, Moon, Sun } from "lucide-react";
import { MODULES } from "@/lib/modules";
import { toggleTheme, useStore } from "@/lib/store";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    navigate({ to: path as never });
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar módulos, ações, registros…" />
      <CommandList>
        <CommandEmpty>Nenhum resultado.</CommandEmpty>
        <CommandGroup heading="Navegação">
          <CommandItem onSelect={() => go("/")}><LayoutDashboard /> Dashboard</CommandItem>
          <CommandItem onSelect={() => go("/implantacao")}><Rocket /> Centro de Implantação</CommandItem>
          <CommandItem onSelect={() => go("/copilot")}><Sparkles /> Industrial Copilot</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Módulos">
          {MODULES.map((m) => (
            <CommandItem key={m.key} onSelect={() => go(m.path)} value={`${m.title} ${m.group}`}>
              <m.icon /> {m.title}
              <span className="ml-auto text-xs text-muted-foreground">{m.group}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Aparência">
          <CommandItem onSelect={() => { toggleTheme(); setOpen(false); }}>
            {theme === "dark" ? <Sun /> : <Moon />} Alternar tema
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
