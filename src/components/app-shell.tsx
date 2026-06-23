import type { ReactNode } from "react";
import { Search, Moon, Sun, Sparkles, Command as CommandIcon, LogOut, User as UserIcon } from "lucide-react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { CommandPalette } from "./command-palette";
import { OnboardingBanner } from "./onboarding-banner";
import { EditionSwitcher } from "./edition-switcher";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toggleTheme, useStore } from "@/lib/store";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export function AppShell({ children }: { children: ReactNode }) {
  const theme = useStore((s) => s.theme);
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.user_metadata?.full_name || user?.email || "U").slice(0, 2).toUpperCase();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-md">
          <SidebarTrigger className="size-8" />
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="group flex h-9 flex-1 max-w-md items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground transition hover:bg-muted"
          >
            <Search className="size-3.5" />
            <span>Buscar em toda fábrica…</span>
            <kbd className="ml-auto inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
              <CommandIcon className="size-2.5" />K
            </kbd>
          </button>
          <div className="ml-auto flex items-center gap-1">
            <EditionSwitcher />

            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link to="/copilot"><Sparkles className="size-4 text-primary" /> Copilot</Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 pl-2 pr-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{initials}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium truncate">{user.user_metadata?.full_name || user.email}</span>
                    <span className="text-[11px] font-normal text-muted-foreground truncate">{user.email}</span>
                    {roles.length > 0 && (
                      <span className="mt-1 inline-flex w-fit rounded bg-primary/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-primary">{roles.join(", ")}</span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="gap-2"><UserIcon className="size-4" /> Meu perfil</DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 text-destructive focus:text-destructive"
                    onClick={async () => { await signOut(); navigate({ to: "/auth", replace: true }); }}
                  >
                    <LogOut className="size-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
        <OnboardingBanner />
        <main className="min-h-[calc(100vh-3.5rem)] p-4 md:p-6">{children}</main>
      </SidebarInset>
      <CommandPalette />
    </SidebarProvider>
  );
}
