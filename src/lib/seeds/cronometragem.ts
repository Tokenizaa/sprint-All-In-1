import type { ModuleRecord } from "@/lib/store";

export function seedCronometragem(): ModuleRecord[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Costura Tampo Casal",
      meta: {
        tempoCronometrado: "180",
        tempoPadrao: "201.6",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Fechamento Colchão Casal",
      meta: {
        tempoCronometrado: "240",
        tempoPadrao: "262.2",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Corte Espuma CNC",
      meta: {
        tempoCronometrado: "95",
        tempoPadrao: "104.5",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Montagem Núcleo Pocket",
      meta: {
        tempoCronometrado: "145",
        tempoPadrao: "159.5",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Inspeção Qualidade",
      meta: {
        tempoCronometrado: "60",
        tempoPadrao: "66",
      },
      createdAt: Date.now(),
    },
  ];
}
