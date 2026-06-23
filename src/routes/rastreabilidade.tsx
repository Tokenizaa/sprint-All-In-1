import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Package, FileText, Users, Cog, Truck, ShieldCheck, ArrowRight, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ModuleHeader } from "@/components/module-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndustrialAgent } from "@/components/industrial-copilot";
import { MODULES } from "@/lib/modules";
import { useStore } from "@/lib/store";

const mod = MODULES.find((m) => m.key === "rastreabilidade");

if (!mod) {
  throw new Error("Módulo 'rastreabilidade' não encontrado em MODULES");
}

export const Route = createFileRoute("/rastreabilidade")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLote, setSelectedLote] = useState<any>(null);

  const lotes = useStore((s) => s.records["lotes"] || []);
  const ops = useStore((s) => s.records["ordens-producao"] || []);
  const movimentacoes = useStore((s) => s.records["movimentacoes"] || []);
  const apontamentos = useStore((s) => s.records["apontamentos"] || []);
  const qualidade = useStore((s) => s.records["qualidade"] || []);
  const estoque = useStore((s) => s.records["estoque-industrial"] || []);

  const handleSearch = () => {
    if (!searchTerm) return;

    const lote = lotes.find((l) => 
      l.meta.codigo?.toLowerCase() === searchTerm.toLowerCase() ||
      l.name.toLowerCase() === searchTerm.toLowerCase()
    );

    if (lote) {
      setSelectedLote(lote);
    } else {
      alert("Lote não encontrado");
    }
  };

  const getChainData = (lote: any) => {
    const op = ops.find((o) => o.meta.numero === lote.meta.op_origem);
    const opMovimentacoes = movimentacoes.filter((m) => m.meta.ordem_producao === lote.meta.op_origem);
    const opApontamentos = apontamentos.filter((a) => a.meta.op === lote.meta.op_origem);
    const opQualidade = qualidade.filter((q) => q.meta.op === lote.meta.op_origem);
    const materiasPrimas = lote.meta.materias_primas || [];

    return {
      op,
      movimentacoes: opMovimentacoes,
      apontamentos: opApontamentos,
      qualidade: opQualidade,
      materiasPrimas,
    };
  };

  return (
    <div className="space-y-6">
      <ModuleHeader mod={mod} />

      {!selectedLote ? (
        <>
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o código do lote (ex: L-2024-001)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>

            {lotes.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {lotes.length} lote{lotes.length !== 1 ? "s" : ""} cadastrado{lotes.length !== 1 ? "s" : ""}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {lotes.slice(0, 6).map((lote) => (
                <Card 
                  key={lote.id} 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedLote(lote)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{lote.meta.codigo as string}</CardTitle>
                    <CardDescription>{lote.meta.produto as string}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">OP:</span>
                        <span className="font-medium">{lote.meta.op_origem as string}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantidade:</span>
                        <span className="font-medium">{lote.meta.quantidade as string} un</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fabricação:</span>
                        <span className="font-medium">{lote.meta.data_fabricacao as string}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {lotes.length === 0 && (
            <EmptyState
              icon={Search}
              title="Nenhum lote cadastrado"
              description="A rastreabilidade permite visualizar a cadeia completa do produto: lote → OP → matérias-primas → fornecedores → equipamentos → operadores."
              benefit="Rastreabilidade total para recalls, auditorias e análise de problemas de qualidade."
              checklist={[
                "Rastreabilidade por lote",
                "Cadeia de fornecedores",
                "Histórico de operadores",
                "Registro de inspeções",
              ]}
              primaryCta="Cadastrar primeiro lote"
              onPrimary={() => { window.location.href = "/lotes"; }}
            />
          )}
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setSelectedLote(null)}>
              ← Voltar para busca
            </Button>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {selectedLote.meta.codigo as string}
            </Badge>
          </div>

          <ChainView lote={selectedLote} chainData={getChainData(selectedLote)} />
        </div>
      )}

      <IndustrialAgent moduleKey="rastreabilidade" selectedRecord={selectedLote} />
    </div>
  );
}

function ChainView({ lote, chainData }: { lote: any; chainData: any }) {
  return (
    <div className="space-y-6">
      {/* Produto */}
      <ChainNode
        icon={<Package className="w-5 h-5" />}
        title="Produto"
        data={[
          { label: "Código do Lote", value: lote.meta.codigo },
          { label: "Produto", value: lote.meta.produto },
          { label: "Quantidade", value: `${lote.meta.quantidade} un` },
          { label: "Data Fabricação", value: lote.meta.data_fabricacao },
          { label: "Validade", value: lote.meta.data_validade || "N/A" },
        ]}
      />

      <ArrowDown />

      {/* OP */}
      {chainData.op && (
        <>
          <ChainNode
            icon={<FileText className="w-5 h-5" />}
            title="Ordem de Produção"
            data={[
              { label: "Número", value: chainData.op.meta.numero },
              { label: "Status", value: chainData.op.meta.status },
              { label: "Prioridade", value: chainData.op.meta.prioridade },
              { label: "Responsável", value: chainData.op.meta.responsavel },
              { label: "Data Início", value: chainData.op.meta.data_inicio },
              { label: "Previsão", value: chainData.op.meta.data_previsao },
            ]}
          />
          <ArrowDown />
        </>
      )}

      {/* Matérias-Primas */}
      {chainData.materiasPrimas.length > 0 && (
        <>
          <ChainNode
            icon={<Package className="w-5 h-5" />}
            title="Matérias-Primas Utilizadas"
            data={chainData.materiasPrimas.map((mp: any) => ({
              label: mp.nome,
              value: `${mp.quantidade} ${mp.unidade}`,
            }))}
          />
          <ArrowDown />
        </>
      )}

      {/* Fornecedores (via movimentações) */}
      {chainData.movimentacoes.length > 0 && (
        <>
          <ChainNode
            icon={<Truck className="w-5 h-5" />}
            title="Fornecedores (via Movimentações)"
            data={chainData.movimentacoes
              .filter((m: any) => m.meta.tipo === "entrada")
              .map((m: any) => ({
                label: "Origem",
                value: m.meta.origem,
              }))}
          />
          <ArrowDown />
        </>
      )}

      {/* Equipamentos (via apontamentos) */}
      {chainData.apontamentos.length > 0 && (
        <>
          <ChainNode
            icon={<Cog className="w-5 h-5" />}
            title="Equipamentos Utilizados"
            data={chainData.apontamentos.map((a: any) => ({
              label: a.meta.processo,
              value: a.meta.equipamento || "N/A",
            }))}
          />
          <ArrowDown />
        </>
      )}

      {/* Operadores (via apontamentos) */}
      {chainData.apontamentos.length > 0 && (
        <>
          <ChainNode
            icon={<Users className="w-5 h-5" />}
            title="Operadores"
            data={chainData.apontamentos.map((a: any) => ({
              label: a.meta.processo,
              value: a.meta.operador,
            }))}
          />
          <ArrowDown />
        </>
      )}

      {/* Inspeções de Qualidade */}
      {chainData.qualidade.length > 0 && (
        <>
          <ChainNode
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Inspeções de Qualidade"
            data={chainData.qualidade.map((q: any) => ({
              label: `${q.meta.data} - ${q.meta.tipo}`,
              value: q.meta.resultado,
            }))}
          />
        </>
      )}
    </div>
  );
}

function ChainNode({ icon, title, data }: { icon: React.ReactNode; title: string; data: Array<{ label: string; value: string }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}:</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ArrowDown() {
  return (
    <div className="flex justify-center">
      <ChevronRight className="w-6 h-6 text-muted-foreground rotate-90" />
    </div>
  );
}
