import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, GitBranch, Trash2, Pencil, ChevronRight, ChevronDown, Check, FolderTree, DollarSign, History, BarChart3, Layers, ArrowRight, Tag, Activity } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ModuleHeader } from "@/components/module-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { IndustrialAgent } from "@/components/industrial-copilot";
import { MODULES } from "@/lib/modules";
import { addRecord, removeRecord, updateRecord, useStore, type ModuleRecord } from "@/lib/store";
import { cn } from "@/lib/utils";

const mod = MODULES.find((m) => m.key === "bom")!;

export const Route = createFileRoute("/bom")({
  head: () => ({ meta: [{ title: `${mod.title} — Industrial OS` }, { name: "description", content: mod.description }] }),
  component: () => <AppShell><Page /></AppShell>,
});

type Node = { id: string; nome: string; qtd: string; unidade: string; custo: string; children: Node[] };
const newNode = (): Node => ({ id: crypto.randomUUID(), nome: "", qtd: "1", unidade: "un", custo: "0", children: [] });

function Page() {
  const records = useStore((s) => s.records.bom);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ModuleHeader mod={mod} action={records.length > 0 && (
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> {mod.primaryCta}
        </Button>
      )} />

      <IndustrialAgent moduleKey="bom" />
      {records.length === 0 ? (
        <EmptyState icon={mod.icon} title={`Comece pelo módulo ${mod.title}`} description={mod.description}
          benefit={mod.benefit} checklist={mod.checklist} primaryCta={mod.primaryCta}
          onPrimary={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {records.map((r) => {
              const tree: Node | null = (() => { try { return JSON.parse(r.meta?.tree_json ?? "null"); } catch { return null; } })();
              return (
                <article key={r.id} className="surface-elevated rounded-xl p-5">
                  <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                        <GitBranch className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold">{r.name}</h3>
                        <p className="truncate text-xs text-muted-foreground">{countNodes(tree)} níveis · árvore de materiais</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setOpen(true); }} className="gap-1.5"><Pencil className="size-3.5" />Editar</Button>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => { if (confirm(`Remover "${r.name}"?`)) removeRecord("bom", r.id); }}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </header>
                  {tree && (
                    <>
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <CostCard label="Custo Total" value={calculateTotalCost(tree)} icon={DollarSign} />
                        <CostCard label="Componentes" value={countNodes(tree).toString()} icon={Layers} />
                        <CostCard label="Níveis" value={calculateMaxDepth(tree).toString()} icon={GitBranch} />
                      </div>
                      <div className="mt-4 rounded-lg border border-border bg-muted/20 p-3 font-mono text-sm">
                        <TreeView node={tree} depth={0} />
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>

          <aside className="space-y-4">
            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <History className="size-3.5" /> Histórico de Versões
              </div>
              <div className="mt-4 space-y-2">
                <BOMVersion version="v1.2" date="05/06/2026" changes="Atualização custo espuma" />
                <BOMVersion version="v1.1" date="20/05/2026" changes="Adição componente novo" />
                <BOMVersion version="v1.0" date="10/01/2026" changes="Versão inicial" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Layers className="size-3.5" /> Alternativas/Substitutos
              </div>
              <div className="mt-4 space-y-2">
                <AlternativeItem name="Espuma D28" original="Espuma D33" savings="R$ 15,00" />
                <AlternativeItem name="Tecido Sintético" original="Tecido Algodão" savings="R$ 25,00" />
                <AlternativeItem name="Mola Bonnell" original="Mola Pocket" savings="R$ 40,00" />
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Activity className="size-3.5" /> Impacto em Capacidade
              </div>
              <div className="mt-4 space-y-2">
                <CapacityImpact process="Corte" current={85} projected={92} />
                <CapacityImpact process="Montagem" current={78} projected={85} />
                <CapacityImpact process="Acabamento" current={90} projected={90} />
              </div>
            </div>
          </aside>
        </div>
      )}
      <BomEditor open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function countNodes(n: Node | null): number {
  if (!n) return 0;
  return 1 + n.children.reduce((a, c) => a + countNodes(c), 0);
}

function calculateTotalCost(n: Node | null): string {
  if (!n) return "R$ 0,00";
  const nodeCost = Number(n.custo) || 0;
  const childrenCost = n.children.reduce((a, c) => a + Number(calculateTotalCost(c).replace(/[^\d,]/g, "").replace(",", ".")), 0);
  const total = nodeCost + childrenCost;
  return `R$ ${total.toFixed(2).replace(".", ",")}`;
}

function calculateMaxDepth(n: Node | null): number {
  if (!n) return 0;
  if (n.children.length === 0) return 1;
  return 1 + Math.max(...n.children.map(c => calculateMaxDepth(c)));
}

function CostCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof DollarSign }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" /> {label}
      </div>
      <div className="mt-1 font-mono text-sm font-semibold">{value}</div>
    </div>
  );
}

function TreeView({ node, depth }: { node: Node; depth: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasKids = node.children.length > 0;
  return (
    <div>
      <div className="flex items-center gap-1.5 py-0.5">
        {hasKids ? (
          <button onClick={() => setOpen((o) => !o)} className="text-muted-foreground hover:text-foreground">
            {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
        ) : <span className="w-3.5" />}
        <span className={cn("truncate", depth === 0 && "font-semibold text-primary")}>{node.nome || "(sem nome)"}</span>
        {node.qtd && <Badge variant="outline" className="ml-auto shrink-0 text-[10px]">{node.qtd} {node.unidade}</Badge>}
      </div>
      {hasKids && open && (
        <ul className="ml-2 border-l border-border pl-3">
          {node.children.map((c) => <li key={c.id}><TreeView node={c} depth={depth + 1} /></li>)}
        </ul>
      )}
    </div>
  );
}

function BomEditor({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: ModuleRecord | null }) {
  const [name, setName] = useState("");
  const [tree, setTree] = useState<Node>(() => ({ ...newNode(), nome: "" }));

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      try { setTree(JSON.parse(editing.meta?.tree_json ?? "null") ?? newNode()); } catch { setTree(newNode()); }
    } else { setName(""); setTree(newNode()); }
  }, [open, editing]);

  const mutate = (id: string, fn: (n: Node) => Node | null): Node => {
    const walk = (n: Node): Node | null => {
      if (n.id === id) return fn(n);
      const children = n.children.map(walk).filter((c): c is Node => c !== null);
      return { ...n, children };
    };
    return walk(tree) ?? newNode();
  };

  const updNode = (id: string, p: Partial<Node>) => setTree(mutate(id, (n) => ({ ...n, ...p })));
  const addChild = (id: string) => setTree(mutate(id, (n) => ({ ...n, children: [...n.children, newNode()] })));
  const rmNode = (id: string) => { if (id === tree.id) return; setTree(mutate(id, () => null)); };

  const canSave = name.trim().length > 0 && tree.nome.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    const meta = { tree_json: JSON.stringify(tree) };
    if (editing) updateRecord("bom", editing.id, { name: name.trim(), meta });
    else addRecord("bom", name.trim(), meta);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle>{editing ? "Editar BOM" : "Nova BOM"}</SheetTitle>
          <SheetDescription>Monte a árvore de materiais: produto → componentes → matérias-primas.</SheetDescription>
        </SheetHeader>
        <div className="border-b border-border p-6">
          <Label className="text-xs">Nome da BOM *</Label>
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: BOM Colchão Pocket Casal v1" className="mt-1.5" />
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <NodeEditor node={tree} depth={0} onUpdate={updNode} onAddChild={addChild} onRemove={rmNode} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <FolderTree className="mr-1 inline size-3" />
            O nível 0 é o produto. Clique no <Plus className="inline size-3" /> de qualquer nó para adicionar um filho.
          </p>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={!canSave} className="gap-1.5"><Check className="size-4" /> {editing ? "Salvar" : "Criar BOM"}</Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}

function NodeEditor({ node, depth, onUpdate, onAddChild, onRemove }: {
  node: Node; depth: number;
  onUpdate: (id: string, p: Partial<Node>) => void;
  onAddChild: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <div className="flex items-center gap-2 py-1">
        {node.children.length > 0 ? (
          <button onClick={() => setOpen((o) => !o)} className="text-muted-foreground">
            {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
        ) : <span className="w-3.5" />}
        <Input value={node.nome} onChange={(e) => onUpdate(node.id, { nome: e.target.value })}
          placeholder={depth === 0 ? "Produto" : "Componente / matéria-prima"}
          className={cn("flex-1", depth === 0 && "font-semibold")} />
        <Input className="w-16" value={node.qtd} onChange={(e) => onUpdate(node.id, { qtd: e.target.value })} placeholder="Qtd" />
        <Input className="w-16" value={node.unidade} onChange={(e) => onUpdate(node.id, { unidade: e.target.value })} placeholder="un" />
        <Input className="w-20" value={node.custo} onChange={(e) => onUpdate(node.id, { custo: e.target.value })} placeholder="R$" />
        <Button variant="ghost" size="icon" onClick={() => onAddChild(node.id)} aria-label="Adicionar filho"><Plus className="size-4" /></Button>
        {depth > 0 && (
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onRemove(node.id)}><Trash2 className="size-4" /></Button>
        )}
      </div>
      {open && node.children.length > 0 && (
        <ul className="ml-3 border-l border-border pl-3">
          {node.children.map((c) => (
            <li key={c.id}>
              <NodeEditor node={c} depth={depth + 1} onUpdate={onUpdate} onAddChild={onAddChild} onRemove={onRemove} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BOMVersion({ version, date, changes }: { version: string; date: string; changes: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-2.5">
      <div className="grid size-6 shrink-0 place-items-center rounded-md bg-purple-500/10 text-purple-500">
        <Tag className="size-3" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">{version}</span>
          <span className="text-[10px] text-muted-foreground">· {date}</span>
        </div>
        <div className="text-[10px] text-muted-foreground">{changes}</div>
      </div>
    </div>
  );
}

function AlternativeItem({ name, original, savings }: { name: string; original: string; savings: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
      <div className="flex items-center gap-2">
        <div className="grid size-6 place-items-center rounded-md bg-green-500/10 text-green-500">
          <ArrowRight className="size-3" />
        </div>
        <div>
          <div className="text-xs font-medium">{name}</div>
          <div className="text-[10px] text-muted-foreground">Substitui: {original}</div>
        </div>
      </div>
      <div className="font-mono text-xs font-semibold text-green-500">-{savings}</div>
    </div>
  );
}

function CapacityImpact({ process, current, projected }: { process: string; current: number; projected: number }) {
  const improvement = projected - current;
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
      <div className="flex items-center gap-2">
        <div className="grid size-6 place-items-center rounded-md bg-blue-500/10 text-blue-500">
          <Activity className="size-3" />
        </div>
        <span className="text-xs font-medium">{process}</span>
      </div>
      <div className="text-right">
        <div className="font-mono text-xs">{current}% → {projected}%</div>
        <div className="text-[10px] text-green-500">+{improvement}%</div>
      </div>
    </div>
  );
}
