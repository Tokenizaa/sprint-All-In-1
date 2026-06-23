import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (import.meta as any).env?.SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = (import.meta as any).env?.SUPABASE_SERVICE_ROLE_KEY;

// Create a robust Proxy-based mock query builder that swallows any chained queries
// and resolves to a safe mock response.
function makeMockQueryBuilder(): any {
  const createProxy = (): any => {
    const fn = () => {
      return proxyInstance;
    };
    
    const proxyInstance = new Proxy(fn, {
      get(target, prop) {
        if (prop === 'then') {
          return (onfulfilled?: any) => {
            return Promise.resolve({ data: [], error: null }).then(onfulfilled);
          };
        }
        if (prop === 'single') {
          return () => Promise.resolve({ data: null, error: null });
        }
        return proxyInstance;
      }
    });
    
    return proxyInstance;
  };
  
  return createProxy();
}

// Create a robust Proxy-based mock Supabase client
function makeMockSupabase(): any {
  const mockClient: any = () => mockClient;
  const handler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          getUser: async () => ({ data: { user: null }, error: null }),
          signInWithPassword: async () => ({ data: {}, error: null }),
          signUp: async () => ({ data: {}, error: null }),
          signOut: async () => ({ error: null }),
        };
      }
      if (prop === 'channel') {
        return () => ({
          on: function() { return this; },
          subscribe: () => ({ unsubscribe: () => {} }),
        });
      }
      if (prop === 'schema') {
        return () => ({
          from: () => makeMockQueryBuilder(),
        });
      }
      if (prop === 'from') {
        return () => makeMockQueryBuilder();
      }
      return mockClient;
    }
  };
  return new Proxy(mockClient, handler);
}

let supabaseClient: any;
let supabaseAdminClient: any;
let supabaseIndustrialClient: any;

const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase credentials are not configured. Running in local/offline fallback mode.'
  );
  supabaseClient = makeMockSupabase();
  supabaseAdminClient = makeMockSupabase();
  supabaseIndustrialClient = makeMockSupabase();
} else {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'industrial-os-auth',
      },
    });

    supabaseAdminClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey || supabaseAnonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    supabaseIndustrialClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey || supabaseAnonKey,
      {
        db: {
          schema: 'industrial',
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  } catch (err) {
    console.error('Failed to initialize real Supabase client, falling back to mock:', err);
    supabaseClient = makeMockSupabase();
    supabaseAdminClient = makeMockSupabase();
    supabaseIndustrialClient = makeMockSupabase();
  }
}

export const supabase = supabaseClient;
export const supabaseAdmin = supabaseAdminClient;
export const supabaseIndustrial = supabaseIndustrialClient;

// Helper function to handle errors
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  throw error;
}

