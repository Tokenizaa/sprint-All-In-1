import { z } from "zod";

export const produtoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
  sku: z.string().optional(),
  categoria: z.string().optional(),
  descricao: z.string().optional(),
  unidadeMedida: z.string().optional(),
  preco: z.string().optional(),
  estoqueMinimo: z.string().optional(),
  estoqueMaximo: z.string().optional(),
});

export type ProdutoFormData = z.infer<typeof produtoSchema>;
