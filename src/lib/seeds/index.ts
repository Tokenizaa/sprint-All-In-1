import type { ModuleRecord } from "@/lib/store";
import { seedEmpresa } from "./empresa";
import { seedSetores } from "./setores";
import { seedFuncionarios } from "./funcionarios";
import { seedEquipamentos } from "./equipamentos";
import { seedFerramentas } from "./ferramentas";
import { seedMateriasPrimas } from "./materias-primas";
import { seedFornecedores } from "./fornecedores";
import { seedProdutos } from "./produtos";
import { seedComponentes } from "./componentes";
import { seedBom } from "./bom";
import { seedProcessos } from "./processos";
import { seedCronometragem } from "./cronometragem";
import { seedCapacidade } from "./capacidade";
import { seedOrdensProducao } from "./ordens-producao";
import { seedLotes } from "./lotes";
import { seedEstoqueIndustrial } from "./estoque-industrial";
import { seedMovimentacoes } from "./movimentacoes";
import { seedApontamentos } from "./apontamentos";
import { seedConsumoMateriais } from "./consumo-materiais";
import { seedQualidade } from "./qualidade";

export function seedAllRecords(): Record<string, ModuleRecord[]> {
  return {
    empresa: seedEmpresa(),
    setores: seedSetores(),
    funcionarios: seedFuncionarios(),
    equipamentos: seedEquipamentos(),
    ferramentas: seedFerramentas(),
    "materias-primas": seedMateriasPrimas(),
    fornecedores: seedFornecedores(),
    produtos: seedProdutos(),
    componentes: seedComponentes(),
    bom: seedBom(),
    processos: seedProcessos(),
    cronometragem: seedCronometragem(),
    capacidade: seedCapacidade(),
    "ordens-producao": seedOrdensProducao(),
    lotes: seedLotes(),
    "estoque-industrial": seedEstoqueIndustrial(),
    movimentacoes: seedMovimentacoes(),
    apontamentos: seedApontamentos(),
    "consumo-materiais": seedConsumoMateriais(),
    qualidade: seedQualidade(),
  };
}

export const companyName = "Ortobom Colchões Industriais Ltda.";
