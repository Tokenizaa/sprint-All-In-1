import { useSyncExternalStore } from "react";
import { MODULES, TOTAL_WEIGHT, type ModuleKey, type MaturityLevel } from "./modules";
import { seedAllRecords as seedAllRecordsImport, companyName as companyNameImport } from "./seeds/index";
import { supabase } from "./supabase";
import { moduleConfigurationService } from "@/services/ModuleConfigurationService";
import { seedDeploymentManager } from "@/services/SeedDeploymentManager";

export interface ModuleRecord {
  id: string;
  name: string;
  meta?: Record<string, any>;
  createdAt: number;
  // AI-First: Fields for AI agent consumption
  version?: number;
  auditTrail?: Array<{
    timestamp: number;
    action: 'create' | 'update' | 'delete';
    userId?: string;
    changes?: Record<string, any>;
  }>;
  embedding?: number[]; // For semantic search by AI agents
  tags?: string[]; // For AI categorization
}

export interface AppState {
  onboardingCompleted: boolean;
  onboardingSkipped: boolean;
  companyName: string;
  records: Record<ModuleKey, ModuleRecord[]>;
  theme: "dark" | "light";
  onboardingProgress: {
    currentStep: number;
    completedSteps: number[];
    skippedSteps: number[];
    lastStepTimestamp: number;
  };
  maturityLevel: MaturityLevel;
  moduleConfigurations: Record<ModuleKey, boolean>; // true = visível no menu
}

const STORAGE_KEY = "industrial-os:v1";

const cachedDefaultState = (() => {
  const records = {} as Record<ModuleKey, ModuleRecord[]>;
  const moduleConfigurations = {} as Record<ModuleKey, boolean>;
  for (const m of MODULES) {
    records[m.key] = [];
    moduleConfigurations[m.key] = true; // Default: all modules visible in menu
  }
  return {
    onboardingCompleted: false,
    onboardingSkipped: false,
    companyName: "",
    records,
    theme: "dark" as const,
    onboardingProgress: {
      currentStep: 0,
      completedSteps: [],
      skippedSteps: [],
      lastStepTimestamp: 0,
    },
    maturityLevel: "starter" as MaturityLevel,
    moduleConfigurations,
  };
})();

function defaultState(): AppState {
  return cachedDefaultState;
}

let state: AppState = defaultState();
const listeners = new Set<() => void>();

function loadFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      state = {
        ...defaultState(),
        ...parsed,
        records: { ...defaultState().records, ...(parsed.records ?? {}) },
      };
    }
  } catch {
    /* noop */
  }
  applyTheme(state.theme);
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

function applyTheme(t: "dark" | "light") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
}

let hydrated = false;
let realtimeSubscriptions: Map<string, any> = new Map();

function ensureHydrated() {
  if (!hydrated && typeof window !== "undefined") {
    loadFromStorage();
    hydrated = true;
    // Initialize real-time subscriptions after hydration
    initializeRealtimeSubscriptions();
    // Load data from Supabase to populate store
    hydrateFromSupabase();
  }
}

/**
 * Initialize real-time subscriptions to Supabase for key tables
 * This keeps the local store in sync with the database
 */
function initializeRealtimeSubscriptions() {
  // Subscribe to key industrial tables
  const tablesToSubscribe = [
    'industrial.produtos',
    'industrial.ordens_producao',
    'industrial.lotes',
    'industrial.estoque_industrial',
    'industrial.movimentacoes',
    'industrial.qualidade',
    'industrial.fornecedores',
  ];

  tablesToSubscribe.forEach(table => {
    const subscription = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', { event: '*', schema: 'industrial', table: table.replace('industrial.', '') }, (payload) => {
        handleRealtimeUpdate(table, payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${table}`);
        }
      });

    realtimeSubscriptions.set(table, subscription);
  });
}

/**
 * Hydrate store from Supabase database
 * This loads existing data from the database into the local store
 */
async function hydrateFromSupabase() {
  try {
    console.log('Hydrating store from Supabase...');
    
    const tableToModuleKey: Record<string, ModuleKey> = {
      'industrial.empresa': 'empresa',
      'industrial.setores': 'setores',
      'industrial.funcionarios': 'funcionarios',
      'industrial.equipamentos': 'equipamentos',
      'industrial.ferramentas': 'ferramentas',
      'industrial.materiais': 'materias-primas',
      'industrial.fornecedores': 'fornecedores',
      'industrial.produtos': 'produtos',
      'industrial.componentes': 'componentes',
      'industrial.bom': 'bom',
      'industrial.processos': 'processos',
      'industrial.cronometragens': 'cronometragem',
      'industrial.capacidade': 'capacidade',
      'industrial.ordens_producao': 'ordens-producao',
      'industrial.lotes': 'lotes',
      'industrial.estoque_industrial': 'estoque-industrial',
      'industrial.movimentacoes': 'movimentacoes',
      'industrial.apontamentos': 'apontamentos',
      'industrial.consumo_materiais': 'consumo-materiais',
      'industrial.qualidade': 'qualidade',
      'industrial.rastreabilidade_lotes': 'rastreabilidade',
      // 'apresentacoes' and 'producao_tempo_real' have no backing DB tables — use localStorage only
    };

    // Column name mapping that matches SeedDeploymentManager transformations
    const tableToColumnName: Record<string, string> = {
      'industrial.empresa': 'name',
      'industrial.setores': 'name',
      'industrial.funcionarios': 'name',
      'industrial.equipamentos': 'name',
      'industrial.ferramentas': 'descricao',
      'industrial.materiais': 'descricao',
      'industrial.fornecedores': 'razao_social',
      'industrial.produtos': 'modelo',
      'industrial.componentes': 'name',
      'industrial.bom': 'name',
      'industrial.processos': 'name',
      'industrial.cronometragens': 'name',
      'industrial.capacidade': 'name',
      'industrial.ordens_producao': 'numero',
      'industrial.lotes': 'codigo',
      'industrial.estoque_industrial': 'codigo',
      'industrial.movimentacoes': 'codigo',
      'industrial.apontamentos': 'codigo',
      'industrial.consumo_materiais': 'codigo',
      'industrial.qualidade': 'codigo',
      'industrial.rastreabilidade_lotes': 'codigo',
    };

    const records = { ...state.records };

    for (const [table, moduleKey] of Object.entries(tableToModuleKey)) {
      try {
        const tableName = table.replace('industrial.', '');
        const { data, error } = await supabase
          .schema('industrial')
          .from(tableName)
          .select('*')
          .limit(1000);

        if (error) {
          console.warn(`Failed to load ${table}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          const columnName = tableToColumnName[table];
          const moduleRecords: ModuleRecord[] = data.map((row: any) => ({
            id: row.id,
            name: row[columnName] || row.nome || row.modelo || row.codigo || row.numero || row.descricao || row.razao_social || 'Unknown',
            meta: row.meta || row.metadados || row.especificacoes || undefined,
            createdAt: new Date(row.created_at || row.data_criacao).getTime(),
          }));

          records[moduleKey] = moduleRecords;
          console.log(`Loaded ${moduleRecords.length} records from ${table}`);
        }
      } catch (err) {
        console.warn(`Error loading ${table}:`, err);
      }
    }

    // Update store with loaded records
    store.set((s) => ({
      ...s,
      records,
    }));

    console.log('Store hydration complete');
  } catch (error) {
    console.error('Error hydrating from Supabase:', error);
  }
}

/**
 * Handle real-time updates from Supabase
 */
function handleRealtimeUpdate(table: string, payload: any) {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  // Map table to module key
  const tableToModuleKey: Record<string, ModuleKey> = {
    'industrial.produtos': 'produtos',
    'industrial.ordens_producao': 'ordens-producao',
    'industrial.lotes': 'lotes',
    'industrial.estoque_industrial': 'estoque-industrial',
    'industrial.movimentacoes': 'movimentacoes',
    'industrial.qualidade': 'qualidade',
    'industrial.fornecedores': 'fornecedores',
  };

  const moduleKey = tableToModuleKey[table];
  if (!moduleKey) return;

  const columnName = getColumnName(moduleKey);

  if (eventType === 'INSERT') {
    const record: ModuleRecord = {
      id: newRecord.id,
      name: newRecord[columnName] || newRecord.nome || newRecord.modelo || newRecord.codigo || 'Unknown',
      meta: newRecord.meta || newRecord.metadados,
      createdAt: new Date(newRecord.created_at || newRecord.data_criacao).getTime(),
    };
    addRecord(moduleKey, record.name, record.meta);
  } else if (eventType === 'UPDATE') {
    const id = newRecord.id;
    const patch: { name?: string; meta?: Record<string, string> } = {};
    if (newRecord[columnName]) patch.name = newRecord[columnName];
    if (newRecord.meta) patch.meta = newRecord.meta;
    updateRecord(moduleKey, id, patch);
  } else if (eventType === 'DELETE') {
    const id = oldRecord.id;
    removeRecord(moduleKey, id);
  }
}

/**
 * Cleanup real-time subscriptions (call this on unmount)
 */
export function cleanupRealtimeSubscriptions() {
  realtimeSubscriptions.forEach((subscription, table) => {
    supabase.removeChannel(subscription);
    console.log(`Unsubscribed from ${table}`);
  });
  realtimeSubscriptions.clear();
}

// Debounced persist to avoid blocking on rapid state changes
let persistTimeout: NodeJS.Timeout | null = null;
function schedulePersist() {
  if (persistTimeout) clearTimeout(persistTimeout);
  persistTimeout = setTimeout(() => {
    persist();
    persistTimeout = null;
  }, 100); // 100ms debounce
}

function emit() {
  // Invalidate cache when state changes
  implantationCache = null;
  listeners.forEach((l) => l());
}

export const store = {
  get(): AppState {
    ensureHydrated();
    return state;
  },
  set(updater: (s: AppState) => AppState) {
    ensureHydrated();
    state = updater(state);
    schedulePersist(); // Use debounced persist
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useStore<T>(selector: (s: AppState) => T): T {
  const getServerSnapshot = () => {
    const snapshot = selector(defaultState());
    return snapshot;
  };
  return useSyncExternalStore(
    (l) => store.subscribe(l),
    () => selector(store.get()),
    getServerSnapshot,
  );
}

export function toggleTheme() {
  store.set((s) => {
    const next = s.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    return { ...s, theme: next };
  });
}

export function addRecord(key: ModuleKey, name: string, meta?: Record<string, any>) {
  const newRecord = { id: crypto.randomUUID(), name, meta, createdAt: Date.now() };
  
  store.set((s) => ({
    ...s,
    records: {
      ...s.records,
      [key]: [newRecord, ...s.records[key]],
    },
  }));

  // Sync to Supabase (optimistic update)
  syncRecordToSupabase(key, newRecord).catch((error) => {
    console.error(`Failed to sync ${key} to Supabase:`, error);
    // Could implement rollback here if needed
  });
}

async function syncRecordToSupabase(key: ModuleKey, record: ModuleRecord) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const tableName = getTableName(key);
      const schema = getSchema(key);
      const columnName = getColumnName(key);
      const metaColumnName = getMetaColumnName(key);
      
      const dbData: Record<string, any> = {
        id: record.id,
        [columnName]: record.name,
        [metaColumnName]: record.meta,
        created_at: new Date(record.createdAt).toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.schema(schema).from(tableName).insert(dbData);
      
      if (error) throw error;
      
      return; // Success
    } catch (error: any) {
      retryCount++;
      
      // Don't retry on unique violation (record already exists)
      if (error.code === '23505') {
        console.log(`${key} already exists in Supabase, skipping`);
        return;
      }
      
      // Don't retry on auth errors
      if (error.code?.startsWith('PGRST')) {
        console.error(`Auth error syncing ${key}:`, error);
        throw error;
      }
      
      if (retryCount >= maxRetries) {
        console.error(`Failed to sync ${key} after ${maxRetries} retries:`, error);
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

function getTableName(key: ModuleKey): string {
  const mapping: Record<ModuleKey, string> = {
    empresa: 'empresa',
    setores: 'setores',
    funcionarios: 'funcionarios',
    equipamentos: 'equipamentos',
    ferramentas: 'ferramentas',
    'materias-primas': 'materiais',
    fornecedores: 'fornecedores',
    produtos: 'produtos',
    componentes: 'componentes',
    bom: 'bom',
    processos: 'processos',
    cronometragem: 'cronometragens',
    capacidade: 'capacidade',
    'ordens-producao': 'ordens_producao',
    lotes: 'lotes',
    'estoque-industrial': 'estoque_industrial',
    movimentacoes: 'movimentacoes',
    apontamentos: 'apontamentos',
    'consumo-materiais': 'consumo_materiais',
    'producao-tempo-real': 'producao_tempo_real',
    qualidade: 'qualidade',
    rastreabilidade: 'rastreabilidade_lotes',
    apresentacoes: 'apresentacoes',
  };
  return mapping[key];
}

function getColumnName(key: ModuleKey): string {
  // Mapeamento para colunas reais no banco
  const mapping: Record<ModuleKey, string> = {
    empresa: 'name',
    setores: 'name',
    funcionarios: 'name',
    equipamentos: 'name',
    ferramentas: 'name',
    'materias-primas': 'name',
    fornecedores: 'name',
    produtos: 'name',
    componentes: 'name',
    bom: 'name',
    processos: 'name',
    cronometragem: 'name',
    capacidade: 'name',
    'ordens-producao': 'numero',
    lotes: 'codigo',
    'estoque-industrial': 'codigo',
    movimentacoes: 'codigo',
    apontamentos: 'codigo',
    'consumo-materiais': 'codigo',
    'producao-tempo-real': 'codigo',
    qualidade: 'codigo',
    rastreabilidade: 'codigo',
    apresentacoes: 'codigo',
  };
  return mapping[key];
}

function getMetaColumnName(key: ModuleKey): string {
  // Mapeamento para coluna de metadados reais no banco
  const mapping: Record<ModuleKey, string> = {
    empresa: 'metadata',
    setores: 'metadata',
    funcionarios: 'metadata',
    equipamentos: 'metadata',
    ferramentas: 'metadata',
    'materias-primas': 'metadata',
    fornecedores: 'metadata',
    produtos: 'metadata',
    componentes: 'metadata',
    bom: 'metadata',
    processos: 'metadata',
    cronometragem: 'metadata',
    capacidade: 'metadata',
    'ordens-producao': 'metadata',
    lotes: 'metadata',
    'estoque-industrial': 'metadata',
    movimentacoes: 'metadata',
    apontamentos: 'metadata',
    'consumo-materiais': 'metadata',
    'producao-tempo-real': 'metadata',
    qualidade: 'metadata',
    rastreabilidade: 'metadata',
    apresentacoes: 'metadata',
  };
  return mapping[key];
}

function getSchema(key: ModuleKey): 'public' | 'industrial' {
  // TODOS os módulos industriais usam o schema 'industrial'
  // Após migration 20240623_fix_industrial_schema.sql, todas as tabelas industriais
  // foram movidas do public para o industrial
  const industrialModules: ModuleKey[] = [
    'empresa', 'setores', 'funcionarios', 'equipamentos', 'ferramentas',
    'materias-primas', 'fornecedores', 'produtos', 'componentes', 'bom',
    'processos', 'cronometragem', 'capacidade',
    'ordens-producao', 'lotes', 'estoque-industrial', 'movimentacoes', 'apontamentos',
    'consumo-materiais', 'qualidade', 'rastreabilidade', 'apresentacoes',
    'producao-tempo-real'
  ];
  return industrialModules.includes(key) ? 'industrial' : 'public';
}

export function removeRecord(key: ModuleKey, id: string) {
  store.set((s) => ({
    ...s,
    records: { ...s.records, [key]: s.records[key].filter((r) => r.id !== id) },
  }));

  // Sync to Supabase (optimistic update)
  deleteRecordFromSupabase(key, id).catch((error) => {
    console.error(`Failed to delete ${key} from Supabase:`, error);
  });
}

export function updateRecord(
  key: ModuleKey,
  id: string,
  patch: { name?: string; meta?: Record<string, any> },
) {
  const updatedRecord = store.get().records[key].find((r) => r.id === id);
  if (!updatedRecord) return;

  const newRecord = {
    ...updatedRecord,
    name: patch.name ?? updatedRecord.name,
    meta: patch.meta ? { ...(updatedRecord.meta ?? {}), ...patch.meta } : updatedRecord.meta,
  };

  store.set((s) => ({
    ...s,
    records: {
      ...s.records,
      [key]: s.records[key].map((r) => (r.id === id ? newRecord : r)),
    },
  }));

  // Sync to Supabase (optimistic update)
  updateRecordInSupabase(key, id, newRecord).catch((error) => {
    console.error(`Failed to update ${key} in Supabase:`, error);
  });
}

async function deleteRecordFromSupabase(key: ModuleKey, id: string) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const tableName = getTableName(key);
      const schema = getSchema(key);
      
      const { error } = await supabase.schema(schema).from(tableName).delete().eq('id', id);
      
      if (error) throw error;
      
      return; // Success
    } catch (error: any) {
      retryCount++;
      
      // Don't retry on auth errors
      if (error.code?.startsWith('PGRST')) {
        console.error(`Auth error deleting ${key}:`, error);
        throw error;
      }
      
      if (retryCount >= maxRetries) {
        console.error(`Failed to delete ${key} after ${maxRetries} retries:`, error);
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function updateRecordInSupabase(key: ModuleKey, id: string, record: ModuleRecord) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const tableName = getTableName(key);
      const schema = getSchema(key);
      const columnName = getColumnName(key);
      const metaColumnName = getMetaColumnName(key);
      
      const dbData: Record<string, any> = {
        [columnName]: record.name,
        [metaColumnName]: record.meta,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.schema(schema).from(tableName).update(dbData).eq('id', id);
      
      if (error) throw error;
      
      return; // Success
    } catch (error: any) {
      retryCount++;
      
      // Don't retry on auth errors
      if (error.code?.startsWith('PGRST')) {
        console.error(`Auth error updating ${key}:`, error);
        throw error;
      }
      
      if (retryCount >= maxRetries) {
        console.error(`Failed to update ${key} after ${maxRetries} retries:`, error);
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export function getRecord(key: ModuleKey, id: string): ModuleRecord | undefined {
  return store.get().records[key].find((r) => r.id === id);
}

export function setCompanyName(name: string) {
  store.set((s) => ({ ...s, companyName: name }));
}

export function completeOnboarding() {
  store.set((s) => ({ ...s, onboardingCompleted: true, onboardingSkipped: false }));
}

export function skipOnboarding() {
  store.set((s) => ({ ...s, onboardingSkipped: true }));
}

export function setOnboardingStep(step: number) {
  store.set((s) => ({
    ...s,
    onboardingProgress: {
      ...s.onboardingProgress,
      currentStep: step,
      lastStepTimestamp: Date.now(),
    },
  }));
}

export function completeOnboardingStep(step: number) {
  store.set((s) => ({
    ...s,
    onboardingProgress: {
      ...s.onboardingProgress,
      completedSteps: [...s.onboardingProgress.completedSteps, step].filter((v, i, a) => a.indexOf(v) === i),
      currentStep: step + 1,
      lastStepTimestamp: Date.now(),
    },
  }));
}

export function skipOnboardingStep(step: number) {
  store.set((s) => ({
    ...s,
    onboardingProgress: {
      ...s.onboardingProgress,
      skippedSteps: [...s.onboardingProgress.skippedSteps, step].filter((v, i, a) => a.indexOf(v) === i),
      currentStep: step + 1,
      lastStepTimestamp: Date.now(),
    },
  }));
}

export function resetAll() {
  store.set(() => defaultState());
}

/**
 * Seed All - Versão Moderna com Supabase
 * 
 * Esta função agora:
 * 1. Gera os seeds
 * 2. Faz deploy para o Supabase (via SeedDeploymentManager)
 * 3. Atualiza o store local
 * 4. Popula tabelas do Copilot
 * 
 * Isso garante que o Copilot, KPIs, Analytics e outros sistemas
 * enxerguem os dados reais.
 */
export async function seedAll() {
  try {
    // 1. Deploy para Supabase
    const result = await seedDeploymentManager.deploy();
    
    if (!result.success) {
      console.error("Seed deployment failed:", result.errors);
      throw new Error(`Seed deployment failed: ${result.errors.join(", ")}`);
    }

    // 2. Obter registros dos seeds
    const records = seedAllRecordsImport();

    // 3. Atualizar store local
    store.set((s) => ({
      ...s,
      onboardingCompleted: true,
      onboardingSkipped: false,
      companyName: companyNameImport,
      records,
    }));

    return result;
  } catch (error) {
    console.error("Error in seedAll:", error);
    throw error;
  }
}

/**
 * Cleanup All - Remove dados de seed do Supabase
 * 
 * Remove apenas os registros gerados pelo seed, protegendo
 * dados reais do cliente.
 */
export async function cleanupAll() {
  try {
    const result = await seedDeploymentManager.cleanup();
    
    if (!result.success) {
      console.error("Seed cleanup failed:", result.errors);
      throw new Error(`Seed cleanup failed: ${result.errors.join(", ")}`);
    }

    // Reset do store local
    store.set(() => defaultState());

    return result;
  } catch (error) {
    console.error("Error in cleanupAll:", error);
    throw error;
  }
}

export function setMaturityLevel(level: MaturityLevel) {
  store.set((s) => ({ ...s, maturityLevel: level }));
}

export function getMaturityLevel(): MaturityLevel {
  return store.get().maturityLevel;
}

export interface ImplantationStats {
  total: number;
  perModule: Record<ModuleKey, { count: number; weight: number; progress: number }>;
  overall: number;
}

// Memoization cache for computeImplantation
let implantationCache: { 
  recordsHash: string; 
  result: ImplantationStats 
} | null = null;

function hashRecords(records: Record<ModuleKey, ModuleRecord[]>): string {
  // Create a simple hash based on record counts per module
  return MODULES.map(m => `${m.key}:${records[m.key]?.length ?? 0}`).join('|');
}

export function computeImplantation(s: AppState): ImplantationStats {
  // Check if records have changed using a hash instead of reference equality
  const currentHash = hashRecords(s.records);
  if (implantationCache && implantationCache.recordsHash === currentHash) {
    return implantationCache.result;
  }

  const perModule = {} as ImplantationStats["perModule"];
  let weighted = 0;
  for (const m of MODULES) {
    const count = s.records[m.key]?.length ?? 0;
    // each record contributes diminishingly; 5+ records = full
    const progress = Math.min(1, count / 5);
    perModule[m.key] = { count, weight: m.weight, progress };
    weighted += progress * m.weight;
  }
  const result = {
    total: Object.values(s.records).reduce((a, b) => a + b.length, 0),
    perModule,
    overall: Math.round((weighted / TOTAL_WEIGHT) * 100),
  };

  // Cache the result with hash instead of state reference
  implantationCache = { recordsHash: currentHash, result };
  return result;
}

// ============================================================================
// MÓDULO DE CONFIGURAÇÕES
// ============================================================================

/**
 * Carrega as configurações de módulos do banco de dados
 */
export async function loadModuleConfigurations() {
  try {
    const result = await moduleConfigurationService.getAll();
    if (result.success && result.data) {
      const configurations = {} as Record<ModuleKey, boolean>;
      for (const config of result.data) {
        configurations[config.module_key] = config.visible_in_menu;
      }
      store.set((s) => ({ ...s, moduleConfigurations: configurations }));
    }
  } catch (error) {
    console.error("Erro ao carregar configurações de módulos:", error);
  }
}

/**
 * Mostra um módulo no menu
 */
export async function showModuleInMenu(moduleKey: ModuleKey) {
  try {
    const result = await moduleConfigurationService.showInMenu(moduleKey);
    if (result.success) {
      store.set((s) => ({
        ...s,
        moduleConfigurations: { ...s.moduleConfigurations, [moduleKey]: true },
      }));
    }
    return result;
  } catch (error) {
    console.error(`Erro ao mostrar módulo ${moduleKey} no menu:`, error);
    return { success: false, error: "Erro desconhecido" };
  }
}

/**
 * Oculta um módulo no menu
 */
export async function hideModuleFromMenu(moduleKey: ModuleKey) {
  try {
    const result = await moduleConfigurationService.hideFromMenu(moduleKey);
    if (result.success) {
      store.set((s) => ({
        ...s,
        moduleConfigurations: { ...s.moduleConfigurations, [moduleKey]: false },
      }));
    }
    return result;
  } catch (error) {
    console.error(`Erro ao ocultar módulo ${moduleKey} do menu:`, error);
    return { success: false, error: "Erro desconhecido" };
  }
}

/**
 * Verifica se um módulo está visível no menu
 */
export function isModuleVisibleInMenu(moduleKey: ModuleKey): boolean {
  return store.get().moduleConfigurations[moduleKey] ?? true;
}

/**
 * Retorna os módulos visíveis no menu filtrados pelo nível de maturidade atual
 * Módulos de níveis inferiores também são visíveis (cumulativo)
 */
export function getVisibleModulesForMaturity(): typeof MODULES {
  const currentState = store.get();
  const maturityOrder: MaturityLevel[] = ["starter", "growth", "mature"];
  const currentIndex = maturityOrder.indexOf(currentState.maturityLevel);
  
  return MODULES.filter((m) => {
    const isVisible = currentState.moduleConfigurations[m.key] ?? true;
    const moduleIndex = maturityOrder.indexOf(m.maturity);
    const maturityMatch = moduleIndex <= currentIndex;
    return isVisible && maturityMatch;
  });
}

/**
 * Atualiza o nível de maturidade e recarrega as configurações
 */
export async function setMaturityLevelAndReload(level: MaturityLevel) {
  store.set((s) => ({ ...s, maturityLevel: level }));
  await loadModuleConfigurations();
}

/**
 * Sugere o nível de maturidade apropriado baseado no progresso de implantação
 * Starter: 0-40% | Growth: 40-75% | Mature: 75-100%
 */
export function suggestMaturityLevel(): MaturityLevel {
  const stats = computeImplantation(store.get());
  const overall = stats.overall;
  
  if (overall >= 75) return "mature";
  if (overall >= 40) return "growth";
  return "starter";
}

/**
 * Verifica se a fábrica está pronta para avançar para o próximo nível de maturidade
 */
export function canAdvanceMaturity(): { canAdvance: boolean; currentLevel: MaturityLevel; suggestedLevel: MaturityLevel; gap: number } {
  const current = store.get().maturityLevel;
  const suggested = suggestMaturityLevel();
  const maturityOrder: MaturityLevel[] = ["starter", "growth", "mature"];
  const currentIndex = maturityOrder.indexOf(current);
  const suggestedIndex = maturityOrder.indexOf(suggested);
  
  return {
    canAdvance: suggestedIndex > currentIndex,
    currentLevel: current,
    suggestedLevel: suggested,
    gap: suggestedIndex - currentIndex,
  };
}

// ============================================================================
// AI-FIRST: Funções para preparação de dados para agentes de IA
// ============================================================================

/**
 * Retorna todos os registros de um módulo em formato amigável para IA
 * Inclui contexto estruturado para agentes especializados
 */
export function getRecordsForAI(key: ModuleKey): Array<{
  id: string;
  name: string;
  meta?: Record<string, string>;
  createdAt: string;
  module: string;
  context: string;
}> {
  const records = store.get().records[key];
  const moduleDef = MODULES.find(m => m.key === key);
  
  return records.map(r => ({
    id: r.id,
    name: r.name,
    meta: r.meta,
    createdAt: new Date(r.createdAt).toISOString(),
    module: moduleDef?.title || key,
    context: `${moduleDef?.description || ''} - ${moduleDef?.benefit || ''}`,
  }));
}

/**
 * Retorna dados estruturados para o Industrial Copilot
 * Inclui resumo da fábrica, progresso e pontos de atenção
 */
export function getCopilotContext(): {
  companyName: string;
  maturityLevel: MaturityLevel;
  implantation: ImplantationStats;
  moduleCounts: Record<ModuleKey, number>;
  recommendations: string[];
} {
  const state = store.get();
  const implantation = computeImplantation(state);
  
  // Gerar recomendações baseadas em gaps
  const recommendations: string[] = [];
  
  // Módulos com progresso baixo mas alto peso
  for (const m of MODULES) {
    const progress = implantation.perModule[m.key]?.progress || 0;
    if (progress < 0.5 && m.weight >= 8) {
      recommendations.push(`Priorizar cadastro em ${m.title} (peso ${m.weight})`);
    }
  }
  
  // Recomendação de maturidade
  const maturityCheck = canAdvanceMaturity();
  if (maturityCheck.canAdvance) {
    recommendations.push(`Considerar avançar para nível ${maturityCheck.suggestedLevel}`);
  }
  
  return {
    companyName: state.companyName,
    maturityLevel: state.maturityLevel,
    implantation,
    moduleCounts: Object.fromEntries(
      Object.entries(state.records).map(([k, v]) => [k, v.length])
    ) as Record<ModuleKey, number>,
    recommendations,
  };
}
