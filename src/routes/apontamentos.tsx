import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, PlayCircle, Pencil, Trash2, Clock, User, Cog, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ModuleHeader } from "@/components/module-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IndustrialAgent } from "@/components/industrial-copilot";
import { MODULES } from "@/lib/modules";
import { addRecord, removeRecord, updateRecord, useStore, type ModuleRecord } from "@/lib/store";
import { cn } from "@/lib/utils";

const mod = MODULES.find((m) => m.key === "apontamentos")!;

export const Route = createFileRoute("/apontamentos")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Draft = {
  op: string;
  processo: string;
  equipamento: string;
  operador: string;
  horaInicio: string;
  horaFim: string;
  quantidadeProduzida: string;
  refugo: string;
  motivoParada: string;
  observacoes: string;
};

const empty: Draft = {
  op: "",
  processo: "",
  equipamento: "",
  operador: "",
  horaInicio: "",
  horaFim: "",
  quantidadeProduzida: "",
  refugo: "0",
  motivoParada: "",
  observacoes: "",
};

function Page() {
  const records = useStore((s) => s.records["apontamentos"] || []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(empty);

  const handleSave = () => {
    if (!draft.op || !draft.processo || !draft.operador) return;

    const record: ModuleRecord = {
      id: crypto.randomUUID(),
      name: draft.op,
      meta: {
        op: draft.op,
        processo: draft.processo,
        equipamento: draft.equipamento,
        operador: draft.operador,
        hora_inicio: draft.horaInicio,
        hora_fim: draft.horaFim,
        quantidade_produzida: draft.quantidadeProduzida,
        refugo: draft.refugo,
        motivo_parada: draft.motivoParada,
        observacoes: draft.observacoes,
      },
      createdAt: Date.now(),
    };

    if (editing) {
      updateRecord("apontamentos", editing, record);
    } else {
      addRecord("apontamentos", record.name, record.meta);
    }

    setOpen(false);
    setEditing(null);
    setDraft(empty);
  };

  const handleEdit = (r: ModuleRecord) => {
    setDraft({
      op: r.meta.op as string || "",
      processo: r.meta.processo as string || "",
      equipamento: r.meta.equipamento as string || "",
      operador: r.meta.operador as string || "",
      horaInicio: r.meta.hora_inicio as string || "",
      horaFim: r.meta.hora_fim as string || "",
      quantidadeProduzida: r.meta.quantidade_produzida as string || "",
      refugo: r.meta.refugo as string || "0",
      motivoParada: r.meta.motivo_parada as string || "",
      observacoes: r.meta.observacoes as string || "",
    });
    setEditing(r.id);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este apontamento?")) {
      removeRecord("apontamentos", id);
    }
  };

  const getStatusBadge = (horaInicio: string, horaFim: string) => {
    if (!horaInicio) return <Badge variant="secondary">Planejado</Badge>;
    if (!horaFim) return <Badge variant="default" className="bg-blue-500">Em Andamento</Badge>;
    return <Badge variant="default" className="bg-green-500">Concluído</Badge>;
  };

  return (
    <div className="space-y-6">
      <ModuleHeader mod={mod} />

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {records.length} apontamento{records.length !== 1 ? "s" : ""} registrado{records.length !== 1 ? "s" : ""}
        </div>
        <Button onClick={() => { setDraft(empty); setEditing(null); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Apontamento
        </Button>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={PlayCircle}
          title="Nenhum apontamento registrado"
          description="Os apontamentos de produção são essenciais para rastrear o progresso das ordens de produção, calcular eficiência e identificar gargalos."
          benefit="Base para cálculo de custos reais, eficiência produtiva e rastreabilidade completa."
          checklist={[
            "Apontamentos por operação e equipamento",
            "Horas trabalhadas e tempo de setup",
            "Quantidade produzida e refugo",
            "Motivos de parada registrados",
          ]}
          primaryCta="Criar primeiro apontamento"
          onPrimary={() => { setDraft(empty); setEditing(null); setOpen(true); }}
        />
      ) : (
        <div className="border rounded-lg divide-y">
          {records.map((r) => (
            <div key={r.id} className="p-4 flex items-start justify-between hover:bg-muted/50 transition-colors">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{r.meta.op as string}</h3>
                  {getStatusBadge(r.meta.hora_inicio as string, r.meta.hora_fim as string)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Processo:</span>
                    <p className="font-medium">{r.meta.processo as string}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Equipamento:</span>
                    <p className="font-medium">{r.meta.equipamento as string || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Operador:</span>
                    <p className="font-medium">{r.meta.operador as string}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Horário:</span>
                    <p className="font-medium">
                      {r.meta.hora_inicio as string} → {r.meta.hora_fim as string || "Em andamento"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Produzido:</span>
                    <p className="font-medium text-green-600">{r.meta.quantidade_produzida as string} un</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Refugo:</span>
                    <p className="font-medium text-red-600">{r.meta.refugo as string} un</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Motivo Parada:</span>
                    <p className="font-medium">{r.meta.motivo_parada as string || "-"}</p>
                  </div>
                </div>
                {r.meta.observacoes && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Observações:</span>
                    <p className="text-muted-foreground">{r.meta.observacoes as string}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? "Editar Apontamento" : "Novo Apontamento"}</SheetTitle>
            <SheetDescription>
              Registre os detalhes do apontamento de produção para rastrear o progresso da OP.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Ordem de Produção *</Label>
              <Input
                value={draft.op}
                onChange={(e) => setDraft({ ...draft, op: e.target.value })}
                placeholder="Ex: OP-2024-001"
              />
            </div>
            <div className="space-y-2">
              <Label>Processo *</Label>
              <Select value={draft.processo} onValueChange={(v) => setDraft({ ...draft, processo: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o processo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corte">Corte de Espuma</SelectItem>
                  <SelectItem value="montagem">Montagem de Molas</SelectItem>
                  <SelectItem value="costura">Costura de Capa</SelectItem>
                  <SelectItem value="montagem-colchao">Montagem do Colchão</SelectItem>
                  <SelectItem value="acabamento">Acabamento Final</SelectItem>
                  <SelectItem value="embalagem">Embalagem</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Equipamento</Label>
              <Select value={draft.equipamento} onValueChange={(v) => setDraft({ ...draft, equipamento: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o equipamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maxfoam-xf2000">Máquina de Espumação MaxFoam XF-2000</SelectItem>
                  <SelectItem value="brother-pr670e">Bordadeira Brother PR670E</SelectItem>
                  <SelectItem value="juki-ddl8700">Fechadeira Juki DDL-8700</SelectItem>
                  <SelectItem value="corte-laser">Cortadora a Laser</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Operador *</Label>
              <Select value={draft.operador} onValueChange={(v) => setDraft({ ...draft, operador: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o operador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="joao-silva">João Silva</SelectItem>
                  <SelectItem value="maria-santos">Maria Santos</SelectItem>
                  <SelectItem value="carlos-oliveira">Carlos Oliveira</SelectItem>
                  <SelectItem value="ana-paula">Ana Paula</SelectItem>
                  <SelectItem value="roberto-costa">Roberto Costa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora Início</Label>
                <Input
                  type="time"
                  value={draft.horaInicio}
                  onChange={(e) => setDraft({ ...draft, horaInicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora Fim</Label>
                <Input
                  type="time"
                  value={draft.horaFim}
                  onChange={(e) => setDraft({ ...draft, horaFim: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade Produzida</Label>
                <Input
                  type="number"
                  value={draft.quantidadeProduzida}
                  onChange={(e) => setDraft({ ...draft, quantidadeProduzida: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Refugo</Label>
                <Input
                  type="number"
                  value={draft.refugo}
                  onChange={(e) => setDraft({ ...draft, refugo: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Motivo da Parada</Label>
              <Select value={draft.motivoParada} onValueChange={(v) => setDraft({ ...draft, motivoParada: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione se houve parada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem parada</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="falta-material">Falta de Material</SelectItem>
                  <SelectItem value="setup">Setup/Preparação</SelectItem>
                  <SelectItem value="qualidade">Problema de Qualidade</SelectItem>
                  <SelectItem value="operador">Ausência de Operador</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={draft.observacoes}
                onChange={(e) => setDraft({ ...draft, observacoes: e.target.value })}
                placeholder="Detalhes adicionais sobre o apontamento..."
                rows={3}
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              {editing ? "Atualizar Apontamento" : "Salvar Apontamento"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <IndustrialAgent moduleKey="apontamentos" />
    </div>
  );
}
