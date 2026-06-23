import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Factory, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [loading, user, navigate]);

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (tab === "signin") {
        const { error } = await signIn(email, password);
        if (error) toast.error(error);
        else { toast.success("Bem-vindo de volta!"); navigate({ to: "/" }); }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) toast.error(error);
        else {
          toast.success("Conta criada. Verifique seu e-mail se a confirmação estiver ativa.");
          setTab("signin");
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-primary/15 via-background to-background border-r border-border">
        <div className="flex items-center gap-2 text-foreground">
          <Factory className="size-6 text-primary" />
          <span className="font-semibold tracking-tight">Industrial OS</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold leading-tight">Sistema Operacional Industrial AI-First</h1>
          <p className="text-muted-foreground max-w-md">
            Acompanhe a evolução da sua fábrica de colchões — do dia zero da implantação à operação madura.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© Industrial OS</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-2">
            <Factory className="size-5 text-primary" />
            <span className="font-semibold">Industrial OS</span>
          </div>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <TabsContent value="signup" className="space-y-4 m-0">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input id="fullName" required={tab === "signup"} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Maria Silva" />
                </div>
              </TabsContent>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@fabrica.com" autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={tab === "signin" ? "current-password" : "new-password"} />
              </div>

              <Button type="submit" disabled={busy} className="w-full">
                {busy && <Loader2 className="size-4 animate-spin mr-2" />}
                {tab === "signin" ? "Entrar na plataforma" : "Criar conta"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {tab === "signin"
                  ? "O primeiro usuário criado vira admin automaticamente."
                  : "Ao criar conta você aceita usar a plataforma para operação industrial."}
              </p>
            </form>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
