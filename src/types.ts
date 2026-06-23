/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// User Profiles & Granular Permissions
export type UserRole = 
  | 'AdminIndustrial' 
  | 'Engenharia' 
  | 'PCP' 
  | 'Producao' 
  | 'Qualidade' 
  | 'Almoxarifado' 
  | 'Diretoria';

export interface ModulePermissions {
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface RolePermissions {
  role: UserRole;
  label: string;
  description: string;
  modules: {
    [moduleKey: string]: ModulePermissions;
  };
}

// 1. Organizational Structure
export interface Unit {
  id: string; // e.g. "UT-001"
  name: string; // e.g. "Fábrica Matriz - Sorocaba"
  type: 'Fábrica' | 'Filial' | 'Centro Produtivo';
  address: string;
  manager: string;
}

export interface Sector {
  id: string; // e.g. "SEC-CORTE"
  name: string; // Recebimento, Almoxarifado, Corte, Costura, Montagem, Acabamento, Embalagem, Expedição
  unitId: string;
  manager: string;
  capacityFactor: number; // Factor for capacity calculation
}

export interface ProductionLine {
  id: string;
  name: string; // e.g. "Linha Colchões de Mola - A", "Linha Espumação Contínua"
  sectorId: string;
  status: 'Ativa' | 'Inativa' | 'Gargalo';
  efficiency: number; // e.g. 85 (85%)
}

// 2. Machine Management
export type MachineStatus = 'Operando' | 'Parada' | 'Manutenção' | 'Inativa';

export interface Machine {
  id: string; // Código
  name: string;
  category: string; // e.g. "Corte de Bloco", "Costura Automática", "Prensa Pneumática", "Laminadora"
  manufacturer: string;
  model: string;
  serialNumber: string;
  acquisitionDate: string;
  warrantyUntil: string;
  location: string; // Hall, Galpão, Coordenada
  sectorId: string;
  status: MachineStatus;
  capacityTheoretical: number; // un/hour
  capacityOperational: number; // un/hour
  capacityObserved: number; // un/hour
  documentCount: number;
}

// 3. Tool Management
export interface Tool {
  id: string;
  name: string;
  category: 'Ferramenta' | 'Equipamento' | 'Instrumento';
  sectorId: string;
  location: string;
  status: 'Disponível' | 'Em Uso' | 'Em Calibração' | 'Danificado';
  lastInspectionDate: string;
  calibrationDue?: string;
}

// 4. Raw Material Management
export type MaterialCategory = 
  | 'Espumas' 
  | 'Tecidos' 
  | 'Linhas' 
  | 'Colas' 
  | 'Embalagens' 
  | 'Etiquetas' 
  | 'Acessórios';

export interface RawMaterial {
  id: string; // Código
  description: string;
  category: MaterialCategory;
  unit: 'kg' | 'm' | 'm²' | 'un' | 'rolo' | 'litro';
  mainSupplierId: string;
  minStock: number;
  currentStock: number;
}

// 5. Suppliers Management
export interface Supplier {
  id: string;
  corporateName: string; // Razão Social
  tradeName: string;     // Nome Fantasia
  cnpj: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  materialsSupplied: string[]; // description tags
  leadTimeDays: number;
  evaluationScore: number; // 1 to 5 stars
}

// 6. Production Processes
export interface ProductionProcess {
  id: string;
  name: string; // Recebimento, Corte, Costura, etc.
  inputs: string[]; // list of raw materials/parts entering
  outputs: string[]; // list of outputs
  machineIds: string[]; // list of compatible machines
  peopleInvolved: number;
  standardTimeMinutes: number; // Tempo Padrão
  observedTimeMinutes: number; // Tempo Observado
  observations: string;
}

// 7. Time Study (Estudo de Tempos)
export interface TimeMeasurement {
  id: string;
  processId: string;
  operatorName: string;
  machineId: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  quantityProduced: number;
  date: string;
}

export interface ProcessTimeStats {
  processId: string;
  minTimeSeconds: number;
  avgTimeSeconds: number;
  maxTimeSeconds: number;
  measurementCount: number;
}

// 8. Product Engineering
export type BedCategory = 'Solteiro' | 'Casal' | 'Queen' | 'King';

export interface ProductModel {
  id: string; // e.g. "PRD-QL-D33"
  modelName: string; // e.g. "Pró-Vida"
  category: BedCategory;
  dimensions: string; // e.g. "158 x 198 x 30 cm"
  density: string; // e.g. "D33", "Molas Ensacadas"
  heightCm: number; // e.g. 30
  composition: string; // e.g. "Espuma Hipermacia + Molejo Pocket"
  tags: string[];
}

// Bill of Materials (BOM) Item
export interface BOMItem {
  id: string;
  productId: string;
  materialId: string; // raw material reference
  unitConsumption: number; // quantity per product
  expectedLossPercent: number; // perdas previstas %
}

export interface BOMVersion {
  id: string;
  productId: string;
  version: string; // e.g. "V1.0"
  revision: number; // e.g. 2
  validFrom: string;
  validTo?: string; // empty means still active
  isActive: boolean;
  items: BOMItem[];
}

// 9. Work Centers (Centros de Trabalho)
export interface WorkCenter {
  id: string; // e.g. "WC-CORTE"
  name: string; // Corte, Costura, Montagem, Acabamento, Embalagem
  capacityUnitsHour: number;
  efficiencyPercent: number;
  availabilityPercent: number;
  idleHoursPerWeek: number;
}

// 10. Industrial Documentation
export type DocType = 'Procedimento' | 'Instrução' | 'Manual' | 'Certificado';

export interface IndustrialDocument {
  id: string;
  title: string;
  type: DocType;
  fileName: string;
  uploadDate: string;
  associatedType: 'Máquina' | 'Processo' | 'Produto' | 'Material' | 'Geral';
  associatedId: string; // links to any machineId, processId, productId etc.
}
