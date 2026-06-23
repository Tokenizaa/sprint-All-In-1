import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Activity, Pencil, Trash2, Package, TrendingDown, AlertTriangle, FileText } from "lucide-react";
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

const mod = MODULES.find((m) => m.key === "consumo-materiais")!;

export const Route = createFileRoute("/consumo-materiais")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Draft = {
  op: string;
  material: string;
  quantidade: string;
  unidadeMedida: string;
  data: string;
  processo: string;
  quantidadePadrao: string;
  desperdicio: string;
  observacoes: string;
};

const empty: Draft = {
  op: "",
  material: "",
  quantidade: "",
  unidadeMedida: "kg",
  data: new Date().toISOString().split('T')[0],
  processo: "",
  quantidadePadrao: "",
  desperdicio: "0",
  observacoes: "",
};

function Page() {
  const records = useStore((s) => s.records["consumo-materiais"] || []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(empty);

  const handleSave = () => {
    if (!draft.op || !draft.material || !draft.quantidade) return;

    const desperdicio = draft.quantidadePadrao 
      ? (parseFloat(draft.quantidade) - parseFloat(draft.quantidadePadrao)).toFixed(2)
      : "0";

    const record: ModuleRecord = {
      id: crypto.randomUUID(),
      name: draft.op,
      meta: {
        op: draft.op,
        material: draft.material,
        quantidade: draft.quantidade,
        unidade_medida: draft.unidadeMedida,
        data: draft.data,
        processo: draft.processo,
        quantidade_padrao: draft.quantidadePadrao,
        desperdicio: desperdicio,
        observacoes: draft.observacoes,
      },
      createdAt: Date.now(),
    };

    if (editing) {
      updateRecord("consumo-materiais", editing, record);
    } else {
      addRecord("consumo-materiais", record.name, record.meta);
    }

    setOpen(false);
    setEditing(null);
    setDraft(empty);
  };

  const handleEdit = (r: ModuleRecord) => {
    setDraft({
      op: r.meta.op as string || "",
      material: r.meta.material as string || "",
      quantidade: r.meta.quantidade as string || "",
      unidadeMedida: r.meta.unidade_medida as string || "kg",
      data: r.meta.data as string || new Date().toISOString().split('T')[0],
      processo: r.meta.processo as string || "",
      quantidadePadrao: r.meta.quantidade_padrao as string || "",
      desperdicio: r.meta.desperdicio as string || "0",
      observacoes: r.meta.observacoes as string || "",
    });
    setEditing(r.id);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este registro de consumo?")) {
      removeRecord("consumo-materiais", id);
    }
  };

  const getDesperdicioBadge = (desperdicio: string) => {
    const val = parseFloat(desperdicio);
    if (val > 0) return <Badge variant="destructive" className="bg-red-500">+{desperdicio}</Badge>;
    if (val < 0) return <Badge variant="default" className="bg-green-500">{desperdicio}</Badge>;
    return <Badge variant="secondary">0</Badge>;
  };

  return (
    <div className="space-y-6">
      <ModuleHeader mod={mod} />

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {records.length} registro{records.length !== 1 ? "s" : ""} de consumo
        </div>
        <Button onClick={() => { setDraft(empty); setEditing(null); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Registrar Consumo
        </Button>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Nenhum consumo registrado"
          description="O registro de consumo de materiais é essencial para controlar custos, identificar desperdícios e calcular o rendimento da produção."
          benefit="Controle preciso de custos, identificação de desperdícios e cálculo de rendimento por OP."
          checklist={[
            "Consumo por OP e material",
            "Comparação com BOM padrão",
            "Identificação de desperdícios",
            "Cálculo de rendimento",
          ]}
          primaryCta="Registrar primeiro consumo"
          onPrimary={() => { setDraft(empty); setEditing(null); setOpen(true); }}
        />
      ) : (
        <div className="border rounded-lg divide-y">
          {records.map((r) => (
            <div key={r.id} className="p-4 flex items-start justify-between hover:bg-muted/50 transition-colors">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{r.meta.op as string}</h3>
                  <Badge variant="outline">{r.meta.data as string}</Badge>
                  {getDesperdicioBadge(r.meta.desperdicio as string)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Material:</span>
                    <p className="font-medium">{r.meta.material as string}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantidade:</span>
                    <p className="font-medium">{r.meta.quantidade as string} {r.meta.unidade_medida as string}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Padrão (BOM):</span>
                    <p className="font-medium">{r.meta.quantidade_padrao as string || "-"} {r.meta.unidade_medida as string}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Processo:</span>
                    <p className="font-medium">{r.meta.processo as string || "-"}</p>
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
            <SheetTitle>{editing ? "Editar Consumo" : "Registrar Consumo"}</SheetTitle>
            <SheetDescription>
              Registre o consumo de materiais durante a produção para controle de custos e identificação de desperdícios.
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
              <Label>Material *</Label>
              <Select value={draft.material} onValueChange={(v) => setDraft({ ...draft, material: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="espuma-d33">Espuma Densidade 33</SelectItem>
                  <SelectItem value="espuma-d25">Espuma Densidade 25</SelectItem>
                  <SelectItem value="tecido-algodoao">Tecido Algodão 100%</SelectItem>
                  <SelectItem value="mola-pocket">Mola Pocket Individual</SelectItem>
                  <SelectItem value="cola-industrial">Cola Industrial</SelectItem>
                  <SelectItem value="manta-acrilica">Manta Acrílica</SelectItem>
                  <SelectItem value="fio-costura">Fio de Costura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade Consumida *</Label>
                <Input
                  type="number"
                  value={draft.quantidade}
                  onChange={(e) => setDraft({ ...draft, quantidade: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Unidade de Medida</Label>
                <Select value={draft.unidadeMedida} onValueChange={(v) => setDraft({ ...draft, unidadeMedida: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="m">m</SelectItem>
                    <SelectItem value="un">un</SelectItem>
                    <SelectItem value="l">l</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Quantidade Padrão (BOM)</Label>
              <Input
                type="number"
                value={draft.quantidadePadrao}
                onChange={(e) => setDraft({ ...draft, quantidadePadrao: e.target.value })}
                placeholder="Quantidade esperada segundo BOM"
              />
              <p className="text-xs text-muted-foreground">Deixe vazio se não houver BOM definido</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
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
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={draft.observacoes}
                onChange={(e) => setDraft({ ...draft, observacoes: e.target.value })}
                placeholder="Detalhes sobre o consumo..."
                rows={3}
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              {editing ? "Atualizar Consumo" : "Salvar Consumo"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <IndustrialAgent moduleKey="consumo-materiais" />
    </div>
  );
}
