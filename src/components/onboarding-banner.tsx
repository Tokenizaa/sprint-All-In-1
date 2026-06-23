import { Link } from "@tanstack/react-router";
import { Sparkles, X, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, skipOnboarding, completeOnboarding } from "@/lib/store";

export function OnboardingBanner() {
  const completed = useStore((s) => s.onboardingCompleted);
  const skipped = useStore((s) => s.onboardingSkipped);
  const onboardingProgress = useStore((s) => s.onboardingProgress);
  
  const isInProgress = onboardingProgress.lastStepTimestamp > 0;
  const currentStep = onboardingProgress.currentStep;
  
  if (completed || skipped) return null;
  
  if (isInProgress) {
    return (
      <div className="flex items-center gap-3 border-b border-border bg-primary/5 px-4 py-2.5 text-sm">
        <Clock className="size-4 text-primary" />
        <span className="text-foreground">
          Você está na etapa <strong>{currentStep + 1}</strong> do onboarding. <span className="text-muted-foreground">Continue configurando sua fábrica.</span>
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" variant="default" className="gap-2">
            <Link to="/onboarding">Continuar <ArrowRight className="size-3" /></Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={completeOnboarding} aria-label="Finalizar">
            <X className="size-4" />
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 py-2.5 text-sm">
      <Sparkles className="size-4 text-primary" />
      <span className="text-foreground">
        Bem-vindo ao Industrial OS. <span className="text-muted-foreground">Vamos configurar sua fábrica em poucos passos — sem bloquear seu uso.</span>
      </span>
      <div className="ml-auto flex items-center gap-2">
        <Button asChild size="sm" variant="default">
          <Link to="/onboarding">Iniciar onboarding</Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={skipOnboarding} aria-label="Pular">
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
