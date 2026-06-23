import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { industrialCopilotCore, CopilotContext } from '@/services/IndustrialCopilotCore';
import { useTenant } from './TenantProvider';

interface CopilotContextProviderProps {
  children: ReactNode;
}

const CopilotContextContext = createContext<{
  context: CopilotContext;
  setContext: (context: Partial<CopilotContext>) => void;
}>({
  context: {},
  setContext: () => {},
});

export function CopilotContextProvider({ children }: CopilotContextProviderProps) {
  const location = useLocation();
  const [context, setContextState] = useState<CopilotContext>({});
  const { tenantId, companyId, userId } = useTenant();

  // Detectar módulo automaticamente baseado na rota
  useEffect(() => {
    const path = location.pathname;
    let module: CopilotContext['module'] = undefined;
    let page: string = path;

    // Mapeamento de rotas para módulos
    if (path.includes('/ordens-producao') || path.includes('/producao') || path.includes('/pcp')) {
      module = 'production';
    } else if (path.includes('/materias-primas') || path.includes('/estoque') || path.includes('/inventario')) {
      module = 'inventory';
    } else if (path.includes('/qualidade') || path.includes('/refugo') || path.includes('/inspecao')) {
      module = 'quality';
    } else if (path.includes('/custos') || path.includes('/financeiro') || path.includes('/lucratividade')) {
      module = 'financial';
    } else if (path.includes('/fornecedores') || path.includes('/compras') || path.includes('/pedidos')) {
      module = 'supplier';
    } else if (path.includes('/mrp') || path.includes('/planejamento')) {
      module = 'pcp';
    }

    const DEFAULT_FALLBACK_ID = '00000000-0000-0000-0000-000000000000';

    // Atualizar contexto do Copilot Core
    const newContext: CopilotContext = {
      module,
      page,
      tenantId: tenantId || DEFAULT_FALLBACK_ID,
      companyId: companyId || DEFAULT_FALLBACK_ID,
      userId: userId || DEFAULT_FALLBACK_ID,
    };

    setContextState(newContext);
    industrialCopilotCore.setContext(newContext);
  }, [location.pathname, tenantId, companyId, userId]);

  const setContext = (newContext: Partial<CopilotContext>) => {
    const updatedContext = { ...context, ...newContext };
    setContextState(updatedContext);
    industrialCopilotCore.setContext(updatedContext);
  };

  return (
    <CopilotContextContext.Provider value={{ context, setContext }}>
      {children}
    </CopilotContextContext.Provider>
  );
}

export function useCopilotContext() {
  return useContext(CopilotContextContext);
}
