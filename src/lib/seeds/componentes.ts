import type { ModuleRecord } from "@/lib/store";

export function seedComponentes(): ModuleRecord[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Capa Costurada Jacquard Casal",
      meta: {
        codigo: "CMP-CAP-CAS",
        custo: "120.00",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Núcleo Montado Pocket 138x188",
      meta: {
        codigo: "CMP-NUC-MOL",
        custo: "240.00",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Capa Costurada Seda Solteiro",
      meta: {
        codigo: "CMP-CAP-SOL",
        custo: "95.00",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Núcleo Montado Bonel 99x188",
      meta: {
        codigo: "CMP-NUC-BON",
        custo: "180.00",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Capa Costurada Percale Queen",
      meta: {
        codigo: "CMP-CAP-QUE",
        custo: "110.00",
      },
      createdAt: Date.now(),
    },
  ];
}
