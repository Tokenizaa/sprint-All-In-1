import type { ModuleRecord } from "@/lib/store";

export function seedFuncionarios(): ModuleRecord[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Carlos Alberto",
      meta: {
        cargo: "Operador de Espumação",
        turno: "Manhã",
        setor: "Espumação Contínua",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Ana Paula Silva",
      meta: {
        cargo: "Costureira Industrial",
        turno: "Manhã",
        setor: "Costura e Bordado",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Ricardo Santos",
      meta: {
        cargo: "Tapeceiro de Colchão",
        turno: "Tarde",
        setor: "Montagem e Fechamento",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Beatriz Oliveira",
      meta: {
        cargo: "Auxiliar de Expedição",
        turno: "Manhã",
        setor: "Embalagem e Expedição",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Fernando Costa",
      meta: {
        cargo: "Operador de Espumação",
        turno: "Tarde",
        setor: "Espumação Contínua",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Juliana Mendes",
      meta: {
        cargo: "Costureira Industrial",
        turno: "Tarde",
        setor: "Costura e Bordado",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Marcos Vieira",
      meta: {
        cargo: "Tapeceiro de Colchão",
        turno: "Noite",
        setor: "Montagem e Fechamento",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Patricia Lima",
      meta: {
        cargo: "Auxiliar de Almoxarifado",
        turno: "Manhã",
        setor: "Almoxarifado",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Roberto Alves",
      meta: {
        cargo: "Inspetor de Qualidade",
        turno: "Manhã",
        setor: "Controle de Qualidade",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Cristina Ferreira",
      meta: {
        cargo: "Técnica de Manutenção",
        turno: "Manhã",
        setor: "Manutenção Industrial",
      },
      createdAt: Date.now(),
    },
  ];
}
