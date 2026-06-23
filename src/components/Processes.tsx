/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardCheck, 
  Clock, 
  Plus, 
  Trash2, 
  Play, 
  Square, 
  Save, 
  History, 
  Check, 
  Cpu, 
  User, 
  Activity, 
  Calculator,
  Timer,
  Info
} from 'lucide-react';
import { ProductionProcess, TimeMeasurement, Machine, Sector } from '../types';

interface ProcessesProps {
  processes: ProductionProcess[];
  timeStudies: TimeMeasurement[];
  machines: Machine[];
  onAddProcess: (process: ProductionProcess) => void;
  onAddTimeStudy: (study: TimeMeasurement) => void;
  onDeleteProcess: (id: string) => void;
  onDeleteTimeStudy: (id: string) => void;
  hasWritePermission: boolean;
}

export default function Processes({
  processes,
  timeStudies,
  machines,
  onAddProcess,
  onAddTimeStudy,
  onDeleteProcess,
  onDeleteTimeStudy,
  hasWritePermission
}: ProcessesProps) {
  
  const [activeTab, setActiveTab] = useState<'mapping' | 'chronometer' | 'history'>('mapping');

  // Interactive Stopwatch states
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedChronoProcess, setSelectedChronoProcess] = useState('');
  const [selectedChronoOperator, setSelectedChronoOperator] = useState('Op. Carlos Pereira');
  const [selectedChronoMachine, setSelectedChronoMachine] = useState('');
  const [timerStartDateStr, setTimerStartDateStr] = useState('');
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Form states for Process Mapping
  const [procForm, setProcForm] = useState({
    id: '', name: '', inputsRaw: '', outputsRaw: '',
    machineIdCsv: '', peopleInvolved: 2, standardTimeMinutes: 10,
    observedTimeMinutes: 10, observations: ''
  });

  // Calculate stats for a given processId
  const getProcessTimeStats = (processId: string) => {
    const relatedstudies = timeStudies.filter(t => t.processId === processId);
    if (relatedstudies.length === 0) return null;

    const durationsSec = relatedstudies.map(r => r.durationSeconds);
    const minSec = Math.min(...durationsSec);
    const maxSec = Math.max(...durationsSec);
    const avgSec = Math.round(durationsSec.reduce((a, b) => a + b, 0) / durationsSec.length);

    // convert to string minutes:seconds
    const formatTime = (secs: number) => {
      const mins = Math.floor(secs / 60);
      const remainingSecs = secs % 60;
      return `${mins}m ${remainingSecs}s`;
    };

    return {
      min: formatTime(minSec),
      avg: formatTime(avgSec),
      max: formatTime(maxSec),
      count: relatedstudies.length
    };
  };

  // Chronometer stopwatch control logic
  useEffect(() => {
    if (isTimerRunning) {
      const now = new Date();
      setTimerStartDateStr(now.toTimeString().split(' ')[0]);
      
      stopwatchIntervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
        stopwatchIntervalRef.current = null;
      }
    }

    return () => {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    };
  }, [isTimerRunning]);

  const handleStartStopwatch = () => {
    if (!selectedChronoProcess) return;
    setElapsedSeconds(0);
    setIsTimerRunning(true);
  };

  const handleStopStopwatch = () => {
    setIsTimerRunning(false);
  };

  const handleSaveMeasurement = () => {
    if (!selectedChronoProcess || elapsedSeconds === 0) return;
    
    const studyId = `TMS-${Math.floor(Math.random() * 900) + 100}`;
    const nowTimeStr = new Date().toTimeString().split(' ')[0];
    
    onAddTimeStudy({
      id: studyId,
      processId: selectedChronoProcess,
      operatorName: selectedChronoOperator || 'Operador Geral',
      machineId: selectedChronoMachine || 'Bancada Manual',
      startTime: timerStartDateStr || '00:00:00',
      endTime: nowTimeStr,
      durationSeconds: elapsedSeconds,
      quantityProduced: 1, // standard unit timing
      date: new Date().toISOString().split('T')[0]
    });

    // reset clock
    setElapsedSeconds(0);
    alert('Medição registrada no banco de estudos de tempos em tempo real com sucesso!');
  };

  // Form submit process mapping
  const handleProcessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procForm.id || !procForm.name) return;

    const inputs = procForm.inputsRaw ? procForm.inputsRaw.split(',').map(i => i.trim()) : [];
    const outputs = procForm.outputsRaw ? procForm.outputsRaw.split(',').map(o => o.trim()) : [];
    const machinesSelected = procForm.machineIdCsv ? procForm.machineIdCsv.split(',').map(m => m.trim()) : [];

    onAddProcess({
      id: procForm.id,
      name: procForm.name,
      inputs,
      outputs,
      machineIds: machinesSelected,
      peopleInvolved: Number(procForm.peopleInvolved) || 1,
      standardTimeMinutes: Number(procForm.standardTimeMinutes) || 0,
      observedTimeMinutes: Number(procForm.observedTimeMinutes) || 0,
      observations: procForm.observations
    });

    setProcForm({
      id: '', name: '', inputsRaw: '', outputsRaw: '',
      machineIdCsv: '', peopleInvolved: 2, standardTimeMinutes: 10,
      observedTimeMinutes: 10, observations: ''
    });
  };

  // format seconds to readable mm:ss for history lists
  const formatSeconds = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Processos Produtivos &amp; Estudo de Tempos</h2>
          <p className="text-xs text-slate-500">Mapeador de engenharia de ciclo produtivo e cronometragem industrial para determinação de eficiência.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('mapping')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition font-mono flex items-center gap-1.5 ${
              activeTab === 'mapping' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
            Mapeamento ({processes.length})
          </button>
          <button
            onClick={() => setActiveTab('chronometer')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition font-mono flex items-center gap-1.5 ${
              activeTab === 'chronometer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Timer className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
            Cronômetro Real-Time
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition font-mono flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-blue-500" />
            Histórico Medições ({timeStudies.length})
          </button>
        </div>
      </div>

      {/* Main interactive dashboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left components (takes 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* TAB 1: PROCESS MAPPING */}
          {activeTab === 'mapping' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center header">
                  <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-500">Fluxos de Manufatura de Colchões</span>
                  <span className="text-xxs font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">Processos: {processes.length}</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {processes.map((proc) => {
                    const stats = getProcessTimeStats(proc.id);
                    return (
                      <div key={proc.id} className="p-5 hover:bg-slate-50/50 transition flex flex-col md:flex-row justify-between gap-5">
                        <div className="space-y-3 flex-1">
                          
                          {/* Title & IDs */}
                          <div>
                            <span className="text-xxxxs font-mono bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-bold">
                              {proc.id}
                            </span>
                            <h3 className="font-display font-semibold text-slate-800 text-sm mt-0.5">{proc.name}</h3>
                          </div>

                          {/* Inputs & Outputs Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xxs font-mono">
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-150">
                              <span className="block font-bold text-slate-400 uppercase tracking-wider text-xxxxs mb-1">Materiais de ENTRADA (Inputs)</span>
                              <div className="flex flex-wrap gap-1">
                                {proc.inputs.map((inp, idx) => (
                                  <span key={idx} className="bg-white px-1.5 py-0.5 rounded border text-slate-600">
                                    {inp}
                                  </span>
                                ))}
                                {proc.inputs.length === 0 && <span className="text-slate-400">Nenhum mapeado</span>}
                              </div>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-150">
                              <span className="block font-bold text-slate-400 uppercase tracking-wider text-xxxxs mb-1">Resultados de SAÍDA (Outputs)</span>
                              <div className="flex flex-wrap gap-1">
                                {proc.outputs.map((out, idx) => (
                                  <span key={idx} className="bg-white px-1.5 py-0.5 rounded border text-emerald-600 font-medium">
                                    {out}
                                  </span>
                                ))}
                                {proc.outputs.length === 0 && <span className="text-slate-400">Nenhum mapeado</span>}
                              </div>
                            </div>
                          </div>

                          {/* Operational info */}
                          <div className="flex flex-wrap items-center gap-4 text-xxs font-mono text-slate-550 border-t border-slate-100 pt-2.5">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" /> Operadores: <strong className="text-slate-800">{proc.peopleInvolved}</strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> Tempo Padrão: <strong className="text-slate-800">{proc.standardTimeMinutes} min</strong>
                            </span>
                            <span>•</span>
                            <span>Máquinas: <strong className="text-slate-700">{proc.machineIds.join(', ') || 'Processo Manual'}</strong></span>
                          </div>

                          {proc.observations && (
                            <p className="text-xxs text-slate-400 bg-slate-50 p-2 rounded font-mono">
                              <strong>Obs:</strong> {proc.observations}
                            </p>
                          )}
                        </div>

                        {/* Chronometric Times Analysis Panel - Calculates dynamic studies */}
                        <div className="w-full md:w-52 md:border-l border-slate-100 md:pl-5 flex flex-col justify-between shrink-0">
                          <div>
                            <span className="text-xxxxs uppercase font-mono tracking-wider font-extrabold block text-slate-400 mb-1 flex items-center gap-0.5">
                              <Calculator className="w-3 h-3 text-orange-500" /> Tempo Cronometrado (Estudo)
                            </span>
                            
                            {stats ? (
                              <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border text-xxs font-mono">
                                <div className="flex justify-between">
                                  <span className="text-slate-400 font-medium">Cap: Min</span>
                                  <span className="font-bold text-slate-800">{stats.min}</span>
                                </div>
                                <div className="flex justify-between border-y border-slate-200 py-0.5">
                                  <span className="text-teal-600 font-bold">MÉDIO</span>
                                  <span className="font-bold text-teal-700">{stats.avg}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400 font-medium">Máx</span>
                                  <span className="font-bold text-slate-800">{stats.max}</span>
                                </div>
                                <div className="text-center font-bold text-slate-400 text-xxxxs uppercase mt-1 pt-1.5 border-t">
                                  {stats.count} Medições Gravadas
                                </div>
                              </div>
                            ) : (
                              <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg text-xxxxs font-mono text-slate-400 leading-normal">
                                Sem cronometragens registradas para este processo. Vá na aba <strong className="text-orange-500">Cronômetro Real-Time</strong> para cronometrar ciclos produtivos de operadores.
                              </div>
                            )}
                          </div>

                          {hasWritePermission && (
                            <button
                              onClick={() => onDeleteProcess(proc.id)}
                              className="text-red-650 hover:text-red-700 flex items-center justify-end font-mono text-xxs font-bold gap-0.5 self-end mt-2 md:mt-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Excluir Rota
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE STOPWATCH CHRONOMETER ENGINE */}
          {activeTab === 'chronometer' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-semibold text-slate-800 text-base">Cronômetro Industrial e Tempos de Ciclo</h3>
                  <p className="text-xs text-slate-500">Mapeie o tempo exato com nossa ferramenta operacional de tempo de ciclo antes de registrar no ERP.</p>
                </div>
                <Timer className="w-6 h-6 text-orange-500 hover:scale-105 transition" />
              </div>

              {/* Selection Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500 font-bold">Processo sob Inspeção *</label>
                  <select
                    value={selectedChronoProcess}
                    disabled={isTimerRunning}
                    onChange={(e) => setSelectedChronoProcess(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-hidden focus:border-orange-500 text-slate-800 font-mono"
                  >
                    <option value="">Selecione o processo...</option>
                    {processes.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500 font-bold font-bold">Operador Fábrica</label>
                  <input
                    type="text"
                    disabled={isTimerRunning}
                    value={selectedChronoOperator}
                    onChange={(e) => setSelectedChronoOperator(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-hidden text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500 font-bold">Máquina Monitorada</label>
                  <select
                    value={selectedChronoMachine}
                    disabled={isTimerRunning}
                    onChange={(e) => setSelectedChronoMachine(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-hidden text-slate-800 font-mono"
                  >
                    <option value="">Nenhuma / Bancada Manual</option>
                    {machines.map(m => (
                      <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Real Stopwatch Visual UI Element */}
              <div className="bg-slate-900 rounded-2xl p-8 py-10 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden select-none">
                <div className="absolute right-0 top-0 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl"></div>
                
                <h1 className="text-5xl md:text-6xl font-mono font-extrabold text-white tracking-widest tabular-nums z-10">
                  {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:
                  {(elapsedSeconds % 60).toString().padStart(2, '0')}
                </h1>
                
                <p className="text-xxs font-mono text-slate-400 mt-2 z-10 flex items-center gap-1 animate-pulse">
                  {isTimerRunning ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                      CRONOMETRANDO OPERAÇÃO FABRIL ATIVA...
                    </>
                  ) : (
                    'PRONTO PARA MARCAÇÃO'
                  )}
                </p>

                {/* Clock face buttons */}
                <div className="flex gap-4 mt-8 z-10">
                  {!isTimerRunning ? (
                    <button
                      onClick={handleStartStopwatch}
                      disabled={!selectedChronoProcess}
                      className="px-6 py-2.5 text-xs font-mono font-bold bg-orange-500 hover:bg-orange-600 border border-transparent disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg flex items-center gap-2 shadow-md shadow-orange-500/15 cursor-pointer leading-none uppercase transition-all"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Iniciar Relógio
                    </button>
                  ) : (
                    <button
                      onClick={handleStopStopwatch}
                      className="px-6 py-2.5 text-xs font-mono font-bold bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Square className="w-4 h-4 fill-slate-900" />
                      Pausar Ciclo
                    </button>
                  )}

                  <button
                    onClick={handleSaveMeasurement}
                    disabled={elapsedSeconds === 0 || isTimerRunning}
                    className="px-6 py-2.5 text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Gravar no Banco ({elapsedSeconds}s)
                  </button>
                </div>
              </div>

              {/* Instructions and Guidelines helper */}
              <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl flex gap-3 text-xxs font-mono">
                <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5 animate-bounce" />
                <div className="text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800 uppercase tracking-wide">COMO FUNCIONA O ESTUDO DE TEMPOS INDUSTRIAL?</p>
                  <p>1. Selecione o processo de colchões desejado, informe o operador no trilho circular e a máquina.</p>
                  <p>2. Clique em <strong>Iniciar Relógio</strong> no momento em que a espuma/tecido entrar na estação.</p>
                  <p>3. Pressione <strong>Pausar Ciclo</strong> assim que o colchão for empacotado ou sair da máquina.</p>
                  <p>4. Clique em <strong>Gravar no Banco</strong> para exportar a cronometragem. As estatísticas de Tempo Mínimo, Médio e Máximo serão recalculadas.</p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CHRONOMETRIC HISTORY LIST */}
          {activeTab === 'history' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center text-xxs font-mono uppercase tracking-wider text-slate-400 font-bold">
                <span>Registro de Estudos de Tempo Históricos</span>
                <span>Duração Real</span>
              </div>

              <div className="divide-y divide-slate-100 font-mono text-xxs text-slate-600">
                {timeStudies.map((study) => {
                  const proc = processes.find(p => p.id === study.processId);
                  return (
                    <div key={study.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                      <div className="flex items-start gap-3">
                        <span className="text-xxxxs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                          {study.id}
                        </span>
                        
                        <div>
                          <p className="font-bold text-slate-800 text-xs font-display">
                            {proc?.name || 'Processo Indefinido'} ({study.processId})
                          </p>
                          
                          <div className="flex flex-wrap items-center mt-1 gap-3 text-slate-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" /> Op: <strong className="text-slate-700">{study.operatorName}</strong>
                            </span>
                            <span>|</span>
                            <span className="flex items-center gap-1">
                              <Cpu className="w-3.5 h-3.5" /> Máq: <strong className="text-slate-700">{study.machineId}</strong>
                            </span>
                            <span>|</span>
                            <span>Data: {study.date} ({study.startTime} às {study.endTime})</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-center">
                        <div className="text-right shrink-0">
                          <span className="text-xxxxs text-slate-400 block uppercase font-bold">Duração de ciclo</span>
                          <span className="text-sm font-bold text-slate-800">
                            {formatSeconds(study.durationSeconds)}
                          </span>
                        </div>

                        {hasWritePermission && (
                          <button
                            onClick={() => onDeleteTimeStudy(study.id)}
                            className="p-1 text-red-650 hover:bg-red-50 hover:text-red-700 rounded transition"
                            title="Remover medição"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {timeStudies.length === 0 && (
                  <div className="p-10 text-center text-slate-400">
                    Nenhuma medição cronometrada registrada até o momento nesta fábrica.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right column - Add Form Block for Process Mapping (takes 1 width) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs h-fit">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-display font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
              <Plus className="w-4 h-4 text-orange-500" />
              Mapear Rota Produtiva
            </h3>
            <p className="text-xxs text-slate-500 font-mono mt-0.5">Cadastrar processos industriais</p>
          </div>

          {!hasWritePermission ? (
            <div className="bg-amber-50 text-amber-700 border border-amber-200 p-4 rounded-xl text-xxs font-mono">
              Perfil sem credenciais de escrita para mútua modelagem de novos processos produtivos na fábrica.
            </div>
          ) : (
            <form onSubmit={handleProcessSubmit} className="space-y-4">
              <div>
                <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500 font-bold">CÓDIGO PROCESSO *</label>
                <input
                  type="text"
                  placeholder="Ex: PRC-MON-02"
                  value={procForm.id}
                  onChange={(e) => setProcForm({ ...procForm, id: e.target.value.toUpperCase() })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded font-mono uppercase focus:outline-hidden text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500 font-bold">NOME DO PROCESSO *</label>
                <input
                  type="text"
                  placeholder="Ex: Fechamento Virola"
                  value={procForm.name}
                  onChange={(e) => setProcForm({ ...procForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded focus:outline-hidden text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500 font-bold">MATERIAL DE ENTRADA (Múltiplos com vírgula)</label>
                <textarea
                  placeholder="Ex: Espuma Bloco, Tecido Jacquard"
                  rows={2}
                  value={procForm.inputsRaw}
                  onChange={(e) => setProcForm({ ...procForm, inputsRaw: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border"
                />
              </div>

              <div>
                <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500 font-bold">SAÍDAS (Outputs com vírgula)</label>
                <textarea
                  placeholder="Ex: Tampo Quilfado Costurado, Aparas"
                  rows={2}
                  value={procForm.outputsRaw}
                  onChange={(e) => setProcForm({ ...procForm, outputsRaw: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xxxxs font-mono uppercase tracking-wider mb-1 text-slate-400 font-bold font-bold">TEMPO PADRÃO (Min)</label>
                  <input
                    type="number"
                    min="1"
                    value={procForm.standardTimeMinutes}
                    onChange={(e) => setProcForm({ ...procForm, standardTimeMinutes: Number(e.target.value) })}
                    className="w-full text-xs p-2 bg-slate-50 border font-mono focus:outline-hidden text-slate-850"
                  />
                </div>
                <div>
                  <label className="block text-xxxxs font-mono uppercase tracking-wider mb-1 text-slate-400 font-bold font-bold font-bold">TEMPO OBSERVED (Min)</label>
                  <input
                    type="number"
                    min="1"
                    value={procForm.observedTimeMinutes}
                    onChange={(e) => setProcForm({ ...procForm, observedTimeMinutes: Number(e.target.value) })}
                    className="w-full text-xs p-2 bg-slate-50 border font-mono focus:outline-hidden text-slate-850"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xxxxs font-mono uppercase tracking-wider mb-1 text-slate-400 font-bold">OPERADORES</label>
                  <input
                    type="number"
                    min="1"
                    value={procForm.peopleInvolved}
                    onChange={(e) => setProcForm({ ...procForm, peopleInvolved: Number(e.target.value) })}
                    className="w-full text-xs p-2 bg-slate-50 border"
                  />
                </div>
                <div>
                  <label className="block text-xxxxs font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">CÓD. MÁQUINAS (CSV)</label>
                  <input
                    type="text"
                    placeholder="MAC-MON-01"
                    value={procForm.machineIdCsv}
                    onChange={(e) => setProcForm({ ...procForm, machineIdCsv: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs font-mono uppercase tracking-wider mb-1 text-slate-500 font-bold">NOTAS DO PROCESSO</label>
                <textarea
                  placeholder="Instruções de segurança ou setup"
                  rows={2}
                  value={procForm.observations}
                  onChange={(e) => setProcForm({ ...procForm, observations: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 transition text-white font-mono text-xs py-2.5 rounded-lg"
              >
                Mapear Processo Rota
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
