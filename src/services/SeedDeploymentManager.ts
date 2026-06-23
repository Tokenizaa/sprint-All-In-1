import { supabaseAdmin, supabaseIndustrial } from "@/lib/supabase";
import { seedAllRecords, companyName } from "@/lib/seeds";
import type { ModuleRecord } from "@/lib/store";
import { MODULES, type ModuleKey } from "@/lib/modules";

export interface SeedDeploymentResult {
  success: boolean;
  batchId: string;
  summary: Record<ModuleKey, DeploymentSummary>;
  totalRecords: number;
  errors: string[];
  validationPassed: boolean;
}

export interface DeploymentSummary {
  seeded: number;
  inserted: number;
  failed: number;
  table: string;
  schema: string;
}

export interface SeedCleanupResult {
  success: boolean;
  batchId: string;
  removedRecords: number;
  summary: Record<string, number>;
  errors: string[];
}

/**
 * SeedDeploymentManager
 * 
 * Responsável por:
 * - Deploy de seeds para o Supabase
 * - Validação de integridade dos dados
 * - Tracking de registros gerados por seed
 * - Cleanup seguro (apenas registros seed)
 */
export class SeedDeploymentManager {
  private readonly SCHEMA = "industrial";

  /**
   * Gera um novo batch ID para tracking do deployment
   */
  private generateBatchId(): string {
    return crypto.randomUUID();
  }

  /**
   * Prepara os registros com metadados de tracking
   */
  private prepareRecordsWithTracking(
    records: ModuleRecord[],
    batchId: string
  ): ModuleRecord[] {
    return records.map((record) => ({
      ...record,
      meta: {
        ...record.meta,
        seed_generated: "true",
        seed_batch_id: batchId,
        seed_created_at: new Date().toISOString(),
      },
    }));
  }

  /**
   * Obtém o nome da tabela para um módulo
   */
  private getTableName(key: ModuleKey): string {
    const mapping: Record<ModuleKey, string> = {
      empresa: "empresa",
      setores: "setores",
      funcionarios: "funcionarios",
      equipamentos: "equipamentos",
      ferramentas: "ferramentas",
      "materias-primas": "materiais",
      fornecedores: "fornecedores",
      produtos: "produtos",
      componentes: "componentes",
      bom: "bom",
      processos: "processos",
      cronometragem: "cronometragens",
      capacidade: "capacidade",
      "ordens-producao": "ordens_producao",
      lotes: "lotes",
      "estoque-industrial": "estoque_industrial",
      movimentacoes: "movimentacoes",
      apontamentos: "apontamentos",
      "consumo-materiais": "consumo_materiais",
      "producao-tempo-real": "producao_tempo_real",
      qualidade: "qualidade",
      rastreabilidade: "rastreabilidade_lotes",
      apresentacoes: "apresentacoes",
    };
    return mapping[key];
  }

  /**
   * Obtém o nome da coluna principal para um módulo
   */
  private getColumnName(key: ModuleKey): string {
    const mapping: Record<ModuleKey, string> = {
      empresa: "name",
      setores: "name",
      funcionarios: "name",
      equipamentos: "name",
      ferramentas: "name",
      "materias-primas": "name",
      fornecedores: "name",
      produtos: "name",
      componentes: "name",
      bom: "name",
      processos: "name",
      cronometragem: "name",
      capacidade: "name",
      "ordens-producao": "numero",
      lotes: "codigo",
      "estoque-industrial": "codigo",
      movimentacoes: "codigo",
      apontamentos: "codigo",
      "consumo-materiais": "codigo",
      "producao-tempo-real": "codigo",
      qualidade: "codigo",
      rastreabilidade: "codigo",
      apresentacoes: "codigo",
    };
    return mapping[key];
  }

  /**
   * Transforma dados do seed para o formato do banco de dados
   * Mapeia campos do seed (name, meta, createdAt) para colunas reais do banco
   */
  private transformSeedData(
    record: ModuleRecord,
    tableName: string
  ): Record<string, any> {
    const dbData: Record<string, any> = {
      id: record.id,
      created_at: new Date(record.createdAt).toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Mapeamento específico por tabela
    switch (tableName) {
      case "ferramentas":
        dbData.descricao = record.name;
        if (record.meta) {
          dbData.categoria = record.meta.categoria || "Gabarito";
          dbData.status = record.meta.status || "Disponível";
          dbData.observacoes = JSON.stringify(record.meta);
        }
        break;

      case "materiais":
        dbData.descricao = record.name;
        // Generate unique code based on category and first few chars of name
        const category = record.meta?.categoria || "GERAL";
        const namePrefix = record.name.substring(0, 5).toUpperCase().replace(/\s+/g, '');
        dbData.codigo = record.meta?.codigo || `${category.substring(0, 3).toUpperCase()}-${namePrefix}-${crypto.randomUUID().substring(0, 4)}`;
        if (record.meta) {
          dbData.categoria = record.meta.categoria || "Geral";
          dbData.unidade_medida = record.meta.unidade || "UN";
          dbData.estoque_atual = 0;
          dbData.estoque_minimo = 10;
          dbData.estoque_maximo = 100;
          dbData.custo_unitario = 0;
          dbData.especificacoes = record.meta;
          dbData.observacoes = `Fornecedor: ${record.meta.fornecedor || "N/A"}`;
        }
        break;

      case "fornecedores":
        dbData.razao_social = record.name;
        dbData.nome_fantasia = record.meta?.nome_fantasia || record.name;
        if (record.meta) {
          dbData.cnpj = record.meta.cnpj || "00.000.000/0000-00";
          dbData.contato_nome = record.meta.contato || "Contato";
          dbData.status = "Ativo";
          dbData.prazo_entrega_padrao = 7;
          dbData.observacoes = JSON.stringify(record.meta);
        }
        break;

      case "produtos":
        dbData.modelo = record.name;
        if (record.meta) {
          dbData.categoria = record.meta.categoria || "Colchão";
          dbData.linha = record.meta.linha || "Standard";
          dbData.largura_cm = record.meta.largura || 138;
          dbData.comprimento_cm = record.meta.comprimento || 188;
          dbData.altura_cm = record.meta.altura || 25;
          dbData.densidade = record.meta.densidade || 33;
          dbData.especificacoes = record.meta;
          dbData.observacoes = record.meta.observacoes || "";
        }
        break;

      case "empresa":
        dbData.razao_social = record.name;
        // Always generate unique CNPJ based on UUID to avoid duplicates
        const uuidSuffix = crypto.randomUUID().substring(0, 12).replace(/-/g, '').substring(0, 14);
        dbData.cnpj = `${uuidSuffix.substring(0, 2)}.${uuidSuffix.substring(2, 5)}.${uuidSuffix.substring(5, 8)}/${uuidSuffix.substring(8, 12)}-${uuidSuffix.substring(12, 14)}`;
        dbData.regime_fiscal = record.meta?.regime_fiscal || 'Simples Nacional';
        dbData.meta = record.meta || {};
        break;

      case "setores":
        dbData.name = record.name;
        dbData.meta = record.meta || {};
        break;

      case "funcionarios":
        dbData.name = record.name;
        dbData.meta = record.meta || {};
        break;

      case "equipamentos":
        dbData.name = record.name;
        dbData.meta = record.meta || {};
        break;

      case "ordens_producao":
        dbData.numero = record.meta?.numero || record.name;
        dbData.meta = record.meta || {};
        break;

      case "lotes":
      case "estoque_industrial":
      case "movimentacoes":
      case "apontamentos":
      case "consumo_materiais":
      case "qualidade":
        dbData.codigo = record.meta?.codigo || record.name.substring(0, 10).toUpperCase();
        dbData.meta = record.meta || {};
        break;

      default:
        // Para tabelas genéricas, usa o formato original
        dbData.name = record.name;
        dbData.meta = record.meta || {};
        break;
    }

    return dbData;
  }

  /**
   * Registra um registro na tabela seed_registry
   */
  private async registerSeedRecord(
    batchId: string,
    tableName: string,
    recordId: string
  ): Promise<void> {
    try {
      const { error } = await supabaseIndustrial
        .from("seed_registry")
        .insert({
          batch_id: batchId,
          table_name: tableName,
          record_id: recordId,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error(`Failed to register seed record ${recordId}:`, error);
      }
    } catch (error) {
      console.error(`Failed to register seed record ${recordId}:`, error);
    }
  }

  /**
   * Insere registros em uma tabela específica usando RPC functions
   */
  private async insertRecords(
    tableName: string,
    records: ModuleRecord[],
    columnName: string,
    batchId: string
  ): Promise<{ inserted: number; failed: number }> {
    let inserted = 0;
    let failed = 0;

    for (const record of records) {
      try {
        // Transforma dados do seed para o formato do banco
        const dbData = this.transformSeedData(record, tableName);

        // Use RPC functions to bypass PostgREST schema cache
        let rpcFunctionName = '';
        let rpcParams: any = {};

        switch (tableName) {
          case 'ferramentas':
            rpcFunctionName = 'insert_ferramenta';
            rpcParams = {
              p_id: dbData.id,
              p_descricao: dbData.descricao,
              p_categoria: dbData.categoria,
              p_status: dbData.status,
              p_observacoes: dbData.observacoes
            };
            break;
          case 'materiais':
            rpcFunctionName = 'insert_material';
            rpcParams = {
              p_id: dbData.id,
              p_codigo: dbData.codigo,
              p_descricao: dbData.descricao,
              p_categoria: dbData.categoria,
              p_unidade_medida: dbData.unidade_medida,
              p_estoque_atual: dbData.estoque_atual,
              p_estoque_minimo: dbData.estoque_minimo,
              p_estoque_maximo: dbData.estoque_maximo,
              p_custo_unitario: dbData.custo_unitario,
              p_especificacoes: dbData.especificacoes,
              p_observacoes: dbData.observacoes
            };
            break;
          case 'fornecedores':
            rpcFunctionName = 'insert_fornecedor';
            rpcParams = {
              p_id: dbData.id,
              p_razao_social: dbData.razao_social,
              p_nome_fantasia: dbData.nome_fantasia,
              p_cnpj: dbData.cnpj,
              p_contato_nome: dbData.contato_nome,
              p_status: dbData.status,
              p_prazo_entrega_padrao: dbData.prazo_entrega_padrao,
              p_observacoes: dbData.observacoes
            };
            break;
          case 'produtos':
            rpcFunctionName = 'insert_produto';
            rpcParams = {
              p_id: dbData.id,
              p_modelo: dbData.modelo,
              p_categoria: dbData.categoria,
              p_linha: dbData.linha,
              p_largura_cm: dbData.largura_cm,
              p_comprimento_cm: dbData.comprimento_cm,
              p_altura_cm: dbData.altura_cm,
              p_densidade: dbData.densidade,
              p_especificacoes: dbData.especificacoes,
              p_observacoes: dbData.observacoes
            };
            break;
          case 'empresa':
            rpcFunctionName = 'insert_empresa';
            rpcParams = {
              p_id: dbData.id,
              p_metadata: dbData.meta || {},
              p_razao_social: dbData.razao_social || record.name,
              p_regime_fiscal: dbData.regime_fiscal || 'simples_nacional'
            };
            break;
          case 'setores':
            rpcFunctionName = 'insert_setores';
            rpcParams = {
              p_id: dbData.id,
              p_metadata: dbData.meta || {},
              p_nome: dbData.name || record.name,
              p_tipo: dbData.tipo || 'producao',
              p_descricao: dbData.descricao || ''
            };
            break;
          case 'funcionarios':
            rpcFunctionName = 'insert_funcionarios';
            rpcParams = {
              p_id: dbData.id,
              p_metadata: dbData.meta || {},
              p_nome: dbData.name || record.name,
              p_cpf: dbData.cpf || '000.000.000-00',
              p_cargo: dbData.cargo || 'operador',
              p_turno: dbData.turno || 'manha'
            };
            break;
          case 'equipamentos':
            rpcFunctionName = 'insert_equipamentos';
            rpcParams = {
              p_id: dbData.id,
              p_metadata: dbData.meta || {},
              p_nome: dbData.name || record.name,
              p_tipo: dbData.tipo || 'producao',
              p_capacidade: dbData.capacidade || 100
            };
            break;
          case 'componentes':
            rpcFunctionName = 'insert_componentes';
            rpcParams = {
              p_id: dbData.id,
              p_meta: dbData.meta || {},
              p_nome: dbData.name || record.name,
              p_tipo: dbData.tipo || 'componente',
              p_descricao: dbData.descricao || ''
            };
            break;
          case 'bom':
            rpcFunctionName = 'insert_bom';
            rpcParams = {
              p_id: dbData.id,
              p_metadata: dbData.meta || {},
              p_produto_id: dbData.produto_id || null,
              p_componente_id: dbData.componente_id || null,
              p_quantidade: dbData.quantidade || 1
            };
            break;
          case 'processos':
            rpcFunctionName = 'insert_processos';
            rpcParams = {
              p_id: dbData.id,
              p_metadata: dbData.meta || {},
              p_nome: dbData.name || record.name,
              p_descricao: dbData.descricao || '',
              p_tempo_padron: dbData.tempo_padron || 60
            };
            break;
          case 'cronometragens':
            rpcFunctionName = 'insert_cronometragem';
            rpcParams = {
              p_id: dbData.id,
              p_metadata: dbData.meta || {},
              p_processo_id: dbData.processo_id || null,
              p_tempo_medio: dbData.tempo_medio || 60
            };
            break;
          case 'capacidade':
            rpcFunctionName = 'insert_capacidade';
            rpcParams = {
              p_id: dbData.id,
              p_metadata: dbData.meta || {},
              p_recurso_id: dbData.recurso_id || null,
              p_capacidade_diaria: dbData.capacidade_diaria || 100
            };
            break;
          case 'ordens_producao':
            rpcFunctionName = 'insert_ordens_producao';
            rpcParams = {
              p_id: dbData.id,
              p_metadata: dbData.meta || {},
              p_produto_id: dbData.produto_id || null,
              p_quantidade: dbData.quantidade || 10,
              p_status: dbData.status || 'pendente'
            };
            break;
          case 'lotes':
            rpcFunctionName = 'insert_lotes';
            rpcParams = {
              p_id: dbData.id,
              p_metadata: dbData.meta || {},
              p_ordem_producao_id: dbData.ordem_producao_id || null,
              p_lote: dbData.lote || 'L001',
              p_quantidade: dbData.quantidade || 10
            };
            break;
          case 'estoque_industrial':
            rpcFunctionName = 'insert_estoque_industrial';
            rpcParams = {
              p_id: dbData.id,
              p_metadata: dbData.meta || {},
              p_produto_id: dbData.produto_id || null,
              p_quantidade: dbData.quantidade || 0
            };
            break;
          case 'movimentacoes':
            rpcFunctionName = 'insert_movimentacoes';
            rpcParams = {
              p_id: dbData.id,
              p_metadata: dbData.meta || {},
              p_lote_id: dbData.lote_id || null,
              p_tipo: dbData.tipo || 'entrada',
              p_quantidade: dbData.quantidade || 10
            };
            break;
          case 'apontamentos':
            rpcFunctionName = 'insert_apontamentos';
            rpcParams = {
              p_id: dbData.id,
              p_especificacoes: dbData.meta || {},
              p_ordem_producao_id: dbData.ordem_producao_id || null,
              p_funcionario_id: dbData.funcionario_id || null,
              p_tempo_gasto: dbData.tempo_gasto || 60
            };
            break;
          case 'consumo_materiais':
            rpcFunctionName = 'insert_consumo_materiais';
            rpcParams = {
              p_id: dbData.id,
              p_especificacoes: dbData.meta || {},
              p_lote_id: dbData.lote_id || null,
              p_material_id: dbData.material_id || null,
              p_quantidade: dbData.quantidade || 1
            };
            break;
          case 'qualidade':
            rpcFunctionName = 'insert_qualidade';
            rpcParams = {
              p_id: dbData.id,
              p_especificacoes: dbData.meta || {},
              p_lote_id: dbData.lote_id || null,
              p_status: dbData.status || 'aprovado',
              p_observacoes: dbData.observacoes || ''
            };
            break;
          default:
            // For tables without RPC functions, skip for now
            console.log(`No RPC function for table ${tableName}, skipping`);
            continue;
        }

        if (rpcFunctionName) {
          const { error } = await supabaseIndustrial.rpc(rpcFunctionName, rpcParams);

          if (error) {
            console.error(`Failed to insert record ${record.id} via RPC ${rpcFunctionName}:`, error);
            failed++;
          } else {
            // Registra o seed no registry
            await this.registerSeedRecord(batchId, tableName, record.id);
            inserted++;
          }
        }
      } catch (error) {
        console.error(`Failed to insert record ${record.id}:`, error);
        failed++;
      }
    }

    return { inserted, failed };
  }

  /**
   * Valida a integridade do deployment
   */
  private async validateDeployment(
    batchId: string,
    summary: Record<ModuleKey, DeploymentSummary>
  ): Promise<boolean> {
    const validationErrors: string[] = [];

    for (const [key, deploymentSummary] of Object.entries(summary)) {
      const { seeded, inserted } = deploymentSummary;

      if (seeded !== inserted) {
        validationErrors.push(
          `${key}: Expected ${seeded} records, but inserted ${inserted}`
        );
      }
    }

    if (validationErrors.length > 0) {
      console.error("Deployment validation failed:", validationErrors);
      return false;
    }

    return true;
  }

  /**
   * Popula as tabelas do Copilot após deployment
   */
  private async populateCopilotTables(batchId: string): Promise<void> {
    try {
      // Obter dados do Supabase para preencher tabelas do Copilot
      const [produtosResult, materiasResult, ordensResult] = await Promise.all([
        supabaseIndustrial.from("produtos").select("*"),
        supabaseIndustrial.from("materiais").select("*"),
        supabaseIndustrial.from("ordem_producao").select("*"),
      ]);

      const produtos = produtosResult.data || [];
      const materias = materiasResult.data || [];
      const ordens = ordensResult.data || [];

      // Popular copilot_kpis
      await supabaseIndustrial.from("copilot_kpis").upsert({
        id: crypto.randomUUID(),
        total_produtos: produtos.length,
        total_materiais: materias.length,
        total_ordens_producao: ordens.length,
        seed_batch_id: batchId,
        updated_at: new Date().toISOString(),
      });

      // Popular copilot_insights
      await supabaseIndustrial.from("copilot_insights").upsert({
        id: crypto.randomUUID(),
        insight_type: "seed_deployment",
        insight_data: {
          produtos: produtos.length,
          materias: materias.length,
          ordens: ordens.length,
        },
        seed_batch_id: batchId,
        created_at: new Date().toISOString(),
      });

      // Popular copilot_memory
      await supabaseIndustrial.from("copilot_memory").upsert({
        id: crypto.randomUUID(),
        memory_type: "seed_context",
        content: `Seed deployment completed with ${produtos.length} products, ${materias.length} materials, and ${ordens.length} production orders`,
        seed_batch_id: batchId,
        created_at: new Date().toISOString(),
      });

      // Popular copilot_context_snapshots
      await supabaseIndustrial.from("copilot_context_snapshots").upsert({
        id: crypto.randomUUID(),
        snapshot_type: "initial_seed",
        context_data: {
          produtos: produtos.map((p) => ({ id: p.id, name: p.name })),
          materias: materias.map((m) => ({ id: m.id, name: m.name })),
          ordens: ordens.map((o) => ({ id: o.id, numero: o.numero })),
        },
        seed_batch_id: batchId,
        created_at: new Date().toISOString(),
      });

      console.log("Copilot tables populated successfully");
    } catch (error) {
      console.error("Failed to populate Copilot tables:", error);
    }
  }

  /**
   * Deploy completo dos seeds para o Supabase
   */
  async deploy(): Promise<SeedDeploymentResult> {
    const batchId = this.generateBatchId();
    const errors: string[] = [];
    const summary: Record<ModuleKey, DeploymentSummary> = {} as any;
    let totalRecords = 0;

    console.log(`Starting seed deployment with batch ID: ${batchId}`);

    try {
      // 1. Gerar seeds
      const seededRecords = seedAllRecords();

      // 2. Processar cada módulo
      for (const [key, records] of Object.entries(seededRecords)) {
        const moduleKey = key as ModuleKey;
        const tableName = this.getTableName(moduleKey);
        const columnName = this.getColumnName(moduleKey);

        // Preparar registros com tracking
        const recordsWithTracking = this.prepareRecordsWithTracking(
          records,
          batchId
        );

        // Inserir no Supabase
        const { inserted, failed } = await this.insertRecords(
          tableName,
          recordsWithTracking,
          columnName,
          batchId
        );

        summary[moduleKey] = {
          seeded: records.length,
          inserted,
          failed,
          table: tableName,
          schema: this.SCHEMA,
        };

        totalRecords += inserted;

        if (failed > 0) {
          errors.push(
            `${moduleKey}: ${failed} records failed to insert out of ${records.length}`
          );
        }
      }

      // 3. Validar deployment
      const validationPassed = await this.validateDeployment(batchId, summary);

      if (!validationPassed) {
        errors.push("Deployment validation failed");
      }

      // 4. Popular tabelas do Copilot
      if (validationPassed) {
        await this.populateCopilotTables(batchId);
      }

      // 5. Registrar empresa
      await supabaseIndustrial
        .from("empresa")
        .update({
          metadata: {
            seed_generated: "true",
            seed_batch_id: batchId,
            seed_created_at: new Date().toISOString(),
          },
        })
        .eq("razao_social", companyName);

      console.log(`Seed deployment completed: ${totalRecords} records inserted`);

      return {
        success: errors.length === 0 && validationPassed,
        batchId,
        summary,
        totalRecords,
        errors,
        validationPassed,
      };
    } catch (error) {
      console.error("Seed deployment failed:", error);
      errors.push(`Deployment failed: ${error}`);

      return {
        success: false,
        batchId,
        summary,
        totalRecords,
        errors,
        validationPassed: false,
      };
    }
  }

  /**
   * Remove apenas os registros gerados pelo seed
   */
  async cleanup(batchId?: string): Promise<SeedCleanupResult> {
    const errors: string[] = [];
    const summary: Record<string, number> = {};
    let totalRemoved = 0;

    // Se não fornecido, buscar o batch mais recente
    let targetBatchId = batchId;
    if (!targetBatchId) {
      const { data, error } = await supabaseIndustrial
        .from("seed_registry")
        .select("batch_id")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        return {
          success: true,
          batchId: "",
          removedRecords: 0,
          summary,
          errors: [],
        };
      }

      targetBatchId = data[0].batch_id;
    }

    console.log(`Starting seed cleanup for batch: ${targetBatchId}`);

    try {
      // 1. Buscar todos os registros do batch
      const { data: seedRecords, error: fetchError } = await supabaseIndustrial
        .from("seed_registry")
        .select("*")
        .eq("batch_id", targetBatchId);

      if (fetchError) {
        throw fetchError;
      }

      if (!seedRecords || seedRecords.length === 0) {
        return {
          success: true,
          batchId: targetBatchId || "",
          removedRecords: 0,
          summary,
          errors: [],
        };
      }

      // 2. Agrupar por tabela
      const recordsByTable: Record<string, string[]> = {};
      for (const record of seedRecords) {
        if (!recordsByTable[record.table_name]) {
          recordsByTable[record.table_name] = [];
        }
        recordsByTable[record.table_name].push(record.record_id);
      }

      // 3. Remover registros de cada tabela
      for (const [tableName, recordIds] of Object.entries(recordsByTable)) {
        try {
          const { error: deleteError } = await supabaseIndustrial
            .from(tableName)
            .delete()
            .in("id", recordIds);

          if (deleteError) {
            console.error(`Failed to delete from ${tableName}:`, deleteError);
            errors.push(`Failed to delete from ${tableName}: ${deleteError.message}`);
            summary[tableName] = 0;
          } else {
            summary[tableName] = recordIds.length;
            totalRemoved += recordIds.length;
          }
        } catch (error) {
          console.error(`Failed to delete from ${tableName}:`, error);
          errors.push(`Failed to delete from ${tableName}: ${error}`);
          summary[tableName] = 0;
        }
      }

      // 4. Remover registros do seed_registry
      const { error: registryDeleteError } = await supabaseIndustrial
        .from("seed_registry")
        .delete()
        .eq("batch_id", targetBatchId);

      if (registryDeleteError) {
        console.error("Failed to delete from seed_registry:", registryDeleteError);
        errors.push(
          `Failed to delete from seed_registry: ${registryDeleteError.message}`
        );
      }

      // 5. Limpar metadados de seed das empresas
      await supabaseIndustrial
        .from("empresas")
        .update({
          meta: {
            seed_generated: null,
            seed_batch_id: null,
            seed_created_at: null,
          },
        })
        .eq("meta->>seed_batch_id", targetBatchId);

      console.log(`Seed cleanup completed: ${totalRemoved} records removed`);

      return {
        success: errors.length === 0,
        batchId: targetBatchId || "",
        removedRecords: totalRemoved,
        summary,
        errors,
      };
    } catch (error) {
      console.error("Seed cleanup failed:", error);
      errors.push(`Cleanup failed: ${error}`);

      return {
        success: false,
        batchId: targetBatchId || "",
        removedRecords: totalRemoved,
        summary,
        errors,
      };
    }
  }

  /**
   * Obtém o status atual do deployment
   */
  async getStatus(): Promise<{
    hasSeedData: boolean;
    currentBatchId: string | null;
    recordCount: number;
  }> {
    try {
      const { data, error } = await supabaseIndustrial
        .from("seed_registry")
        .select("batch_id")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        return {
          hasSeedData: false,
          currentBatchId: null,
          recordCount: 0,
        };
      }

      const { count } = await supabaseIndustrial
        .from("seed_registry")
        .select("*", { count: "exact", head: true })
        .eq("batch_id", data[0].batch_id);

      return {
        hasSeedData: true,
        currentBatchId: data[0].batch_id,
        recordCount: count || 0,
      };
    } catch (error) {
      console.error("Failed to get seed status:", error);
      return {
        hasSeedData: false,
        currentBatchId: null,
        recordCount: 0,
      };
    }
  }

  /**
   * Valida a consistência entre seeds e banco de dados
   */
  async validateConsistency(): Promise<{
    consistent: boolean;
    discrepancies: Array<{ module: string; expected: number; actual: number }>;
  }> {
    const seededRecords = seedAllRecords();
    const discrepancies: Array<{ module: string; expected: number; actual: number }> = [];

    for (const [key, records] of Object.entries(seededRecords)) {
      const moduleKey = key as ModuleKey;
      const tableName = this.getTableName(moduleKey);

      try {
        const { count, error } = await supabaseIndustrial
          .from(tableName)
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error(`Failed to count ${tableName}:`, error);
          continue;
        }

        const actualCount = count || 0;
        const expectedCount = records.length;

        if (actualCount !== expectedCount) {
          discrepancies.push({
            module: moduleKey,
            expected: expectedCount,
            actual: actualCount,
          });
        }
      } catch (error) {
        console.error(`Failed to validate ${moduleKey}:`, error);
      }
    }

    return {
      consistent: discrepancies.length === 0,
      discrepancies,
    };
  }
}

// Export singleton instance
export const seedDeploymentManager = new SeedDeploymentManager();
