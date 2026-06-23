import type { ModuleRecord } from "@/lib/store";

export function seedFornecedores(): ModuleRecord[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Dow Chemical Brasil Ltda",
      meta: {
        cnpj: "12.345.678/0001-99",
        contato: "João Silva",
        telefone: "(11) 3456-7890",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Flexitex Tecidos Ltda",
      meta: {
        cnpj: "98.765.432/0001-11",
        contato: "Maria Santos",
        telefone: "(11) 2345-6789",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Coats Brasil Ltda",
      meta: {
        cnpj: "45.678.901/0001-22",
        contato: "Pedro Oliveira",
        telefone: "(11) 3456-1234",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Henkel Brasil Ltda",
      meta: {
        cnpj: "67.890.123/0001-33",
        contato: "Ana Costa",
        telefone: "(11) 2345-5678",
      },
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      name: "Vulcabrás do Brasil",
      meta: {
        cnpj: "23.456.789/0001-44",
        contato: "Carlos Mendes",
        telefone: "(11) 3456-9012",
      },
      createdAt: Date.now(),
    },
  ];
}
