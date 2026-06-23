import { z } from "zod";

export const funcionarioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cargo: z.string().optional(),
  turno: z.string().optional(),
  centroCusto: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  dataAdmissao: z.string().optional(),
  salario: z.string().optional(),
});

export type FuncionarioFormData = z.infer<typeof funcionarioSchema>;
