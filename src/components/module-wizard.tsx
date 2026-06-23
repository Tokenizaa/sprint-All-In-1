import * as React from "react";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useModuleForm } from "@/hooks/useModuleForm";

export interface WizardStep {
  key: string;
  title: string;
  description: string;
  icon?: any;
}

export interface ModuleWizardProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: any;
  moduleKey: string;
  initialData: T;
  steps: WizardStep[];
  toRecord: (data: T) => { name: string; meta: Record<string, string> };
  validate?: (data: T) => Record<string, string>;
  renderStep: (step: number, data: T, setField: <K extends keyof T>(key: K, value: T[K]) => void) => React.ReactNode;
  title?: string;
  description?: string;
}

export function ModuleWizard<T extends Record<string, any>>({
  open,
  onOpenChange,
  editing,
  moduleKey,
  initialData,
  steps,
  toRecord,
  validate,
  renderStep,
  title,
  description,
}: ModuleWizardProps<T>) {
  const [step, setStep] = useState(0);
  const { data, setField, canSave, submit, reset, setData } = useModuleForm<T>({
    moduleKey: moduleKey as any,
    initialData,
    toRecord,
    validate: (validate as any) || (() => ({})),
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        const meta = editing.meta || {};
        const draft: any = { name: editing.name, ...meta };
        setData(draft);
        setStep(0);
      } else {
        reset();
        setStep(0);
      }
    }
  }, [open, editing, reset, setData]);

  const canNext = step < steps.length - 1;
  const canPrev = step > 0;

  const handleSave = () => {
    submit(editing ? { kind: "edit", record: editing! } : { kind: "create" });
    onOpenChange(false);
  };

  const handleNext = () => {
    if (canNext) setStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (canPrev) setStep((s) => s - 1);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle>{title || (editing ? "Editar registro" : "Novo registro")}</SheetTitle>
          <SheetDescription>{description || "Preencha as informações seguindo as etapas."}</SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-2 overflow-x-auto border-b border-border px-6 py-3 text-xs">
          {steps.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setStep(i)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1 transition",
                i === step ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-full border text-[10px] font-mono",
                  i === step ? "border-primary bg-primary text-primary-foreground" : "border-border"
                )}
              >
                {i + 1}
              </span>
              <span className="font-medium">{s.title}</span>
              {i < steps.length - 1 && <ChevronRight className="size-3 text-muted-foreground/60" />}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">{renderStep(step, data, setField)}</div>

        <footer className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 p-4">
          <div className="text-xs text-muted-foreground">
            Etapa {step + 1} de {steps.length} · <span className="text-foreground">{steps[step].title}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" disabled={!canPrev} onClick={handlePrev} className="gap-1">
              <ChevronLeft className="size-4" /> Voltar
            </Button>
            {canNext ? (
              <Button onClick={handleNext} className="gap-1">
                Próximo <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={!canSave} className="gap-1.5">
                <Check className="size-4" /> {editing ? "Salvar" : "Criar"}
              </Button>
            )}
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
