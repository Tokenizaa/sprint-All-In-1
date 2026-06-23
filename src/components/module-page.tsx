import { useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EmptyState } from "./empty-state";
import { addRecord, removeRecord, useStore } from "@/lib/store";
import type { ModuleDef } from "@/lib/modules";
import { Badge } from "@/components/ui/badge";

export function ModulePage({ module: m }: { module: ModuleDef }) {
  const records = useStore((s) => s.records[m.key]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [q, setQ] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    addRecord(m.key, name.trim(), note ? { nota: note } : undefined);
    setName(""); setNote(""); setOpen(false);
  };

  const filtered = records.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <m.icon className="size-3.5" /> {m.group}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{m.title}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{m.description}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="size-4" /> {m.primaryCta}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{m.primaryCta}</DialogTitle>
              <DialogDescription>{m.benefit}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" autoFocus value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={`Ex.: ${m.checklist[0]}`} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="note">Observação <span className="text-muted-foreground">(opcional)</span></Label>
                <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {records.length === 0 ? (
        <EmptyState
          icon={m.icon}
          title={`Comece pelo módulo ${m.title}`}
          description={m.description}
          benefit={m.benefit}
          checklist={m.checklist}
          primaryCta={m.primaryCta}
          onPrimary={() => setOpen(true)}
        />
      ) : (
        <div className="surface-elevated rounded-xl">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder={`Buscar em ${m.title.toLowerCase()}…`}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Badge variant="secondary" className="font-mono">{records.length}</Badge>
          </div>
          <ul className="divide-y divide-border">
            {filtered.map((r) => (
              <li key={r.id} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-muted/40">
                <div className="grid size-9 place-items-center rounded-md bg-primary/10 ring-1 ring-primary/20">
                  <m.icon className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.name}</div>
                  {r.meta?.nota && <div className="truncate text-xs text-muted-foreground">{r.meta.nota}</div>}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                </span>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100"
                  onClick={() => removeRecord(m.key, r.id)} aria-label="Remover">
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="p-6 text-center text-sm text-muted-foreground">Nenhum resultado para "{q}".</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
