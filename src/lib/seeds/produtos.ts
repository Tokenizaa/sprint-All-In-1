import type { ModuleRecord } from "@/lib/store";

export function seedProdutos(): ModuleRecord[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Colchão Mola Pocket Casal Premium",
      meta: {
        linha: "Premium",
        tamanho: "Casal (138x188cm)",
        categoria: "Colchão",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Colchão Espuma D33 King Luxo",
      meta: {
        linha: "Luxo",
        tamanho: "King (193x203cm)",
        categoria: "Colchão",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Colchão Mola Pocket Solteiro Standard",
      meta: {
        linha: "Standard",
        tamanho: "Solteiro (99x188cm)",
        categoria: "Colchão",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Colchão Espuma D28 Queen Confort",
      meta: {
        linha: "Confort",
        tamanho: "Queen (158x198cm)",
        categoria: "Colchão",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Colchão Mola Bonel Casal Econômico",
      meta: {
        linha: "Econômico",
        tamanho: "Casal (138x188cm)",
        categoria: "Colchão",
      },
      createdAt: Date.now(),
    },
  ];
}
