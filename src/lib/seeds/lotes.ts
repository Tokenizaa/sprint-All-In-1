import type { ModuleRecord } from "@/lib/store";

export function seedLotes(): ModuleRecord[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "L-2024-001",
      meta: {
        codigo: "L-2024-001",
        produto: "Colchão Mola Pocket Casal Premium",
        quantidade: 50,
        unidade_medida: "un",
        data_fabricacao: "2024-01-15",
        data_validade: null,
        ordem_producao: "OP-2024-001",
        operadores: ["João Silva", "Maria Santos"],
        equipamentos: ["Máquina de Espumação MaxFoam", "Fechadeira de Colchões"],
        observacoes: "Lote vinculado à OP prioritária",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "L-2024-002",
      meta: {
        codigo: "L-2024-002",
        produto: "Colchão Mola Pocket Solteiro Standard",
        quantidade: 100,
        unidade_medida: "un",
        data_fabricacao: "2024-01-05",
        data_validade: null,
        ordem_producao: "OP-2024-003",
        operadores: ["Carlos Oliveira", "Ana Paula"],
        equipamentos: ["Bordadeira Computadorizada", "Fechadeira de Colchões"],
        observacoes: "Lote de produção concluída",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "L-2024-003",
      meta: {
        codigo: "L-2024-003",
        produto: "Colchão Espuma D33 King Luxo",
        quantidade: 30,
        unidade_medida: "un",
        data_fabricacao: "2024-01-20",
        data_validade: null,
        ordem_producao: "OP-2024-002",
        operadores: ["Roberto Costa", "João Silva"],
        equipamentos: ["Máquina de Espumação MaxFoam"],
        observacoes: "Lote em produção",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "L-2024-004",
      meta: {
        codigo: "L-2024-004",
        produto: "Colchão Espuma D25 Casal Econômico",
        quantidade: 25,
        unidade_medida: "un",
        data_fabricacao: "2024-01-10",
        data_validade: null,
        ordem_producao: "OP-2024-004",
        operadores: ["Ana Paula"],
        equipamentos: ["Fechadeira de Colchões"],
        observacoes: "Lote parcial - produção pausada",
      },
      createdAt: Date.now(),
    },
  ];
}
