import { supabase } from './supabase';
import type { ModuleRecord } from './store';
import type { ModuleKey } from './modules';

// Mapeamento de ModuleKey para tabelas do Supabase
const TABLE_MAPPING: Record<ModuleKey, string> = {
  empresa: 'empresas',
  setores: 'setores',
  funcionarios: 'funcionarios',
  equipamentos: 'equipamentos',
  ferramentas: 'ferramentas',
  'materias-primas': 'materias_primas',
  fornecedores: 'fornecedores',
  produtos: 'products_industrial',
  componentes: 'components',
  bom: 'bom',
  processos: 'processes',
  cronometragem: 'timing_records',
  capacidade: 'capacity',
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

// Função para converter ModuleRecord para formato do banco
function recordToDb(record: ModuleRecord, key: ModuleKey) {
  const tableName = TABLE_MAPPING[key];
  
  // Para tabelas do schema industrial
  if (['produtos', 'componentes', 'bom', 'processos', 'cronometragem', 'capacidade', 
       'ordens-producao', 'lotes', 'estoque-industrial', 'movimentacoes', 'apontamentos',
       'consumo-materiais', 'qualidade', 'rastreabilidade'].includes(key)) {
    return {
      id: record.id,
      name: record.name,
      meta: record.meta,
      created_at: new Date(record.createdAt).toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  
  // Para tabelas do schema public (empresa, setores, etc.)
  return {
    id: record.id,
    name: record.name,
    meta: record.meta,
    created_at: new Date(record.createdAt).toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// Função para converter do banco para ModuleRecord
function dbToRecord(db: any): ModuleRecord {
  return {
    id: db.id,
    name: db.name,
    meta: db.meta || {},
    createdAt: new Date(db.created_at).getTime(),
  };
}

// Funções CRUD com Supabase
export async function fetchRecords(key: ModuleKey): Promise<ModuleRecord[]> {
  try {
    const tableName = TABLE_MAPPING[key];
    
    // Verificar se a tabela existe no schema industrial ou public
    const schema = ['produtos', 'componentes', 'bom', 'processos', 'cronometragem', 'capacidade', 
                    'ordens-producao', 'lotes', 'estoque-industrial', 'movimentacoes', 'apontamentos',
                    'consumo-materiais', 'qualidade', 'rastreabilidade'].includes(key) 
      ? 'industrial' 
      : 'public';
    
    const { data, error } = await supabase
      .schema(schema)
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(dbToRecord);
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    throw error;
  }
}

export async function createRecord(key: ModuleKey, record: ModuleRecord): Promise<ModuleRecord> {
  try {
    const tableName = TABLE_MAPPING[key];
    const schema = ['produtos', 'componentes', 'bom', 'processos', 'cronometragem', 'capacidade', 
                    'ordens-producao', 'lotes', 'estoque-industrial', 'movimentacoes', 'apontamentos',
                    'consumo-materiais', 'qualidade', 'rastreabilidade'].includes(key) 
      ? 'industrial' 
      : 'public';
    
    const dbData = recordToDb(record, key);
    
    const { data, error } = await supabase
      .schema(schema)
      .from(tableName)
      .insert(dbData)
      .select()
      .single();
    
    if (error) throw error;
    
    return dbToRecord(data);
  } catch (error) {
    console.error(`Error creating ${key}:`, error);
    throw error;
  }
}

export async function updateRecordDb(key: ModuleKey, id: string, record: Partial<ModuleRecord>): Promise<ModuleRecord> {
  try {
    const tableName = TABLE_MAPPING[key];
    const schema = ['produtos', 'componentes', 'bom', 'processos', 'cronometragem', 'capacidade', 
                    'ordens-producao', 'lotes', 'estoque-industrial', 'movimentacoes', 'apontamentos',
                    'consumo-materiais', 'qualidade', 'rastreabilidade'].includes(key) 
      ? 'industrial' 
      : 'public';
    
    const dbData = recordToDb(record as ModuleRecord, key);
    const { id: _, ...updateData } = dbData; // Don't update ID
    
    const { data, error } = await supabase
      .schema(schema)
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return dbToRecord(data);
  } catch (error) {
    console.error(`Error updating ${key}:`, error);
    throw error;
  }
}

export async function deleteRecordDb(key: ModuleKey, id: string): Promise<void> {
  try {
    const tableName = TABLE_MAPPING[key];
    const schema = ['produtos', 'componentes', 'bom', 'processos', 'cronometragem', 'capacidade', 
                    'ordens-producao', 'lotes', 'estoque-industrial', 'movimentacoes', 'apontamentos',
                    'consumo-materiais', 'qualidade', 'rastreabilidade'].includes(key) 
      ? 'industrial' 
      : 'public';
    
    const { error } = await supabase
      .schema(schema)
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting ${key}:`, error);
    throw error;
  }
}

// Função para sincronizar todos os registros do localStorage para Supabase
export async function syncToSupabase(records: Record<ModuleKey, ModuleRecord[]>): Promise<void> {
  for (const [key, keyRecords] of Object.entries(records)) {
    for (const record of keyRecords) {
      try {
        // Tenta criar, se já existir ignora
        await createRecord(key as ModuleKey, record);
      } catch (error: any) {
        // Se já existe, ignora
        if (error.code !== '23505') { // Unique violation
          console.error(`Error syncing ${key}:`, error);
        }
      }
    }
  }
}

// Função para carregar todos os registros do Supabase
export async function loadFromSupabase(): Promise<Record<ModuleKey, ModuleRecord[]>> {
  const records = {} as Record<ModuleKey, ModuleRecord[]>;
  
  for (const key of Object.keys(TABLE_MAPPING) as ModuleKey[]) {
    try {
      records[key] = await fetchRecords(key);
    } catch (error) {
      console.error(`Error loading ${key} from Supabase:`, error);
      records[key] = [];
    }
  }
  
  return records;
}
