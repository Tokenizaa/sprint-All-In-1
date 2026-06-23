import { z } from "zod";

export const empresaSchema = z.object({
  razaoSocial: z.string().min(1, "Razão Social é obrigatória"),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().optional(),
  inscricaoEstadual: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  website: z.string().url("Website inválido").optional().or(z.literal("")),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, "Estado deve ter 2 caracteres").optional(),
  pais: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export type EmpresaFormData = z.infer<typeof empresaSchema>;
