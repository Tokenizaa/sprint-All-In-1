import type { ModuleRecord } from "@/lib/store";

export function seedBom(): ModuleRecord[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "BOM Colchão Pocket Casal - Molejo",
      meta: {
        descricao: "Usa 1 Núcleo Pocket Montado no produto COL-CAS-POC-01",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "BOM Colchão Pocket Casal - Capa",
      meta: {
        descricao: "Usa 1 Capa Bordada Casal no produto COL-CAS-POC-01",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "BOM Capa - Tecido Bordado",
      meta: {
        descricao: "Consome 3.5m de tecido Jacquard (perda 5%) na Capa CMP-CAP-CAS",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "BOM Colchão Espuma King - Núcleo",
      meta: {
        descricao: "Usa 1 Bloco Espuma D45 no produto COL-KIN-ESP-02",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "BOM Colchão Espuma King - Capa",
      meta: {
        descricao: "Usa 1 Capa Seda King no produto COL-KIN-ESP-02",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "BOM Núcleo Pocket - Molejo",
      meta: {
        descricao: "Consome 2.5m² de molejo Pocket no Núcleo CMP-NUC-MOL",
      },
      createdAt: Date.now(),
    },
  ];
}
