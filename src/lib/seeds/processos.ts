import type { ModuleRecord } from "@/lib/store";

export function seedProcessos(): ModuleRecord[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Bordar Tampo da Capa (Seq 10)",
      meta: {
        descricao: "Bordado contínuo no tampo da capa",
        setor: "Costura e Bordado",
        tempo: "15",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Fechamento Lateral e Cinto (Seq 20)",
      meta: {
        descricao: "Unir tampo ao molejo",
        setor: "Montagem e Fechamento",
        tempo: "10",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Corte de Espuma CNC (Seq 05)",
      meta: {
        descricao: "Corte preciso de blocos de espuma",
        setor: "Espumação Contínua",
        tempo: "8",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Montagem de Núcleo Pocket (Seq 15)",
      meta: {
        descricao: "Montagem do núcleo de molas",
        setor: "Montagem e Fechamento",
        tempo: "12",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Inspeção de Qualidade (Seq 30)",
      meta: {
        descricao: "Verificação final do produto",
        setor: "Controle de Qualidade",
        tempo: "5",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Embalagem e Etiquetagem (Seq 35)",
      meta: {
        descricao: "Embalagem final e etiquetas",
        setor: "Embalagem e Expedição",
        tempo: "7",
      },
      createdAt: Date.now(),
    },
  ];
}
