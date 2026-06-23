import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

interface TenantContextType {
  tenantId: string;
  companyId: string;
  userId: string;
  loading: boolean;
  error: string | null;
}

const DEFAULT_FALLBACK_ID = '00000000-0000-0000-0000-000000000000';

const TenantContext = createContext<TenantContextType>({
  tenantId: DEFAULT_FALLBACK_ID,
  companyId: DEFAULT_FALLBACK_ID,
  userId: DEFAULT_FALLBACK_ID,
  loading: true,
  error: null,
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tenantId, setTenantId] = useState<string>(DEFAULT_FALLBACK_ID);
  const [companyId, setCompanyId] = useState<string>(DEFAULT_FALLBACK_ID);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTenant() {
      if (!user) {
        setTenantId(DEFAULT_FALLBACK_ID);
        setCompanyId(DEFAULT_FALLBACK_ID);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Para MVP, vamos pegar a primeira empresa (matriz) como tenant
        const { data, error } = await supabase
          .schema('industrial')
          .from('empresa')
          .select('id')
          .eq('tipo', 'Matriz')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setTenantId(data.id);
          setCompanyId(data.id);
        } else {
          // Se não houver matriz, pega qualquer empresa
          const { data: anyEmpresa, error: anyError } = await supabase
            .schema('industrial')
            .from('empresa')
            .select('id')
            .limit(1)
            .single();
            
          if (!anyError && anyEmpresa) {
            setTenantId(anyEmpresa.id);
            setCompanyId(anyEmpresa.id);
          } else {
            // Se ainda não houver empresa (ex: recém deployado), usamos um UUID placeholder
            // que será substituído quando o seed rodar
            setTenantId(DEFAULT_FALLBACK_ID);
            setCompanyId(DEFAULT_FALLBACK_ID);
          }
        }
      } catch (err: any) {
        console.error('Erro ao carregar Tenant:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTenant();
  }, [user]);

  return (
    <TenantContext.Provider value={{ 
      tenantId, 
      companyId, 
      userId: user?.id || DEFAULT_FALLBACK_ID, 
      loading, 
      error 
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
