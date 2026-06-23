import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Sparkles, Rocket, Settings2, ChevronRight, Cog, Presentation } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { MODULES, MODULE_GROUPS, type MaturityLevel } from "@/lib/modules";
import { useStore, computeImplantation, getMaturityLevel, isModuleVisibleInMenu } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useEffect, useMemo } from "react";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (p: string) => pathname === p || (p !== "/" && pathname.startsWith(p));

  // Use shallow selector to avoid re-renders on unrelated state changes
  const records = useStore((s) => s.records);
  const currentMaturityLevel = useStore((s) => s.maturityLevel);
  const moduleConfigurations = useStore((s) => s.moduleConfigurations);
  
  // Compute stats using useMemo to prevent unnecessary recalculations
  const stats = useMemo(() => computeImplantation({ records } as never), [records]);

  // Filter modules based on maturity level and visibility in menu
  const maturityOrder: MaturityLevel[] = ["starter", "growth", "mature"];
  const currentLevelIndex = maturityOrder.indexOf(currentMaturityLevel);
  const visibleModules = useMemo(() => {
    return MODULES.filter((m) => {
      const moduleLevelIndex = maturityOrder.indexOf(m.maturity);
      const maturityMatch = moduleLevelIndex <= currentLevelIndex;
      const isVisible = moduleConfigurations[m.key] ?? true;
      return maturityMatch && isVisible;
    });
  }, [currentMaturityLevel, moduleConfigurations]);

  // State for collapsible groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Estrutura": false,
    "Recursos": false,
    "Catálogo": false,
    "Engenharia": false,
    "Operações": false,
  });

  // Auto-open group when a page in that group is active
  useEffect(() => {
    const activeModule = visibleModules.find((m) => isActive(m.path));
    if (activeModule) {
      setOpenGroups((prev) => ({ ...prev, [activeModule.group]: true }));
    }
  }, [pathname, visibleModules]);

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="grid size-8 place-items-center rounded-md bg-primary/15 ring-1 ring-primary/30">
            <Sparkles className="size-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">Industrial OS</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">AI-First Platform</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link to="/"><LayoutDashboard /> <span>Dashboard</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/implantacao")}>
                  <Link to="/implantacao"><Rocket /> <span>Implantação</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/copilot")}>
                  <Link to="/copilot"><Sparkles /> <span>Copilot</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {MODULE_GROUPS.map((group) => {
          const groupModules = visibleModules.filter((m) => m.group === group);
          if (groupModules.length === 0) return null;

          return (
            <SidebarGroup key={group}>
              <Collapsible
                open={openGroups[group]}
                onOpenChange={() => toggleGroup(group)}
                className="group/collapsible"
              >
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 transition-colors">
                    <span className="flex-1">{group}</span>
                    <ChevronRight className={`ml-auto size-4 transition-transform duration-200 ${openGroups[group] ? 'rotate-90' : ''}`} />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {groupModules.map((m) => {
                        const count = stats.perModule[m.key].count;
                        return (
                          <SidebarMenuItem key={m.key}>
                            <SidebarMenuButton asChild isActive={isActive(m.path)} tooltip={m.title}>
                              <Link to={m.path as never}>
                                <m.icon />
                                <span>{m.title}</span>
                                {!collapsed && count > 0 && (
                                  <span className="ml-auto rounded bg-sidebar-accent px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                    {count}
                                  </span>
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          );
        })}

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/configuracoes-modulos")}>
                  <Link to="/configuracoes-modulos"><Cog /> <span>Configurações</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed ? (
          <Link to="/implantacao" className="group block rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3 transition hover:bg-sidebar-accent">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Implantação</span>
              <span className="font-mono text-primary">{stats.overall}%</span>
            </div>
            <Progress value={stats.overall} className="mt-2 h-1.5" />
            <p className="mt-2 text-[10px] leading-tight text-muted-foreground">
              {stats.total} registros · evolua sua fábrica
            </p>
          </Link>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Configurações">
                <Link to="/implantacao"><Settings2 /></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
