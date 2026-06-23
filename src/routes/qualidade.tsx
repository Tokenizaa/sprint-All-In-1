import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ShieldCheck, Pencil, Trash2, AlertTriangle, CheckCircle2, XCircle, FileText, Clock } from "lucide-react";
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

const mod = MODULES.find((m) => m.key === "qualidade");

if (!mod) {
  throw new Error("Módulo 'qualidade' não encontrado em MODULES");
}

export const Route = createFileRoute("/qualidade")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Draft = {
  op: string;
  tipo: string;
  resultado: string;
  data: string;
  inspetor: string;
  processo: string;
  naoConformidade: string;
  acaoCorretiva: string;
  retrabalho: string;
  observacoes: string;
};

const empty: Draft = {
  op: "",
  tipo: "inspecao",
  resultado: "aprovado",
  data: new Date().toISOString().split('T')[0],
  inspetor: "",
  processo: "",
  naoConformidade: "",
  acaoCorretiva: "",
  retrabalho: "nao",
  observacoes: "",
};

function Page() {
  const records = useStore((s) => s.records["qualidade"] || []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(empty);

  const handleSave = () => {
    if (!draft.op || !draft.inspetor) return;

    const record: ModuleRecord = {
      id: crypto.randomUUID(),
      name: draft.op,
      meta: {
        op: draft.op,
        tipo: draft.tipo,
        resultado: draft.resultado,
        data: draft.data,
        inspetor: draft.inspetor,
        processo: draft.processo,
        nao_conformidade: draft.naoConformidade,
        acao_corretiva: draft.acaoCorretiva,
        retrabalho: draft.retrabalho,
        observacoes: draft.observacoes,
      },
      createdAt: Date.now(),
    };

    if (editing) {
      updateRecord("qualidade", editing, record);
    } else {
      addRecord("qualidade", record.name, record.meta);
    }

    setOpen(false);
    setEditing(null);
    setDraft(empty);
  };

  const handleEdit = (r: ModuleRecord) => {
    setDraft({
      op: r.meta.op as string || "",
      tipo: r.meta.tipo as string || "inspecao",
      resultado: r.meta.resultado as string || "aprovado",
      data: r.meta.data as string || new Date().toISOString().split('T')[0],
      inspetor: r.meta.inspetor as string || "",
      processo: r.meta.processo as string || "",
      naoConformidade: r.meta.nao_conformidade as string || "",
      acaoCorretiva: r.meta.acao_corretiva as string || "",
      retrabalho: r.meta.retrabalho as string || "nao",
      observacoes: r.meta.observacoes as string || "",
    });
    setEditing(r.id);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este registro de qualidade?")) {
      removeRecord("qualidade", id);
    }
  };

  const getResultBadge = (resultado: string) => {
    switch (resultado) {
      case "aprovado": return <Badge variant="default" className="bg-green-500">Aprovado</Badge>;
      case "reprovado": return <Badge variant="destructive">Reprovado</Badge>;
      case "pendente": return <Badge variant="secondary">Pendente</Badge>;
      default: return <Badge variant="outline">{resultado}</Badge>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "inspecao": return <Badge variant="outline" className="border-blue-500 text-blue-500">Inspeção</Badge>;
      case "nao-conformidade": return <Badge variant="destructive">Não Conformidade</Badge>;
      case "retrabalho": return <Badge variant="default" className="bg-orange-500">Retrabalho</Badge>;
      case "aprovacao-final": return <Badge variant="default" className="bg-purple-500">Aprovação Final</Badge>;
      default: return <Badge variant="outline">{tipo}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <ModuleHeader mod={mod} />

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {records.length} registro{records.length !== 1 ? "s" : ""} de qualidade
        </div>
        <Button onClick={() => { setDraft(empty); setEditing(null); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Inspeção
        </Button>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Nenhuma inspeção registrada"
          description="O controle de qualidade é essencial para garantir a conformidade dos produtos, reduzir retrabalho e manter histórico de problemas."
          benefit="Garante a qualidade do produto final, reduz retrabalho e mantém histórico de problemas para análise contínua."
          checklist={[
            "Inspeções por OP e processo",
            "Não conformidades registradas",
            "Ações corretivas documentadas",
            "Aprovações finais de lote",
          ]}
          primaryCta="Criar primeira inspeção"
          onPrimary={() => { setDraft(empty); setEditing(null); setOpen(true); }}
        />
      ) : (
        <div className="border rounded-lg divide-y">
          {records.map((r) => (
            <div key={r.id} className="p-4 flex items-start justify-between hover:bg-muted/50 transition-colors">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold">{r.meta.op as string}</h3>
                  {getTipoBadge(r.meta.tipo as string)}
                  {getResultBadge(r.meta.resultado as string)}
                  <Badge variant="outline">{r.meta.data as string}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Inspetor:</span>
                    <p className="font-medium">{r.meta.inspetor as string}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Processo:</span>
                    <p className="font-medium">{r.meta.processo as string || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Retrabalho:</span>
                    <p className="font-medium">{r.meta.retrabalho === "sim" ? "Sim" : "Não"}</p>
                  </div>
                </div>
                {r.meta.nao_conformidade && (
                  <div className="text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      Não Conformidade:
                    </span>
                    <p className="text-orange-600 font-medium">{r.meta.nao_conformidade as string}</p>
                  </div>
                )}
                {r.meta.acao_corretiva && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Ação Corretiva:</span>
                    <p className="text-muted-foreground">{r.meta.acao_corretiva as string}</p>
                  </div>
                )}
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
            <SheetTitle>{editing ? "Editar Registro" : "Nova Inspeção"}</SheetTitle>
            <SheetDescription>
              Registre inspeções, não conformidades e ações corretivas durante a produção.
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
              <Label>Tipo de Registro *</Label>
              <Select value={draft.tipo} onValueChange={(v) => setDraft({ ...draft, tipo: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspecao">Inspeção</SelectItem>
                  <SelectItem value="nao-conformidade">Não Conformidade</SelectItem>
                  <SelectItem value="retrabalho">Retrabalho</SelectItem>
                  <SelectItem value="aprovacao-final">Aprovação Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Resultado *</Label>
              <Select value={draft.resultado} onValueChange={(v) => setDraft({ ...draft, resultado: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="reprovado">Reprovado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={draft.data}
                  onChange={(e) => setDraft({ ...draft, data: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Processo</Label>
                <Select value={draft.processo} onValueChange={(v) => setDraft({ ...draft, processo: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Não especificado</SelectItem>
                    <SelectItem value="corte">Corte</SelectItem>
                    <SelectItem value="montagem">Montagem</SelectItem>
                    <SelectItem value="costura">Costura</SelectItem>
                    <SelectItem value="acabamento">Acabamento</SelectItem>
                    <SelectItem value="embalagem">Embalagem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Inspetor *</Label>
              <Select value={draft.inspetor} onValueChange={(v) => setDraft({ ...draft, inspetor: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o inspetor" />
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
            <div className="space-y-2">
              <Label>Não Conformidade</Label>
              <Textarea
                value={draft.naoConformidade}
                onChange={(e) => setDraft({ ...draft, naoConformidade: e.target.value })}
                placeholder="Descreva o problema encontrado..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Ação Corretiva</Label>
              <Textarea
                value={draft.acaoCorretiva}
                onChange={(e) => setDraft({ ...draft, acaoCorretiva: e.target.value })}
                placeholder="Ação tomada para corrigir o problema..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Retrabalho</Label>
              <Select value={draft.retrabalho} onValueChange={(v) => setDraft({ ...draft, retrabalho: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao">Não</SelectItem>
                  <SelectItem value="sim">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={draft.observacoes}
                onChange={(e) => setDraft({ ...draft, observacoes: e.target.value })}
                placeholder="Detalhes adicionais..."
                rows={3}
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              {editing ? "Atualizar Registro" : "Salvar Inspeção"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <IndustrialAgent moduleKey="qualidade" />
    </div>
  );
}
