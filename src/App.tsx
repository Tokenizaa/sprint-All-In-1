/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Cpu, 
  Layers, 
  Layers3, 
  ClipboardCheck, 
  Clock, 
  Target, 
  Boxes, 
  FileText, 
  UserSquare, 
  User, 
  LogOut, 
  Menu, 
  X,
  Compass,
  ArrowRightLeft,
  Factory,
  Database
} from 'lucide-react';

// Types
import { 
  UserRole, 
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
  MachineStatus
} from './types';

// Initial Data
import { 
  ROLE_PERMISSIONS, 
  INITIAL_UNITS, 
  INITIAL_SECTORS, 
  INITIAL_LINES, 
  INITIAL_MACHINES, 
  INITIAL_TOOLS, 
  INITIAL_SUPPLIERS, 
  INITIAL_RAW_MATERIALS, 
  INITIAL_PROCESSES, 
  INITIAL_TIME_STUDIES, 
  INITIAL_PRODUCTS, 
  INITIAL_BOMS, 
  INITIAL_WORK_CENTERS, 
  INITIAL_DOCUMENTS 
} from './initialData';

// Components
import Dashboard from './components/Dashboard';
import Organizational from './components/Organizational';
import Machines from './components/Machines';
import Materials from './components/Materials';
import Processes from './components/Processes';
import Capacity from './components/Capacity';
import Engineering from './components/Engineering';
import Industrial360 from './components/Industrial360';
import Documentation from './components/Documentation';

export default function App() {
  
  // State managers with localStorage fallback loaders
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('ind_app_tab') || 'dashboard';
  });
  
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    return (localStorage.getItem('ind_app_role') as UserRole) || 'AdminIndustrial';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data Lists
  const [units, setUnits] = useState<Unit[]>(() => {
    const saved = localStorage.getItem('ind_units');
    return saved ? JSON.parse(saved) : INITIAL_UNITS;
  });

  const [sectors, setSectors] = useState<Sector[]>(() => {
    const saved = localStorage.getItem('ind_sectors');
    return saved ? JSON.parse(saved) : INITIAL_SECTORS;
  });

  const [lines, setLines] = useState<ProductionLine[]>(() => {
    const saved = localStorage.getItem('ind_lines');
    return saved ? JSON.parse(saved) : INITIAL_LINES;
  });

  const [machines, setMachines] = useState<Machine[]>(() => {
    const saved = localStorage.getItem('ind_machines');
    return saved ? JSON.parse(saved) : INITIAL_MACHINES;
  });

  const [tools, setTools] = useState<Tool[]>(() => {
    const saved = localStorage.getItem('ind_tools');
    return saved ? JSON.parse(saved) : INITIAL_TOOLS;
  });

  const [materials, setMaterials] = useState<RawMaterial[]>(() => {
    const saved = localStorage.getItem('ind_materials');
    return saved ? JSON.parse(saved) : INITIAL_RAW_MATERIALS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('ind_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [processes, setProcesses] = useState<ProductionProcess[]>(() => {
    const saved = localStorage.getItem('ind_processes');
    return saved ? JSON.parse(saved) : INITIAL_PROCESSES;
  });

  const [timeStudies, setTimeStudies] = useState<TimeMeasurement[]>(() => {
    const saved = localStorage.getItem('ind_time_studies');
    return saved ? JSON.parse(saved) : INITIAL_TIME_STUDIES;
  });

  const [products, setProducts] = useState<ProductModel[]>(() => {
    const saved = localStorage.getItem('ind_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [boms, setBoms] = useState<BOMVersion[]>(() => {
    const saved = localStorage.getItem('ind_boms');
    return saved ? JSON.parse(saved) : INITIAL_BOMS;
  });

  const [workCenters, setWorkCenters] = useState<WorkCenter[]>(() => {
    const saved = localStorage.getItem('ind_work_centers');
    return saved ? JSON.parse(saved) : INITIAL_WORK_CENTERS;
  });

  const [documents, setDocuments] = useState<IndustrialDocument[]>(() => {
    const saved = localStorage.getItem('ind_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  // Persistence triggers
  useEffect(() => {
    localStorage.setItem('ind_app_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('ind_app_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('ind_units', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('ind_sectors', JSON.stringify(sectors));
  }, [sectors]);

  useEffect(() => {
    localStorage.setItem('ind_lines', JSON.stringify(lines));
  }, [lines]);

  useEffect(() => {
    localStorage.setItem('ind_machines', JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem('ind_tools', JSON.stringify(tools));
  }, [tools]);

  useEffect(() => {
    localStorage.setItem('ind_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('ind_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('ind_processes', JSON.stringify(processes));
  }, [processes]);

  useEffect(() => {
    localStorage.setItem('ind_time_studies', JSON.stringify(timeStudies));
  }, [timeStudies]);

  useEffect(() => {
    localStorage.setItem('ind_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ind_boms', JSON.stringify(boms));
  }, [boms]);

  useEffect(() => {
    localStorage.setItem('ind_work_centers', JSON.stringify(workCenters));
  }, [workCenters]);

  useEffect(() => {
    localStorage.setItem('ind_documents', JSON.stringify(documents));
  }, [documents]);

  // Perms lookup matching permissions schema
  const activeRolePermissions = ROLE_PERMISSIONS.find(r => r.role === activeRole) || ROLE_PERMISSIONS[0];

  // Helper verify module permission
  const hasModuleReadPermission = (moduleKey: string) => {
    return activeRolePermissions.modules[moduleKey]?.read ?? true;
  };

  const hasModuleWritePermission = (moduleKey: string) => {
    return activeRolePermissions.modules[moduleKey]?.write ?? false;
  };

  // Reset database state back to standard template presets
  const handleResetDatabase = () => {
    if (confirm('Deseja resetar todos os dados industriais para os padrões da fábrica de colchões? Suas customizações locais serão limpas.')) {
      localStorage.clear();
      setUnits(INITIAL_UNITS);
      setSectors(INITIAL_SECTORS);
      setLines(INITIAL_LINES);
      setMachines(INITIAL_MACHINES);
      setTools(INITIAL_TOOLS);
      setMaterials(INITIAL_RAW_MATERIALS);
      setSuppliers(INITIAL_SUPPLIERS);
      setProcesses(INITIAL_PROCESSES);
      setTimeStudies(INITIAL_TIME_STUDIES);
      setProducts(INITIAL_PRODUCTS);
      setBoms(INITIAL_BOMS);
      setWorkCenters(INITIAL_WORK_CENTERS);
      setDocuments(INITIAL_DOCUMENTS);
      setActiveTab('dashboard');
      setActiveRole('AdminIndustrial');
      alert('Banco de dados inicializado com sucesso.');
    }
  };

  // State append and delete controllers
  const handleAddUnit = (u: Unit) => setUnits(prev => [u, ...prev]);
  const handleDeleteUnit = (id: string) => setUnits(prev => prev.filter(item => item.id !== id));

  const handleAddSector = (s: Sector) => setSectors(prev => [s, ...prev]);
  const handleDeleteSector = (id: string) => setSectors(prev => prev.filter(item => item.id !== id));

  const handleAddLine = (l: ProductionLine) => setLines(prev => [l, ...prev]);
  const handleDeleteLine = (id: string) => setLines(prev => prev.filter(item => item.id !== id));

  const handleAddWorkCenter = (wc: WorkCenter) => setWorkCenters(prev => [wc, ...prev]);
  const handleDeleteWorkCenter = (id: string) => setWorkCenters(prev => prev.filter(item => item.id !== id));

  const handleAddMachine = (m: Machine) => setMachines(prev => [m, ...prev]);
  const handleDeleteMachine = (id: string) => setMachines(prev => prev.filter(item => item.id !== id));
  
  const handleUpdateMachineStatus = (id: string, status: MachineStatus) => {
    setMachines(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  const handleAddTool = (t: Tool) => setTools(prev => [t, ...prev]);
  const handleDeleteTool = (id: string) => setTools(prev => prev.filter(item => item.id !== id));

  const handleAddMaterial = (m: RawMaterial) => setMaterials(prev => [m, ...prev]);
  const handleDeleteMaterial = (id: string) => setMaterials(prev => prev.filter(item => item.id !== id));

  const handleAddSupplier = (s: Supplier) => setSuppliers(prev => [s, ...prev]);
  const handleDeleteSupplier = (id: string) => setSuppliers(prev => prev.filter(item => item.id !== id));

  const handleAddProcess = (p: ProductionProcess) => setProcesses(prev => [p, ...prev]);
  const handleDeleteProcess = (id: string) => setProcesses(prev => prev.filter(item => item.id !== id));

  const handleAddTimeStudy = (tm: TimeMeasurement) => setTimeStudies(prev => [tm, ...prev]);
  const handleDeleteTimeStudy = (id: string) => setTimeStudies(prev => prev.filter(item => item.id !== id));

  const handleAddProduct = (p: ProductModel) => setProducts(prev => [p, ...prev]);
  const handleDeleteProduct = (id: string) => setProducts(prev => prev.filter(item => item.id !== id));

  const handleAddBOMVersion = (v: BOMVersion) => setBoms(prev => [v, ...prev]);
  const handleDeleteBOMVersion = (id: string) => setBoms(prev => prev.filter(item => item.id !== id));

  const handleAddDocument = (d: IndustrialDocument) => setDocuments(prev => [d, ...prev]);
  const handleDeleteDocument = (id: string) => setDocuments(prev => prev.filter(item => item.id !== id));

  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: Building2 },
    { id: 'org', label: 'Estrutura Org.', icon: Factory },
    { id: 'machines', label: 'Maquinário &amp; Ativos', icon: Cpu },
    { id: 'materials', label: 'Materiais &amp; Supr.', icon: Layers3 },
    { id: 'processes', label: 'Estudo de Tempos', icon: Clock },
    { id: 'capacity', label: 'Capacidade Fábrica', icon: Target },
    { id: 'engineering', label: 'Engenharia Produto', icon: Boxes },
    { id: 'industry360', label: 'Cockpit 360', icon: ArrowRightLeft },
    { id: 'documents', label: 'DocCenter', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      
      {/* Sidebar for navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-200 shrink-0 border-r border-slate-800 shadow-xl z-20 flex flex-col justify-between">
        <div>
          {/* Brand Logo Layout */}
          <div className="p-4 px-5 border-b border-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 px-2.5 bg-orange-500 rounded text-slate-950 font-display font-extrabold text-sm tracking-wider">
                I_OS
              </div>
              <div>
                <h2 className="font-display font-bold text-white text-md tracking-tight leading-tight">Industrial OS</h2>
                <span className="text-xxs font-mono text-slate-400">MATTRESS ENTERPRISE</span>
              </div>
            </div>

            {/* Mobile menu triggers */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-slate-400 hover:text-white md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Menu Links */}
          <nav className={`p-4 space-y-1.5 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            <span className="block text-xxxxs font-mono uppercase tracking-widest text-slate-500 px-2.5 mb-2 font-bold">Módulos de Gestão</span>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              const isAuthorized = hasModuleReadPermission(item.id);
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isAuthorized) {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    } else {
                      alert(`Acesso restrito. Seu perfil (${activeRolePermissions.label}) não possui autorização de leitura para este módulo.`);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-2.5 px-3 rounded-lg text-xs font-medium font-mono transition cursor-pointer ${
                    isSelected 
                      ? 'bg-orange-500 text-slate-950 font-bold shadow-md shadow-orange-500/10' 
                      : !isAuthorized
                      ? 'opacity-40 text-slate-500 cursor-not-allowed'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: `
                      <span class="flex items-center gap-2.5">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <!-- dynamic svg placeholder rendered nicely -->
                        </svg>
                        <span>${item.label}</span>
                      </span>
                      ${!isAuthorized ? '<span class="text-xxxxs border border-slate-700 px-1 py-0.2 rounded font-extrabold uppercase">LOCK</span>' : ''}
                    `
                  }}
                />
              );
            })}
          </nav>
        </div>

        {/* Sidebar user and reset profile links */}
        <div className={`p-4 border-t border-slate-850 bg-slate-950/30 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          <button
            onClick={handleResetDatabase}
            className="w-full mb-3 text-center p-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 rounded-lg text-xxxxs uppercase tracking-wider font-mono text-slate-400 font-bold flex items-center justify-center gap-1 cursor-pointer transition"
          >
            <Database className="w-3 h-3 text-orange-500" />
            Resetar Fábrica Presets
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-850 flex items-center justify-center text-slate-300 font-bold text-xs ring-2 ring-orange-500/30">
              U
            </div>
            <div className="overflow-hidden">
              <span className="block text-xxs font-mono font-bold text-white truncate leading-none mb-0.5">Operador Atual</span>
              <span className="block text-xxxxxs tracking-wider text-orange-500 font-mono leading-none font-bold uppercase truncate">
                {activeRolePermissions.label}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main viewport Container area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Upper Master control navbar - features role switcher */}
        <header className="bg-white border-b border-slate-200 p-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-3 z-10 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="text-xxs font-mono text-slate-500 font-medium">PLANO OPERACIONAL COLCHÕES: <strong className="text-slate-800">CAMPANHA_V1_STATUS_OK_2026</strong></span>
          </div>

          {/* Persona role switcher picker */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xxs font-mono text-slate-500">Perfil:</span>
            
            <select
              value={activeRole}
              onChange={(e) => {
                const selRole = e.target.value as UserRole;
                setActiveRole(selRole);
                
                // If switching role denies access to current tab, redirect to dashboard
                const newPerms = ROLE_PERMISSIONS.find(r => r.role === selRole);
                if (newPerms && !newPerms.modules[activeTab]?.read) {
                  setActiveTab('dashboard');
                }
              }}
              className="text-xxs font-mono bg-slate-100 hover:bg-slate-150 p-1.5 px-3 rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden font-bold cursor-pointer transition-colors"
            >
              {ROLE_PERMISSIONS.map(r => (
                <option key={r.role} value={r.role}>{r.label}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Content canvas viewport responsive area */}
        <div id="application-view-stage" className="p-4 md:p-6 lg:p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              machines={machines}
              materials={materials}
              suppliers={suppliers}
              processes={processes}
              products={products}
              workCenters={workCenters}
              activeRole={activeRolePermissions.label}
              onNavigate={(tab) => {
                if (hasModuleReadPermission(tab)) {
                  setActiveTab(tab);
                } else {
                  alert('Seu perfil atual não permite acessar o módulo desejado.');
                }
              }}
            />
          )}

          {activeTab === 'org' && (
            <Organizational
              units={units}
              sectors={sectors}
              lines={lines}
              workCenters={workCenters}
              onAddUnit={handleAddUnit}
              onAddSector={handleAddSector}
              onAddLine={handleAddLine}
              onAddWorkCenter={handleAddWorkCenter}
              onDeleteUnit={handleDeleteUnit}
              onDeleteSector={handleDeleteSector}
              onDeleteLine={handleDeleteLine}
              onDeleteWorkCenter={handleDeleteWorkCenter}
              hasWritePermission={hasModuleWritePermission('org')}
            />
          )}

          {activeTab === 'machines' && (
            <Machines
              machines={machines}
              tools={tools}
              sectors={sectors}
              onAddMachine={handleAddMachine}
              onAddTool={handleAddTool}
              onUpdateMachineStatus={handleUpdateMachineStatus}
              onDeleteMachine={handleDeleteMachine}
              onDeleteTool={handleDeleteTool}
              hasWritePermission={hasModuleWritePermission('machines')}
            />
          )}

          {activeTab === 'materials' && (
            <Materials
              materials={materials}
              suppliers={suppliers}
              onAddMaterial={handleAddMaterial}
              onAddSupplier={handleAddSupplier}
              onDeleteMaterial={handleDeleteMaterial}
              onDeleteSupplier={handleDeleteSupplier}
              hasWritePermission={hasModuleWritePermission('materials')}
            />
          )}

          {activeTab === 'processes' && (
            <Processes
              processes={processes}
              timeStudies={timeStudies}
              machines={machines}
              onAddProcess={handleAddProcess}
              onAddTimeStudy={handleAddTimeStudy}
              onDeleteProcess={handleDeleteProcess}
              onDeleteTimeStudy={handleDeleteTimeStudy}
              hasWritePermission={hasModuleWritePermission('timeStudy')}
            />
          )}

          {activeTab === 'capacity' && (
            <Capacity
              machines={machines}
              processes={processes}
              sectors={sectors}
              units={units}
              workCenters={workCenters}
            />
          )}

          {activeTab === 'engineering' && (
            <Engineering
              products={products}
              boms={boms}
              materials={materials}
              onAddProduct={handleAddProduct}
              onAddBOMVersion={handleAddBOMVersion}
              onDeleteProduct={handleDeleteProduct}
              onDeleteBOMVersion={handleDeleteBOMVersion}
              hasWritePermission={hasModuleWritePermission('engineering')}
            />
          )}

          {activeTab === 'industry360' && (
            <Industrial360
              machines={machines}
              processes={processes}
              products={products}
              boms={boms}
              materials={materials}
              documents={documents}
              timeStudies={timeStudies}
            />
          )}

          {activeTab === 'documents' && (
            <Documentation
              documents={documents}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
              hasWritePermission={hasModuleWritePermission('documents')}
            />
          )}
        </div>

      </main>

    </div>
  );
}
