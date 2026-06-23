import type { ModuleRecord } from "@/lib/store";

export function seedCapacidade(): ModuleRecord[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Capacidade Bordadeira - Junho",
      meta: {
        disponivel: "16",
        ocupado: "12",
        eficiencia: "90",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Capacidade Fechadeira - Junho",
      meta: {
        disponivel: "16",
        ocupado: "8",
        eficiencia: "85",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Capacidade Espumação - Junho",
      meta: {
        disponivel: "24",
        ocupado: "18",
        eficiencia: "92",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Capacidade Cortadeira CNC - Junho",
      meta: {
        disponivel: "16",
        ocupado: "10",
        eficiencia: "88",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Capacidade Empacotadeira - Junho",
      meta: {
        disponivel: "16",
        ocupado: "14",
        eficiencia: "95",
      },
      createdAt: Date.now(),
    },
  ];
}
