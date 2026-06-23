import type { ModuleRecord } from "@/lib/store";

export function seedSetores(): ModuleRecord[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Espumação Contínua",
      meta: {
        tipo: "Produção",
        unidade: "Matriz",
        responsavel: "Eng. Marcos Souza",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Costura e Bordado",
      meta: {
        tipo: "Produção",
        unidade: "Matriz",
        responsavel: "Renata Lima",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Montagem e Fechamento",
      meta: {
        tipo: "Produção",
        unidade: "Matriz",
        responsavel: "Julio Cesar",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Embalagem e Expedição",
      meta: {
        tipo: "Estoque",
        unidade: "Matriz",
        responsavel: "Silvia Helena",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Almoxarifado",
      meta: {
        tipo: "Estoque",
        unidade: "Matriz",
        responsavel: "Carlos Eduardo",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Controle de Qualidade",
      meta: {
        tipo: "Qualidade",
        unidade: "Matriz",
        responsavel: "Ana Paula",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Manutenção Industrial",
      meta: {
        tipo: "Apoio",
        unidade: "Matriz",
        responsavel: "Roberto Santos",
      },
      createdAt: Date.now(),
    },
  ];
}
