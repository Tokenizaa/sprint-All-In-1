import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { ServiceResult } from "./types";
import type { ModuleKey } from "@/lib/modules";

export interface ModuleConfiguration {
  id: string;
  module_key: ModuleKey;
  visible_in_menu: boolean;
  maturity_level: "starter" | "growth" | "mature";
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UpdateModuleConfigurationInput {
  visible_in_menu?: boolean;
  maturity_level?: "starter" | "growth" | "mature";
  config?: Record<string, any>;
}

export class ModuleConfigurationService {
  /**
   * Busca todas as configurações de módulos
   */
  async getAll(): Promise<ServiceResult<ModuleConfiguration[]>> {
    try {
      const { data, error } = await supabase
        .from("module_configurations")
        .select("*")
        .order("module_key", { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as ModuleConfiguration[],
      };
    } catch (error) {
      console.error("Erro ao buscar configurações de módulos:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Busca configuração de um módulo específico
   */
  async getByModuleKey(moduleKey: ModuleKey): Promise<ServiceResult<ModuleConfiguration>> {
    try {
      const { data, error } = await supabase
        .from("module_configurations")
        .select("*")
        .eq("module_key", moduleKey)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as ModuleConfiguration,
      };
    } catch (error) {
      console.error(`Erro ao buscar configuração do módulo ${moduleKey}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Busca configurações visíveis no menu
   */
  async getVisible(): Promise<ServiceResult<ModuleConfiguration[]>> {
    try {
      const { data, error } = await supabase
        .from("module_configurations")
        .select("*")
        .eq("visible_in_menu", true)
        .order("module_key", { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as ModuleConfiguration[],
      };
    } catch (error) {
      console.error("Erro ao buscar módulos visíveis:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Busca configurações por nível de maturidade
   */
  async getByMaturityLevel(maturityLevel: "starter" | "growth" | "mature"): Promise<ServiceResult<ModuleConfiguration[]>> {
    try {
      const { data, error } = await supabase
        .from("module_configurations")
        .select("*")
        .eq("maturity_level", maturityLevel)
        .order("module_key", { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data as ModuleConfiguration[],
      };
    } catch (error) {
      console.error(`Erro ao buscar módulos do nível ${maturityLevel}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Atualiza configuração de um módulo
   */
  async update(moduleKey: ModuleKey, input: UpdateModuleConfigurationInput): Promise<ServiceResult<ModuleConfiguration>> {
    try {
      const { data, error } = await supabaseAdmin
        .from("module_configurations")
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq("module_key", moduleKey)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(`Módulo ${moduleKey} não encontrado`);
      }

      return {
        success: true,
        data: data as ModuleConfiguration,
      };
    } catch (error) {
      console.error(`Erro ao atualizar configuração do módulo ${moduleKey}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Mostra um módulo no menu
   */
  async showInMenu(moduleKey: ModuleKey): Promise<ServiceResult<ModuleConfiguration>> {
    return this.update(moduleKey, { visible_in_menu: true });
  }

  /**
   * Oculta um módulo no menu
   */
  async hideFromMenu(moduleKey: ModuleKey): Promise<ServiceResult<ModuleConfiguration>> {
    return this.update(moduleKey, { visible_in_menu: false });
  }

  /**
   * Mostra múltiplos módulos no menu
   */
  async showMultiple(moduleKeys: ModuleKey[]): Promise<ServiceResult<ModuleConfiguration[]>> {
    try {
      const results = await Promise.all(
        moduleKeys.map((key) => this.showInMenu(key))
      );

      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      if (failed.length > 0) {
        console.error("Alguns módulos não puderam ser mostrados:", failed);
      }

      return {
        success: successful.length === moduleKeys.length,
        data: successful.map((r) => r.data).filter(Boolean) as ModuleConfiguration[],
        error: failed.length > 0 ? `${failed.length} módulos não puderam ser mostrados` : undefined,
      };
    } catch (error) {
      console.error("Erro ao mostrar múltiplos módulos:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Oculta múltiplos módulos no menu
   */
  async hideMultiple(moduleKeys: ModuleKey[]): Promise<ServiceResult<ModuleConfiguration[]>> {
    try {
      const results = await Promise.all(
        moduleKeys.map((key) => this.hideFromMenu(key))
      );

      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      if (failed.length > 0) {
        console.error("Alguns módulos não puderam ser ocultados:", failed);
      }

      return {
        success: successful.length === moduleKeys.length,
        data: successful.map((r) => r.data).filter(Boolean) as ModuleConfiguration[],
        error: failed.length > 0 ? `${failed.length} módulos não puderam ser ocultados` : undefined,
      };
    } catch (error) {
      console.error("Erro ao ocultar múltiplos módulos:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Define o nível de maturidade de um módulo
   */
  async setMaturityLevel(moduleKey: ModuleKey, maturityLevel: "starter" | "growth" | "mature"): Promise<ServiceResult<ModuleConfiguration>> {
    return this.update(moduleKey, { maturity_level: maturityLevel });
  }

  /**
   * Atualiza configurações adicionais de um módulo
   */
  async updateConfig(moduleKey: ModuleKey, config: Record<string, any>): Promise<ServiceResult<ModuleConfiguration>> {
    return this.update(moduleKey, { config });
  }

  /**
   * Verifica se um módulo está visível no menu
   */
  async isVisibleInMenu(moduleKey: ModuleKey): Promise<boolean> {
    try {
      const result = await this.getByModuleKey(moduleKey);
      return result.success ? result.data.visible_in_menu : true;
    } catch {
      return true;
    }
  }

  /**
   * Reseta configurações para os valores padrão
   */
  async resetToDefaults(): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from("module_configurations")
        .delete()
        .neq("module_key", "never_match"); // Delete all

      if (error) throw error;

      // Reinsert default configurations - todos visíveis por padrão
      const { error: insertError } = await supabase
        .from("module_configurations")
        .insert([
          { module_key: "empresa", visible_in_menu: true, maturity_level: "starter", config: { required: true, group: "Estrutura" } },
          { module_key: "setores", visible_in_menu: true, maturity_level: "starter", config: { required: true, group: "Estrutura" } },
          { module_key: "funcionarios", visible_in_menu: true, maturity_level: "starter", config: { required: true, group: "Recursos" } },
          { module_key: "equipamentos", visible_in_menu: true, maturity_level: "starter", config: { required: true, group: "Recursos" } },
          { module_key: "ferramentas", visible_in_menu: true, maturity_level: "mature", config: { required: false, group: "Recursos" } },
          { module_key: "materias-primas", visible_in_menu: true, maturity_level: "starter", config: { required: true, group: "Catálogo" } },
          { module_key: "fornecedores", visible_in_menu: true, maturity_level: "starter", config: { required: true, group: "Catálogo" } },
          { module_key: "produtos", visible_in_menu: true, maturity_level: "starter", config: { required: true, group: "Catálogo" } },
          { module_key: "componentes", visible_in_menu: true, maturity_level: "mature", config: { required: false, group: "Engenharia" } },
          { module_key: "bom", visible_in_menu: true, maturity_level: "starter", config: { required: true, group: "Engenharia" } },
          { module_key: "processos", visible_in_menu: true, maturity_level: "growth", config: { required: true, group: "Engenharia" } },
          { module_key: "cronometragem", visible_in_menu: true, maturity_level: "mature", config: { required: false, group: "Engenharia" } },
          { module_key: "capacidade", visible_in_menu: true, maturity_level: "growth", config: { required: false, group: "Engenharia" } },
          { module_key: "ordens-producao", visible_in_menu: true, maturity_level: "starter", config: { required: true, group: "Operações" } },
          { module_key: "lotes", visible_in_menu: true, maturity_level: "growth", config: { required: false, group: "Operações" } },
          { module_key: "estoque-industrial", visible_in_menu: true, maturity_level: "starter", config: { required: true, group: "Operações" } },
          { module_key: "movimentacoes", visible_in_menu: true, maturity_level: "growth", config: { required: false, group: "Operações" } },
          { module_key: "apontamentos", visible_in_menu: true, maturity_level: "starter", config: { required: true, group: "Operações" } },
          { module_key: "consumo-materiais", visible_in_menu: true, maturity_level: "growth", config: { required: false, group: "Operações" } },
          { module_key: "producao-tempo-real", visible_in_menu: true, maturity_level: "mature", config: { required: false, group: "Operações" } },
          { module_key: "qualidade", visible_in_menu: true, maturity_level: "starter", config: { required: true, group: "Operações" } },
          { module_key: "rastreabilidade", visible_in_menu: true, maturity_level: "growth", config: { required: false, group: "Operações" } },
        ]);

      if (insertError) throw insertError;

      return { success: true };
    } catch (error) {
      console.error("Erro ao resetar configurações:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }
}

// Singleton instance
export const moduleConfigurationService = new ModuleConfigurationService();
