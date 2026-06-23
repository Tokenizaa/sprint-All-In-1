import * as React from "react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Building2, Save, MapPin, Phone, Mail, Globe, Check, AlertCircle, Navigation, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addRecord, updateRecord } from "@/lib/store";
import type { ModuleRecord } from "@/lib/store";
import { cn } from "@/lib/utils";
import { maskCNPJ, maskCEP, maskPhone, maskIE, maskIM } from "@/lib/masks";
import { validateCNPJ, validateCEP, validateEmail, validatePhone } from "@/lib/validation";
import { fetchAddressByCEP } from "@/lib/cep-api";
import { useModuleForm } from "@/hooks/useModuleForm";

type Mode = { kind: "create" } | { kind: "edit"; record: ModuleRecord };

type FormData = {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  telefone: string;
  email: string;
  website: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  latitude: string;
  longitude: string;
};

const emptyForm: FormData = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  inscricaoEstadual: "",
  inscricaoMunicipal: "",
  telefone: "",
  email: "",
  website: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  pais: "Brasil",
  latitude: "",
  longitude: "",
};

export function EmpresaForm({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  console.log("EmpresaForm rendering with mode:", mode);

  const { data, setField, errors, canSave, submit } = useModuleForm<FormData>({
    moduleKey: "empresa",
    initialData: mode.kind === "edit" ? (() => {
      const meta = mode.record.meta || {};
      return {
        razaoSocial: mode.record.name,
        nomeFantasia: meta.nomeFantasia || "",
        cnpj: meta.cnpj || "",
        inscricaoEstadual: meta.inscricaoEstadual || "",
        inscricaoMunicipal: meta.inscricaoMunicipal || "",
        telefone: meta.telefone || "",
        email: meta.email || "",
        website: meta.website || "",
        cep: meta.cep || "",
        logradouro: meta.logradouro || "",
        numero: meta.numero || "",
        complemento: meta.complemento || "",
        bairro: meta.bairro || "",
        cidade: meta.cidade || "",
        estado: meta.estado || "",
        pais: meta.pais || "Brasil",
        latitude: meta.latitude || "",
        longitude: meta.longitude || "",
      };
    })() : emptyForm,
    toRecord: (data) => {
      const meta: Record<string, string> = {};
      for (const [k, v] of Object.entries(data)) {
        if (k === "razaoSocial") continue;
        if (typeof v === "string" && v.trim()) meta[k] = v.trim();
      }
      return { name: data.razaoSocial.trim(), meta };
    },
    validate: (data) => {
      const newErrors: Partial<Record<keyof FormData, string>> = {};
      
      if (data.razaoSocial.trim().length === 0) {
        newErrors.razaoSocial = "Razão Social é obrigatória";
      }
      
      if (data.cnpj && !validateCNPJ(data.cnpj)) {
        newErrors.cnpj = "CNPJ inválido";
      }
      if (data.email && !validateEmail(data.email)) {
        newErrors.email = "E-mail inválido";
      }
      if (data.cep && !validateCEP(data.cep)) {
        newErrors.cep = "CEP inválido";
      }
      if (data.telefone && !validatePhone(data.telefone)) {
        newErrors.telefone = "Telefone inválido";
      }

      return newErrors;
    },
  });

  const handleCNPJChange = (value: string) => {
    const masked = maskCNPJ(value);
    setField("cnpj", masked);
    if (masked.replace(/\D/g, "").length === 14 && !validateCNPJ(masked)) {
      // Error will be set by validate function
    }
  };

  const handleCEPChange = async (value: string) => {
    const masked = maskCEP(value);
    setField("cep", masked);
    
    const cleaned = masked.replace(/\D/g, "");
    if (cleaned.length === 8) {
      setLoadingCEP(true);
      const addressData = await fetchAddressByCEP(cleaned);
      setLoadingCEP(false);
      
      if (!addressData.erro) {
        setField("logradouro", addressData.logradouro);
        setField("bairro", addressData.bairro);
        setField("cidade", addressData.cidade);
        setField("estado", addressData.estado);
      }
    }
  };

  const handlePhoneChange = (value: string) => {
    const masked = maskPhone(value);
    setField("telefone", masked);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada pelo navegador");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setField("latitude", latitude.toString());
        setField("longitude", longitude.toString());
        
        // Reverse geocoding to get city/state
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const locationData = await response.json();
          if (locationData.address) {
            setField("cidade", locationData.address.city || locationData.address.town || "");
            setField("estado", locationData.address.state || "");
            setField("pais", locationData.address.country || "Brasil");
          }
        } catch (error) {
          console.error("Erro ao obter nome da cidade:", error);
        }
        
        setLoadingLocation(false);
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
        setLoadingLocation(false);
        alert("Não foi possível obter sua localização. Por favor, preencha manualmente.");
      }
    );
  };

  const handleSubmit = () => {
    submit(mode);
  };

  return (
    <div className="surface-elevated rounded-2xl p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
          <Building2 className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            {mode.kind === "create" ? "Nova empresa" : "Editar empresa"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Cadastre os dados completos da empresa
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Dados da Empresa */}
        <SectionCard icon={Building2} title="Dados da Empresa">
          <Grid>
            <F label="Razão Social *" full>
              <Input
                autoFocus
                value={data.razaoSocial}
                onChange={(e) => setField("razaoSocial", e.target.value)}
                placeholder="Ex.: Colchões Acme Indústria Ltda."
              />
            </F>
            <F label="Nome Fantasia" full>
              <Input
                value={data.nomeFantasia}
                onChange={(e) => setField("nomeFantasia", e.target.value)}
                placeholder="Ex.: Acme Colchões"
              />
            </F>
            <F label="CNPJ">
              <Input
                value={data.cnpj}
                onChange={(e) => handleCNPJChange(e.target.value)}
                placeholder="00.000.000/0001-00"
                className={errors.cnpj ? "border-red-500" : ""}
              />
              {errors.cnpj && <p className="text-xs text-red-500 mt-1">{errors.cnpj}</p>}
            </F>
            <F label="Inscrição Estadual">
              <Input
                value={data.inscricaoEstadual}
                onChange={(e) => setField("inscricaoEstadual", maskIE(e.target.value))}
                placeholder="Isento ou número"
              />
            </F>
            <F label="Inscrição Municipal">
              <Input
                value={data.inscricaoMunicipal}
                onChange={(e) => setField("inscricaoMunicipal", maskIM(e.target.value))}
                placeholder="Isento ou número"
              />
            </F>
            <F label="Telefone">
              <Input
                value={data.telefone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                className={errors.telefone ? "border-red-500" : ""}
              />
              {errors.telefone && <p className="text-xs text-red-500 mt-1">{errors.telefone}</p>}
            </F>
            <F label="E-mail" full>
              <Input
                type="email"
                value={data.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="contato@empresa.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </F>
            <F label="Website" full>
              <Input
                value={data.website}
                onChange={(e) => setField("website", e.target.value)}
                placeholder="https://www.empresa.com"
              />
            </F>
          </Grid>
        </SectionCard>

        {/* Endereço */}
        <SectionCard icon={MapPin} title="Endereço">
          <Grid>
            <F label="CEP">
              <div className="relative">
                <Input
                  value={data.cep}
                  onChange={(e) => handleCEPChange(e.target.value)}
                  placeholder="00000-000"
                  className={errors.cep ? "border-red-500" : ""}
                />
                {loadingCEP && <div className="absolute right-3 top-1/2 -translate-y-1/2 size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
              </div>
              {errors.cep && <p className="text-xs text-red-500 mt-1">{errors.cep}</p>}
            </F>
            <F label="Número">
              <Input
                value={data.numero}
                onChange={(e) => setField("numero", e.target.value)}
                placeholder="123"
              />
            </F>
            <F label="Logradouro" full>
              <Input
                value={data.logradouro}
                onChange={(e) => setField("logradouro", e.target.value)}
                placeholder="Rua, Avenida, etc."
              />
            </F>
            <F label="Complemento" full>
              <Input
                value={data.complemento}
                onChange={(e) => setField("complemento", e.target.value)}
                placeholder="Apto, Bloco, etc."
              />
            </F>
            <F label="Bairro">
              <Input
                value={data.bairro}
                onChange={(e) => setField("bairro", e.target.value)}
                placeholder="Centro"
              />
            </F>
            <F label="Cidade">
              <Input
                value={data.cidade}
                onChange={(e) => setField("cidade", e.target.value)}
                placeholder="São Paulo"
              />
            </F>
            <F label="Estado">
              <Input
                value={data.estado}
                onChange={(e) => setField("estado", e.target.value)}
                placeholder="SP"
                maxLength={2}
              />
            </F>
            <F label="País">
              <Input
                value={data.pais}
                onChange={(e) => setField("pais", e.target.value)}
                placeholder="Brasil"
              />
            </F>
          </Grid>
        </SectionCard>

        {/* Localização */}
        <SectionCard icon={Navigation} title="Localização">
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGetLocation}
              disabled={loadingLocation}
              className="gap-2"
            >
              {loadingLocation ? (
                <>
                  <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Obtendo localização...
                </>
              ) : (
                <>
                  <MapIcon className="size-4" />
                  Usar minha localização atual
                </>
              )}
            </Button>

            <Grid>
              <F label="Latitude">
                <Input
                  value={data.latitude}
                  onChange={(e) => setField("latitude", e.target.value)}
                  placeholder="-23.5505"
                  type="number"
                  step="any"
                />
              </F>
              <F label="Longitude">
                <Input
                  value={data.longitude}
                  onChange={(e) => setField("longitude", e.target.value)}
                  placeholder="-46.6333"
                  type="number"
                  step="any"
                />
              </F>
            </Grid>

            {data.latitude && data.longitude && (
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground mb-2">Mapa de localização</div>
                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <MapIcon className="size-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      {data.latitude}, {data.longitude}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {data.cidade}, {data.estado}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button onClick={handleSubmit} disabled={!canSave} className="gap-1.5">
          <Check className="size-4" /> {mode.kind === "create" ? "Cadastrar empresa" : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="grid size-8 place-items-center rounded-md bg-primary/10 ring-1 ring-primary/20">
          <Icon className="size-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function F({ label, full, children }: { label: React.ReactNode; full?: boolean; children: React.ReactNode }) {
  return <div className={cn("space-y-1.5", full && "sm:col-span-2")}><Label className="text-xs">{label}</Label>{children}</div>;
}
