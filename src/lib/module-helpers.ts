import type { ModuleRecord } from "./store";

/**
 * Converte um objeto draft para o formato meta (Record<string, string>)
 * Exclui o campo 'name' e campos vazios
 */
export function toMeta<T extends Record<string, any>>(draft: T, excludeFields: string[] = ["name"]): Record<string, string> {
  const meta: Record<string, string> = {};
  for (const [key, value] of Object.entries(draft)) {
    if (excludeFields.includes(key)) continue;
    if (typeof value === "string" && value) {
      meta[key] = value;
    } else if (value !== undefined && value !== null) {
      meta[key] = String(value);
    }
  }
  return meta;
}

/**
 * Converte um ModuleRecord para um objeto draft
 * Preenche com valores vazios para campos não existentes
 */
export function fromRecord<T extends Record<string, any>>(
  record: ModuleRecord,
  empty: T,
  jsonFields: string[] = []
): T {
  const meta = record.meta || {};
  const draft: any = { ...empty, name: record.name };

  for (const [key, value] of Object.entries(meta)) {
    if (jsonFields.includes(key)) {
      try {
        draft[key] = JSON.parse(value);
      } catch {
        draft[key] = value;
      }
    } else {
      draft[key] = value;
    }
  }

  return draft as T;
}

/**
 * Cria um objeto vazio baseado em um tipo
 */
export function createEmpty<T extends Record<string, any>>(defaults: Partial<T> = {}): T {
  return { ...defaults } as T;
}
