import { z } from "zod";

export const equipamentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
  fabricante: z.string().optional(),
  modelo: z.string().optional(),
  numeroSerie: z.string().optional(),
  dataAquisicao: z.string().optional(),
  valorAquisicao: z.string().optional(),
  localizacao: z.string().optional(),
  status: z.string().optional(),
  capacidadeHoraria: z.string().optional(),
});

export type EquipamentoFormData = z.infer<typeof equipamentoSchema>;
