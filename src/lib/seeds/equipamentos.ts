import type { ModuleRecord } from "@/lib/store";

export function seedEquipamentos(): ModuleRecord[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Máquina de Espumação MaxFoam",
      meta: {
        fabricante: "MaxFoam",
        modelo: "XF-2000",
        capacidade: "150 kg/min",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Bordadeira Computadorizada Multiagulhas",
      meta: {
        fabricante: "Brother",
        modelo: "PR670E",
        capacidade: "40 m/h",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Fechadeira de Colchões Semiautomática",
      meta: {
        fabricante: "Juki",
        modelo: "DDL-8700",
        capacidade: "20 pcs/h",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Cortadeira de Espuma CNC",
      meta: {
        fabricante: "CNC Foam",
        modelo: "FC-500",
        capacidade: "100 cortes/h",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Máquina de Costura Industrial",
      meta: {
        fabricante: "Singer",
        modelo: "S-2000",
        capacidade: "30 pcs/h",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Empacotadeira Automática",
      meta: {
        fabricante: "PackMaster",
        modelo: "PM-300",
        capacidade: "50 pcs/h",
      },
      createdAt: Date.now(),
    },
  ];
}
