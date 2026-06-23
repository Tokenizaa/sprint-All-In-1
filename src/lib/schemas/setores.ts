import { z } from "zod";

export const setorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.string().optional(),
  responsavel: z.string().optional(),
  descricao: z.string().optional(),
});

export type SetorFormData = z.infer<typeof setorSchema>;
