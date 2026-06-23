/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Unit, 
  Sector, 
  ProductionLine, 
  Machine, 
  Tool, 
  RawMaterial, 
  Supplier, 
  ProductionProcess, 
  TimeMeasurement, 
  ProductModel, 
  BOMVersion, 
  WorkCenter, 
  IndustrialDocument,
  RolePermissions
} from './types';

// Granular Role & Permission Definitions
export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'AdminIndustrial',
    label: 'Administrador Industrial',
    description: 'Acesso total de leitura, escrita e exclusão em todas as áreas e configurações industriais.',
    modules: {
      dashboard: { read: true, write: true, delete: true },
      org: { read: true, write: true, delete: true },
      machines: { read: true, write: true, delete: true },
      tools: { read: true, write: true, delete: true },
      materials: { read: true, write: true, delete: true },
      suppliers: { read: true, write: true, delete: true },
      processes: { read: true, write: true, delete: true },
      timeStudy: { read: true, write: true, delete: true },
      capacity: { read: true, write: true, delete: true },
      engineering: { read: true, write: true, delete: true },
      workCenters: { read: true, write: true, delete: true },
      documents: { read: true, write: true, delete: true },
      industry360: { read: true, write: true, delete: true }
    }
  },
  {
    role: 'Engenharia',
    label: 'Engenharia de Produto',
    description: 'Foco em Engenharia do Produto (BOM, Fórmulas), Máquinas, Centros de Trabalho e Processos.',
    modules: {
      dashboard: { read: true, write: false, delete: false },
      org: { read: true, write: true, delete: false },
      machines: { read: true, write: true, delete: false },
      tools: { read: true, write: true, delete: false },
      materials: { read: true, write: true, delete: false },
      suppliers: { read: true, write: false, delete: false },
      processes: { read: true, write: true, delete: true },
      timeStudy: { read: true, write: true, delete: false },
      capacity: { read: true, write: true, delete: false },
      engineering: { read: true, write: true, delete: true },
      workCenters: { read: true, write: true, delete: false },
      documents: { read: true, write: true, delete: true },
      industry360: { read: true, write: true, delete: false }
    }
  },
  {
    role: 'PCP',
    label: 'Planejamento e Controle de Produção (PCP)',
    description: 'Gestor de capacidade, tempos, análise de gargalos e centros produtivos sem excluir engenharia estrutural.',
    modules: {
      dashboard: { read: true, write: true, delete: false },
      org: { read: true, write: false, delete: false },
      machines: { read: true, write: false, delete: false },
      tools: { read: true, write: false, delete: false },
      materials: { read: true, write: true, delete: false },
      suppliers: { read: true, write: true, delete: false },
      processes: { read: true, write: true, delete: false },
      timeStudy: { read: true, write: true, delete: true },
      capacity: { read: true, write: true, delete: false },
      engineering: { read: true, write: false, delete: false },
      workCenters: { read: true, write: true, delete: false },
      documents: { read: true, write: true, delete: false },
      industry360: { read: true, write: true, delete: false }
    }
  },
  {
    role: 'Producao',
    label: 'Supervisor de Produção',
    description: 'Monitoramento operacional, alteração básica de status de máquinas e registro de tempo de ciclo.',
    modules: {
      dashboard: { read: true, write: false, delete: false },
      org: { read: true, write: false, delete: false },
      machines: { read: true, write: true, delete: false }, // can operate
      tools: { read: true, write: true, delete: false },
      materials: { read: true, write: false, delete: false },
      suppliers: { read: true, write: false, delete: false },
      processes: { read: true, write: false, delete: false },
      timeStudy: { read: true, write: true, delete: false }, // registers timing
      capacity: { read: true, write: false, delete: false },
      engineering: { read: true, write: false, delete: false },
      workCenters: { read: true, write: false, delete: false },
      documents: { read: true, write: false, delete: false },
      industry360: { read: true, write: false, delete: false }
    }
  },
  {
    role: 'Qualidade',
    label: 'Controle de Qualidade',
    description: 'Garantia de procedimentos, auditoria de tempos e inspeção/calibração de instrumentos.',
    modules: {
      dashboard: { read: true, write: false, delete: false },
      org: { read: true, write: false, delete: false },
      machines: { read: true, write: false, delete: false },
      tools: { read: true, write: true, delete: false }, // calibrates tools
      materials: { read: true, write: false, delete: false },
      suppliers: { read: true, write: true, delete: false }, // evaluates suppliers
      processes: { read: true, write: false, delete: false },
      timeStudy: { read: true, write: true, delete: false },
      capacity: { read: true, write: false, delete: false },
      engineering: { read: true, write: false, delete: false },
      workCenters: { read: true, write: false, delete: false },
      documents: { read: true, write: true, delete: false },
      industry360: { read: true, write: false, delete: false }
    }
  },
  {
    role: 'Almoxarifado',
    label: 'Almoxarifado & Logística',
    description: 'Responsável pela entrada de insumos, controle de lotes, estoque mínimo e matérias-primas.',
    modules: {
      dashboard: { read: true, write: false, delete: false },
      org: { read: true, write: false, delete: false },
      machines: { read: true, write: false, delete: false },
      tools: { read: true, write: false, delete: false },
      materials: { read: true, write: true, delete: false }, // manages stock
      suppliers: { read: true, write: false, delete: false },
      processes: { read: true, write: false, delete: false },
      timeStudy: { read: false, write: false, delete: false },
      capacity: { read: false, write: false, delete: false },
      engineering: { read: true, write: false, delete: false }, // reads products
      workCenters: { read: false, write: false, delete: false },
      documents: { read: true, write: false, delete: false },
      industry360: { read: true, write: false, delete: false }
    }
  },
  {
    role: 'Diretoria',
    label: 'Diretor Geral / Industrial',
    description: 'Leitura completa e visão analítica em 360 e indicadores de alto nível, sem alteração de engenharia.',
    modules: {
      dashboard: { read: true, write: false, delete: false },
      org: { read: true, write: false, delete: false },
      machines: { read: true, write: false, delete: false },
      tools: { read: true, write: false, delete: false },
      materials: { read: true, write: false, delete: false },
      suppliers: { read: true, write: false, delete: false },
      processes: { read: true, write: false, delete: false },
      timeStudy: { read: true, write: false, delete: false },
      capacity: { read: true, write: false, delete: false },
      engineering: { read: true, write: false, delete: false },
      workCenters: { read: true, write: false, delete: false },
      documents: { read: true, write: false, delete: false },
      industry360: { read: true, write: false, delete: false }
    }
  }
];

// Initial Organizational Units
export const INITIAL_UNITS: Unit[] = [
  { id: 'UN-001', name: 'Planta Industrial Sorocaba (Matriz)', type: 'Fábrica', address: 'Av. Industrial, 4500 - Sorocaba/SP', manager: 'Eng. Roberto Silva' },
  { id: 'UN-002', name: 'Planta Espumação Manaus', type: 'Centro Produtivo', address: 'Distrito Industrial, Beco 03 - Manaus/AM', manager: 'Eng. Carlos Souza' },
  { id: 'UN-003', name: 'CD Logístico Guarulhos (Filial)', type: 'Filial', address: 'Rod. Dutra, km 210 - Guarulhos/SP', manager: 'Julio Santos' }
];

export const INITIAL_SECTORS: Sector[] = [
  { id: 'SEC-RECB', name: 'Recebimento de Materiais', unitId: 'UN-001', manager: 'Marta Ribeiro', capacityFactor: 1.0 },
  { id: 'SEC-ALMOX', name: 'Almoxarifado de Insumos', unitId: 'UN-001', manager: 'Marta Ribeiro', capacityFactor: 1.0 },
  { id: 'SEC-CORTE', name: 'Setor de Corte de Espuma', unitId: 'UN-001', manager: 'Carlos Pereira', capacityFactor: 1.2 },
  { id: 'SEC-COST', name: 'Setor de Costura Industrial', unitId: 'UN-001', manager: 'Fernanda Oliveira', capacityFactor: 1.1 },
  { id: 'SEC-MONT', name: 'Montagem e Fechamento', unitId: 'UN-001', manager: 'Sebastião Alves', capacityFactor: 1.3 },
  { id: 'SEC-ACAB', name: 'Acabamento, Inspeção e Tagging', unitId: 'UN-001', manager: 'Patrícia Sales', capacityFactor: 1.0 },
  { id: 'SEC-EMB', name: 'Setor de Embalagem (Press-Pack)', unitId: 'UN-001', manager: 'Patrícia Sales', capacityFactor: 1.1 },
  { id: 'SEC-EXP', name: 'Expedição Industrial', unitId: 'UN-001', manager: 'Gisela Lima', capacityFactor: 1.0 }
];

export const INITIAL_LINES: ProductionLine[] = [
  { id: 'LN-MOLAS-A', name: 'Linha A - Colchões de Mola Pocket', sectorId: 'SEC-MONT', status: 'Ativa', efficiency: 88 },
  { id: 'LN-ESPU-B', name: 'Linha B - Colchões de Espuma D33/D45', sectorId: 'SEC-MONT', status: 'Ativa', efficiency: 82 },
  { id: 'LN-QUILT-1', name: 'Linha de Quilting Automática 1', sectorId: 'SEC-COST', status: 'Gargalo', efficiency: 95 },
  { id: 'LN-ESPU-CONT', name: 'Linha de Espumação Contínua', sectorId: 'SEC-CORTE', status: 'Ativa', efficiency: 91 }
];

// Initial Machines
export const INITIAL_MACHINES: Machine[] = [
  {
    id: 'MAC-COR-01',
    name: 'Laminadora de Blocos Contínua B01',
    category: 'Laminadora',
    manufacturer: 'Albrecht S/A',
    model: 'LAM-MAX 300',
    serialNumber: 'ALB-883492-2022',
    acquisitionDate: '2022-04-12',
    warrantyUntil: '2027-04-12',
    location: 'Pavilhão A - Bloco 2',
    sectorId: 'SEC-CORTE',
    status: 'Operando',
    capacityTheoretical: 80, 
    capacityOperational: 70,
    capacityObserved: 65,
    documentCount: 2
  },
  {
    id: 'MAC-COR-02',
    name: 'Cortadora Horizontal CNC de Contorno H-02',
    category: 'Corte de Bloco',
    manufacturer: 'Bäumer',
    model: 'Contours V5',
    serialNumber: 'BAU-990212',
    acquisitionDate: '2023-01-15',
    warrantyUntil: '2026-01-15',
    location: 'Pavilhão A - Bloco 3',
    sectorId: 'SEC-CORTE',
    status: 'Operando',
    capacityTheoretical: 45,
    capacityOperational: 40,
    capacityObserved: 37,
    documentCount: 1
  },
  {
    id: 'MAC-COS-01',
    name: 'Quilteira Automática de Agulhas Múltiplas Q-10',
    category: 'Costura Automática',
    manufacturer: 'Resta Srl',
    model: 'H320 Multi-Quilt',
    serialNumber: 'RST-7711-2021',
    acquisitionDate: '2021-08-20',
    warrantyUntil: '2025-08-20',
    location: 'Pavilhão B - Galpão Central',
    sectorId: 'SEC-COST',
    status: 'Parada',
    capacityTheoretical: 30, // tampas/hora
    capacityOperational: 25,
    capacityObserved: 24,
    documentCount: 3
  },
  {
    id: 'MAC-MON-01',
    name: 'Máquina Virola de Fechamento de Colchões F-07',
    category: 'Costura Automática',
    manufacturer: 'Singer Industrial',
    model: 'Tape-Edge TE-440',
    serialNumber: 'SGR-8890432-02',
    acquisitionDate: '2020-11-05',
    warrantyUntil: '2024-11-05',
    location: 'Pavilhão B - Linha Lateral',
    sectorId: 'SEC-MONT',
    status: 'Operando',
    capacityTheoretical: 25, // colchões fechados/hora
    capacityOperational: 20,
    capacityObserved: 18,
    documentCount: 1
  },
  {
    id: 'MAC-EMB-01',
    name: 'Prensa Compactadora Roll-Pack R-04',
    category: 'Prensa Pneumática',
    manufacturer: 'Teknomac',
    model: 'Roll-Packer 2000X',
    serialNumber: 'TKM-3320-B',
    acquisitionDate: '2023-06-18',
    warrantyUntil: '2028-06-18',
    location: 'Pavilhão C - Linha Saída',
    sectorId: 'SEC-EMB',
    status: 'Operando',
    capacityTheoretical: 60, // colchões enrolados/hora
    capacityOperational: 50,
    capacityObserved: 48,
    documentCount: 2
  },
  {
    id: 'MAC-MON-02',
    name: 'Linha de Montagem Pneumática Estácio M-02',
    category: 'Prensa Pneumática',
    manufacturer: 'Nomus Máquinas',
    model: 'PneuAssembly Pro',
    serialNumber: 'NMS-004312',
    acquisitionDate: '2022-10-10',
    warrantyUntil: '2025-10-10',
    location: 'Pavilhão B - Estação 4',
    sectorId: 'SEC-MONT',
    status: 'Manutenção',
    capacityTheoretical: 40,
    capacityOperational: 35,
    capacityObserved: 0,
    documentCount: 1
  }
];

// Initial Tools
export const INITIAL_TOOLS: Tool[] = [
  { id: 'FER-001', name: 'Trena Digital Laser Bosch GLM 50C', category: 'Instrumento', sectorId: 'SEC-CORTE', location: 'Estojo Armário Corte', status: 'Disponível', lastInspectionDate: '2026-03-01', calibrationDue: '2027-03-01' },
  { id: 'FER-002', name: 'Termômetro Infravermelho Fluke 62 Max', category: 'Instrumento', sectorId: 'SEC-CORTE', location: 'Armário Espumação', status: 'Disponível', lastInspectionDate: '2026-02-15', calibrationDue: '2027-02-15' },
  { id: 'FER-003', name: 'Cortador Elétrico Manual de Espuma Makita', category: 'Equipamento', sectorId: 'SEC-CORTE', location: 'Bancada Ajuste 2', status: 'Em Uso', lastInspectionDate: '2026-05-10', calibrationDue: undefined },
  { id: 'FER-004', name: 'Agulha Industrial Titânio Singer #19 (Caixa)', category: 'Ferramenta', sectorId: 'SEC-COST', location: 'Gaiola Almoxarifado', status: 'Disponível', lastInspectionDate: '2026-01-10', calibrationDue: undefined },
  { id: 'FER-005', name: 'Esticador Pneumático de Tampo Nomus', category: 'Equipamento', sectorId: 'SEC-MONT', location: 'Estação Virola B', status: 'Em Uso', lastInspectionDate: '2026-04-20', calibrationDue: undefined },
  { id: 'FER-006', name: 'Paquímetro Digital Recartilhado Mitutoyo', category: 'Instrumento', sectorId: 'SEC-ACAB', location: 'Painel da Qualidade', status: 'Em Calibração', lastInspectionDate: '2026-06-01', calibrationDue: '2026-06-25' }
];

// Initial Suppliers
export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001',
    corporateName: 'Dow Brasil Química S/A',
    tradeName: 'Dow Química',
    cnpj: '61.123.456/0001-89',
    contactName: 'Eduardo Martins',
    contactPhone: '(11) 4567-9000',
    contactEmail: 'EMartins@dow.com',
    materialsSupplied: ['Poliol Especial', 'TDI Isocianato', 'Aditivos Químicos'],
    leadTimeDays: 12,
    evaluationScore: 4.8
  },
  {
    id: 'SUP-002',
    corporateName: 'Manoel Tecidos de Jacquard Ltda',
    tradeName: 'TexLar Tecidos',
    cnpj: '12.431.111/0002-34',
    contactName: 'Luciano Neves',
    contactPhone: '(19) 3456-1122',
    contactEmail: 'vendas@texlartecidos.com.br',
    materialsSupplied: ['Tecido Jacquard 240g/m²', 'Tecido Malha Stretch', 'Tecido Lateral Suede'],
    leadTimeDays: 8,
    evaluationScore: 4.2
  },
  {
    id: 'SUP-003',
    corporateName: 'Molas Unidas do Brasil Indústria e Comércio',
    tradeName: 'Molas Unidas (Pocket)',
    cnpj: '88.312.990/0001-55',
    contactName: 'Sérgio Guedes',
    contactPhone: '(15) 3219-9800',
    contactEmail: 'sergio.guedes@molasunidas.com.br',
    materialsSupplied: ['Carcaça de Molas Pocket Pro', 'Molejo Casal', 'Arame Bitola 2.2'],
    leadTimeDays: 15,
    evaluationScore: 4.5
  },
  {
    id: 'SUP-004',
    corporateName: 'SulPlast Filmes Flexíveis do Sul S/A',
    tradeName: 'SulPlast Embalagens',
    cnpj: '45.109.880/0001-09',
    contactName: 'Cláudia Fontes',
    contactPhone: '(51) 3344-0987',
    contactEmail: 'claudia@sulplastfilmes.com.br',
    materialsSupplied: ['Filme Termoplástico de Encolhimento', 'Saco PE de Micro-Furo Colchão Queen', 'Plástico Termorretrátil'],
    leadTimeDays: 6,
    evaluationScore: 4.0
  }
];

// Initial Raw Materials
export const INITIAL_RAW_MATERIALS: RawMaterial[] = [
  { id: 'MAT-ESP-D33', description: 'Espuma Industrial Bloco D33 Amarela', category: 'Espumas', unit: 'kg', mainSupplierId: 'SUP-001', minStock: 2500, currentStock: 4800 },
  { id: 'MAT-ESP-D28', description: 'Espuma Soft D28 Azul Conforto', category: 'Espumas', unit: 'kg', mainSupplierId: 'SUP-001', minStock: 1500, currentStock: 3200 },
  { id: 'MAT-TEC-JAQ', description: 'Tecido Jacquard Belga 240g - Tampas', category: 'Tecidos', unit: 'm²', mainSupplierId: 'SUP-002', minStock: 800, currentStock: 1450 },
  { id: 'MAT-TEC-SUD', description: 'Tecido Lateral Suede Cinza Charcoal', category: 'Tecidos', unit: 'm²', mainSupplierId: 'SUP-002', minStock: 400, currentStock: 980 },
  { id: 'MAT-MOL-PK1', description: 'Molejo Carcaça Pocket Solteiro (88x188)', category: 'Acessórios', unit: 'un', mainSupplierId: 'SUP-003', minStock: 100, currentStock: 320 },
  { id: 'MAT-MOL-PK2', description: 'Molejo Carcaça Pocket Queen (158x198)', category: 'Acessórios', unit: 'un', mainSupplierId: 'SUP-003', minStock: 80, currentStock: 145 },
  { id: 'MAT-LIN-080', description: 'Fio de Quilting Poliamida de alta resistência', category: 'Linhas', unit: 'rolo', mainSupplierId: 'SUP-002', minStock: 50, currentStock: 120 },
  { id: 'MAT-COL-HOT', description: 'Cola Hotmelt de Contato Isenta de Solvente', category: 'Colas', unit: 'kg', mainSupplierId: 'SUP-001', minStock: 200, currentStock: 450 },
  { id: 'MAT-EMB-QN', description: 'Saco Plástico PE Retrátil Imagem Queen', category: 'Embalagens', unit: 'un', mainSupplierId: 'SUP-004', minStock: 150, currentStock: 380 },
  { id: 'MAT-ETI-REG', description: 'Etiqueta Bordada INMETRO com Ficha Comercial', category: 'Etiquetas', unit: 'un', mainSupplierId: 'SUP-004', minStock: 500, currentStock: 1200 }
];

// Initial Production Processes
export const INITIAL_PROCESSES: ProductionProcess[] = [
  {
    id: 'PRC-RECB',
    name: 'Recebimento e Inspeção de TDI/Tecidos',
    inputs: ['TDI Químico', 'Tecido Cru', 'Fio de Poliéster'],
    outputs: ['Insumos Aprovados e Classificados', 'Ficha de Qualidade Lotes'],
    machineIds: [],
    peopleInvolved: 2,
    standardTimeMinutes: 20,
    observedTimeMinutes: 22,
    observations: 'Inspeção visual e teste de densidade em amostra de espuma.'
  },
  {
    id: 'PRC-CORTE',
    name: 'Corte e Laminação de Blocos de Espuma D33',
    inputs: ['Espuma Industrial Bloco D33 Amarela'],
    outputs: ['Prancha de Espuma D33 Suporte (158x198x20)', 'Aparas Reutilizáveis'],
    machineIds: ['MAC-COR-01', 'MAC-COR-02'],
    peopleInvolved: 3,
    standardTimeMinutes: 8,
    observedTimeMinutes: 7.5,
    observations: 'Corte horizontal automatizado CNC com alinhamento de faca.'
  },
  {
    id: 'PRC-QUILT',
    name: 'Quilting de Tampas em Jacquard Estofado',
    inputs: ['Tecido Jacquard Belga 240g - Tampas', 'Espuma Soft D28 Azul Conforto', 'Fio de Quilting Poliamida'],
    outputs: ['Tampo de Colchão Quilfado Acabado'],
    machineIds: ['MAC-COS-01'],
    peopleInvolved: 1,
    standardTimeMinutes: 12,
    observedTimeMinutes: 15,
    observations: 'Gargalo devido à velocidade das cabeças de costura do equipamento Q-10.'
  },
  {
    id: 'PRC-MONT',
    name: 'Montagem de Núcleo e Laminação Interna (Colagem)',
    inputs: ['Molejo Carcaça Pocket Queen', 'Espuma Soft D28 Azul Conforto', 'Cola Hotmelt de Contato'],
    outputs: ['Carcaça Estofada Colada (Frame de Espuma)'],
    machineIds: ['MAC-MON-02'],
    peopleInvolved: 4,
    standardTimeMinutes: 15,
    observedTimeMinutes: 14.2,
    observations: 'Exige prensamento rápido manual e tempo de cura fria rápida de cola hotmelt.'
  },
  {
    id: 'PRC-TAPE',
    name: 'Costura de Fechamento de Bordas (Tape Edge)',
    inputs: ['Carcaça Estofada Colada', 'Tampo de Colchão Quilfado Acabado', 'Tecido Lateral Suede Cinza'],
    outputs: ['Colchão Estruturado Totalmente Costurado'],
    machineIds: ['MAC-MON-01'],
    peopleInvolved: 2,
    standardTimeMinutes: 10,
    observedTimeMinutes: 9.8,
    observations: 'Processo altamente artesanal, dependente do operador dar a volta no trilho circular.'
  },
  {
    id: 'PRC-EMB',
    name: 'Compactação de Vácuo e Enrolamento (Roll-Pack)',
    inputs: ['Colchão Estruturado Totalmente Costurado', 'Saco Plástico PE Retrátil Imagem Queen', 'Etiqueta Bordada INMETRO'],
    outputs: ['Colchão Recomprimido Roll Pack (Cilindro Compactado)'],
    machineIds: ['MAC-EMB-01'],
    peopleInvolved: 2,
    standardTimeMinutes: 5,
    observedTimeMinutes: 4.8,
    observations: 'Compactação pneumática potente de 20 toneladas seguida por envelopamento espiral automático.'
  }
];

// Initial Time Studies (Cronometragem Industrial)
export const INITIAL_TIME_STUDIES: TimeMeasurement[] = [
  { id: 'TMS-001', processId: 'PRC-CORTE', operatorName: 'Carlos P.', machineId: 'MAC-COR-01', startTime: '08:00:00', endTime: '08:07:30', durationSeconds: 450, quantityProduced: 1, date: '2026-06-15' },
  { id: 'TMS-002', processId: 'PRC-CORTE', operatorName: 'Carlos P.', machineId: 'MAC-COR-01', startTime: '08:15:00', endTime: '08:22:12', durationSeconds: 432, quantityProduced: 1, date: '2026-06-15' },
  { id: 'TMS-003', processId: 'PRC-CORTE', operatorName: 'Carlos P.', machineId: 'MAC-COR-01', startTime: '08:30:00', endTime: '08:38:00', durationSeconds: 480, quantityProduced: 1, date: '2026-06-15' },
  
  { id: 'TMS-004', processId: 'PRC-QUILT', operatorName: 'Fernanda O.', machineId: 'MAC-COS-01', startTime: '09:00:00', endTime: '09:16:30', durationSeconds: 990, quantityProduced: 1, date: '2026-06-15' },
  { id: 'TMS-005', processId: 'PRC-QUILT', operatorName: 'Fernanda O.', machineId: 'MAC-COS-01', startTime: '09:20:00', endTime: '09:34:00', durationSeconds: 840, quantityProduced: 1, date: '2026-06-15' },
  { id: 'TMS-006', processId: 'PRC-QUILT', operatorName: 'Fernanda O.', machineId: 'MAC-COS-01', startTime: '09:40:00', endTime: '09:53:15', durationSeconds: 795, quantityProduced: 1, date: '2026-06-15' },
  
  { id: 'TMS-007', processId: 'PRC-TAPE', operatorName: 'Antônio L.', machineId: 'MAC-MON-01', startTime: '10:00:00', endTime: '10:10:05', durationSeconds: 605, quantityProduced: 1, date: '2026-06-16' },
  { id: 'TMS-008', processId: 'PRC-TAPE', operatorName: 'Antônio L.', machineId: 'MAC-MON-01', startTime: '10:15:00', endTime: '10:24:20', durationSeconds: 560, quantityProduced: 1, date: '2026-06-16' },
  { id: 'TMS-009', processId: 'PRC-TAPE', operatorName: 'Antônio L.', machineId: 'MAC-MON-01', startTime: '10:30:00', endTime: '10:39:50', durationSeconds: 590, quantityProduced: 1, date: '2026-06-16' }
];

// Initial Product Engineering Models
export const INITIAL_PRODUCTS: ProductModel[] = [
  {
    id: 'PRD-QN-MOL',
    modelName: 'Pró-Vida Pocket Premium',
    category: 'Queen',
    dimensions: '158 x 198 x 30 cm',
    density: 'Molas Ensacadas + D33',
    heightCm: 30,
    composition: 'Molejo Pocket Ensacado Pro + Acabamento Superior em Viscoelástico D33 Comfort + Suede Lateral',
    tags: ['Mola Pocket', 'Conforto Premium', 'Campeão Inventário']
  },
  {
    id: 'PRD-CS-E33',
    modelName: 'Maximaxi Ortopédico de Alta Performance',
    category: 'Casal',
    dimensions: '138 x 188 x 25 cm',
    density: 'Espuma D33',
    heightCm: 25,
    composition: 'Bloco Maciço de Espuma Industrial de Suporte Firme D33 Certificado Inmetro',
    tags: ['Espuma Firme', 'Inmetro', 'Alta Elasticidade']
  },
  {
    id: 'PRD-KS-SUP',
    modelName: 'King Real Royal Imperial',
    category: 'King',
    dimensions: '193 x 203 x 35 cm',
    density: 'Molas Pocket Pro + D45 Super Soft',
    heightCm: 35,
    composition: 'Estruturação Dual Molejo Híbrido, Espumas de Amortecimento Macias D45 e pillow top Jacquard Belga Extra Soft',
    tags: ['Luxo', 'Dual-Core', 'Grandes Dimensões']
  },
  {
    id: 'PRD-ST-E28',
    modelName: 'Estudantil Soft D28 Compacto',
    category: 'Solteiro',
    dimensions: '088 x 188 x 18 cm',
    density: 'Espuma D28',
    heightCm: 18,
    composition: 'Placa Integrada de Espuma Flexível D28 Macia Ideal para Juvenil',
    tags: ['Custo Operacional Baixo', 'Espuma D28']
  }
];

// Initial BOM (Bill of Materials) Versions and contents
export const INITIAL_BOMS: BOMVersion[] = [
  {
    id: 'BOM-QN-MOL-V1',
    productId: 'PRD-QN-MOL',
    version: 'V1.0',
    revision: 2,
    validFrom: '2025-01-01',
    validTo: undefined,
    isActive: true,
    items: [
      { id: 'BI-001', productId: 'PRD-QN-MOL', materialId: 'MAT-MOL-PK2', unitConsumption: 1, expectedLossPercent: 0 }, // Carcaça de molas
      { id: 'BI-002', productId: 'PRD-QN-MOL', materialId: 'MAT-ESP-D33', unitConsumption: 18.2, expectedLossPercent: 5 }, // Espuma amarela kg
      { id: 'BI-003', productId: 'PRD-QN-MOL', materialId: 'MAT-ESP-D28', unitConsumption: 12.5, expectedLossPercent: 8 }, // Espuma soft kg
      { id: 'BI-004', productId: 'PRD-QN-MOL', materialId: 'MAT-TEC-JAQ', unitConsumption: 6.8, expectedLossPercent: 12 }, // Tecido tampas m2
      { id: 'BI-005', productId: 'PRD-QN-MOL', materialId: 'MAT-TEC-SUD', unitConsumption: 4.2, expectedLossPercent: 6 }, // Tecido lateral suede m2
      { id: 'BI-006', productId: 'PRD-QN-MOL', materialId: 'MAT-LIN-080', unitConsumption: 0.15, expectedLossPercent: 10 }, // Fio quilting rolo
      { id: 'BI-007', productId: 'PRD-QN-MOL', materialId: 'MAT-COL-HOT', unitConsumption: 2.8, expectedLossPercent: 15 }, // Cola hotmelt kg
      { id: 'BI-008', productId: 'PRD-QN-MOL', materialId: 'MAT-EMB-QN', unitConsumption: 1, expectedLossPercent: 2 }, // Saco plástico un
      { id: 'BI-009', productId: 'PRD-QN-MOL', materialId: 'MAT-ETI-REG', unitConsumption: 1, expectedLossPercent: 0 }  // Etiqueta bordada
    ]
  },
  {
    id: 'BOM-CS-E33-V1',
    productId: 'PRD-CS-E33',
    version: 'V1.0',
    revision: 1,
    validFrom: '2025-03-10',
    validTo: undefined,
    isActive: true,
    items: [
      { id: 'BI-021', productId: 'PRD-CS-E33', materialId: 'MAT-ESP-D33', unitConsumption: 32.4, expectedLossPercent: 4 }, // Bloco kg
      { id: 'BI-022', productId: 'PRD-CS-E33', materialId: 'MAT-TEC-JAQ', unitConsumption: 5.2, expectedLossPercent: 10 }, // Tampas m2
      { id: 'BI-023', productId: 'PRD-CS-E33', materialId: 'MAT-COL-HOT', unitConsumption: 1.2, expectedLossPercent: 10 },
      { id: 'BI-024', productId: 'PRD-CS-E33', materialId: 'MAT-ETI-REG', unitConsumption: 1, expectedLossPercent: 0 }
    ]
  }
];

// Initial Work Centers (Centros de Trabalho)
export const INITIAL_WORK_CENTERS: WorkCenter[] = [
  { id: 'WC-CORTE', name: 'Centro de Trabalho - Espumação & Corte', capacityUnitsHour: 120, efficiencyPercent: 92, availabilityPercent: 95, idleHoursPerWeek: 8 },
  { id: 'WC-COST', name: 'Centro de Trabalho - Quilting & Costura', capacityUnitsHour: 45, efficiencyPercent: 88, availabilityPercent: 90, idleHoursPerWeek: 12 },
  { id: 'WC-MONT', name: 'Centro de Trabalho - Colagem e Montagem', capacityUnitsHour: 35, efficiencyPercent: 85, availabilityPercent: 94, idleHoursPerWeek: 4 },
  { id: 'WC-ACAB', name: 'Centro de Trabalho - Tape Edge (Fechamento)', capacityUnitsHour: 25, efficiencyPercent: 90, availabilityPercent: 96, idleHoursPerWeek: 3 },
  { id: 'WC-EMB', name: 'Centro de Trabalho - Prensa e Roll-Pack', capacityUnitsHour: 60, efficiencyPercent: 95, availabilityPercent: 98, idleHoursPerWeek: 6 }
];

// Initial Documents
export const INITIAL_DOCUMENTS: IndustrialDocument[] = [
  { id: 'DOC-001', title: 'IT-01: Controle de Densidade de Espumação', type: 'Instrução', fileName: 'it_espumacao_densidade_v3.pdf', uploadDate: '2025-05-12', associatedType: 'Processo', associatedId: 'PRC-RECB' },
  { id: 'DOC-002', title: 'MP-01: Manual de Operação Laminadora B01', type: 'Manual', fileName: 'manual_laminadora_albrecht_300.pdf', uploadDate: '2022-04-15', associatedType: 'Máquina', associatedId: 'MAC-COR-01' },
  { id: 'DOC-003', title: 'IT-04: Guia do Processo de Tape Edge Circular', type: 'Instrução', fileName: 'it_virola_fechamento_v2.pdf', uploadDate: '2026-02-18', associatedType: 'Processo', associatedId: 'PRC-TAPE' },
  { id: 'DOC-004', title: 'CQ-08: Certificação Inmetro D33 Espumas Firme', type: 'Certificado', fileName: 'cert_inmetro_espumas_d33_2026.pdf', uploadDate: '2026-01-05', associatedType: 'Produto', associatedId: 'PRD-CS-E33' },
  { id: 'DOC-005', title: 'MP-04: Manual Técnico Prensa Teknomac X', type: 'Manual', fileName: 'manual_rollpack_2000x.pdf', uploadDate: '2023-06-20', associatedType: 'Máquina', associatedId: 'MAC-EMB-01' }
];
