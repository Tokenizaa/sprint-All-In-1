import type { ModuleRecord } from "@/lib/store";

export function seedFerramentas(): ModuleRecord[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Gabarito de Corte Espuma Casal D33",
      meta: {
        codigo: "GAB-C-01",
        local: "Prateleira A1",
        status: "Disponível",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Molde de Pillow Top King Size",
      meta: {
        codigo: "MOL-PT-03",
        local: "Rack B4",
        status: "Em uso",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Gabarito de Corte Espuma Solteiro D28",
      meta: {
        codigo: "GAB-C-02",
        local: "Prateleira A2",
        status: "Disponível",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Molde de Pillow Top Queen Size",
      meta: {
        codigo: "MOL-PT-04",
        local: "Rack B5",
        status: "Disponível",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Gabarito de Corte Espuma King D45",
      meta: {
        codigo: "GAB-C-03",
        local: "Prateleira A3",
        status: "Em uso",
      },
      createdAt: Date.now(),
    },
  ];
}
