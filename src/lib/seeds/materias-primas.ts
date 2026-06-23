import type { ModuleRecord } from "@/lib/store";

export function seedMateriasPrimas(): ModuleRecord[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Bloco de Espuma Poliuretano D33",
      meta: {
        categoria: "Espuma",
        unidade: "m³",
        fornecedor: "Dow Chemical Brasil Ltda",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Bloco de Espuma Poliuretano D28",
      meta: {
        categoria: "Espuma",
        unidade: "m³",
        fornecedor: "Dow Chemical Brasil Ltda",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Bloco de Espuma Poliuretano D45",
      meta: {
        categoria: "Espuma",
        unidade: "m³",
        fornecedor: "Dow Chemical Brasil Ltda",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Molejo Ensacado Pocket (m2)",
      meta: {
        categoria: "Mola",
        unidade: "m²",
        fornecedor: "Dow Chemical Brasil Ltda",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Molejo Ensacado Bonel (m2)",
      meta: {
        categoria: "Mola",
        unidade: "m²",
        fornecedor: "Dow Chemical Brasil Ltda",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Tecido Jacquard Bordado Malha",
      meta: {
        categoria: "Tecido",
        unidade: "m",
        fornecedor: "Flexitex Tecidos Ltda",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Tecido Seda Premium",
      meta: {
        categoria: "Tecido",
        unidade: "m",
        fornecedor: "Flexitex Tecidos Ltda",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Tecido Percale Algodão",
      meta: {
        categoria: "Tecido",
        unidade: "m",
        fornecedor: "Flexitex Tecidos Ltda",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Fio Poliéster 100%",
      meta: {
        categoria: "Linha",
        unidade: "kg",
        fornecedor: "Coats Brasil Ltda",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Cola Espuma Solvente",
      meta: {
        categoria: "Químico",
        unidade: "L",
        fornecedor: "Henkel Brasil Ltda",
      },
      createdAt: Date.now(),
    },
  ];
}
