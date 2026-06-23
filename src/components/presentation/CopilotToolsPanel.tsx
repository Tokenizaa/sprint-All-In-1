import * as React from 'react';
import { useState, useEffect } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Search, Sparkles } from 'lucide-react';
import { industrialCapabilities, getCapabilitiesByDomain, type IndustrialCapability } from '@/lib/industrialCapabilities';
import { useCopilotContext } from '@/context/CopilotContextProvider';

interface CopilotToolsPanelProps {
  onClose?: () => void;
  onCapabilityClick?: (question: string) => void;
}

export function CopilotToolsPanel({ onClose, onCapabilityClick }: CopilotToolsPanelProps) {
  const { context } = useCopilotContext();
  const [allCapabilities, setAllCapabilities] = useState<IndustrialCapability[]>([]);
  const [filteredCapabilities, setFilteredCapabilities] = useState<IndustrialCapability[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [expandedCapabilities, setExpandedCapabilities] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    setAllCapabilities(industrialCapabilities);
    setFilteredCapabilities(industrialCapabilities);
  }, []);
  
  useEffect(() => {
    let filtered = allCapabilities;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(cap =>
        cap.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cap.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by domain
    if (selectedDomain !== 'all') {
      filtered = filtered.filter(cap => cap.domain === selectedDomain);
    }
    
    setFilteredCapabilities(filtered);
  }, [searchQuery, selectedDomain, allCapabilities]);
  
  const toggleCapability = (capabilityId: string) => {
    setExpandedCapabilities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(capabilityId)) {
        newSet.delete(capabilityId);
      } else {
        newSet.add(capabilityId);
      }
      return newSet;
    });
  };
  
  const domains = Array.from(new Set(allCapabilities.map(c => c.domain))) as string[];
  
  const capabilitiesByDomain = domains.reduce((acc, domain) => {
    acc[domain] = filteredCapabilities.filter(c => c.domain === domain);
    return acc;
  }, {} as Record<string, IndustrialCapability[]>);
  
  const handleCapabilityClick = (capability: IndustrialCapability) => {
    // Usar o primeiro exemplo como pergunta ao copiloto
    if (capability.examples.length > 0) {
      const example = capability.examples[0];
      if (onCapabilityClick) {
        onCapabilityClick(example);
      }
    }
  };
  
  return (
    <div className="bg-gray-900 border-l border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">O que posso fazer</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Search */}
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar capacidades..."
            className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Domain Filter */}
      <div className="px-4 py-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-gray-500" />
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-gray-800 text-white rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as capacidades</option>
            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {getDomainLabel(domain)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Capabilities List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredCapabilities.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            Nenhuma capacidade encontrada
          </div>
        ) : (
          <div className="space-y-4">
            {domains.map((domain) => {
              const domainCapabilities = capabilitiesByDomain[domain];
              if (!domainCapabilities || domainCapabilities.length === 0) return null;
              
              return (
                <div key={domain}>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">
                    {getDomainLabel(domain)}
                  </h3>
                  <div className="space-y-2">
                    {domainCapabilities.map((capability) => (
                      <CapabilityCard
                        key={capability.id}
                        capability={capability}
                        isExpanded={expandedCapabilities.has(capability.id)}
                        onToggle={() => toggleCapability(capability.id)}
                        onClick={() => handleCapabilityClick(capability)}
                        onExampleClick={onCapabilityClick}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-800">
        <div className="text-xs text-gray-500">
          Total: {filteredCapabilities.length} capacidades
        </div>
      </div>
    </div>
  );
}

function getDomainLabel(domain: string): string {
  const labels: Record<string, string> = {
    production: 'Produção',
    inventory: 'Estoque',
    quality: 'Qualidade',
    financial: 'Financeiro',
    supplier: 'Compras',
    pcp: 'PCP',
    mrp: 'MRP',
  };
  return labels[domain] || domain;
}

interface CapabilityCardProps {
  key?: any;
  capability: IndustrialCapability;
  isExpanded: boolean;
  onToggle: () => void;
  onClick: () => void;
  onExampleClick?: (example: string) => void;
}

function CapabilityCard({ capability, isExpanded, onToggle, onClick, onExampleClick }: CapabilityCardProps) {
  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      production: 'bg-orange-900/50 border-orange-700 text-orange-300',
      inventory: 'bg-indigo-900/50 border-indigo-700 text-indigo-300',
      quality: 'bg-pink-900/50 border-pink-700 text-pink-300',
      financial: 'bg-emerald-900/50 border-emerald-700 text-emerald-300',
      supplier: 'bg-cyan-900/50 border-cyan-700 text-cyan-300',
      pcp: 'bg-yellow-900/50 border-yellow-700 text-yellow-300',
      mrp: 'bg-red-900/50 border-red-700 text-red-300',
    };
    
    return colors[domain] || 'bg-gray-800 border-gray-700 text-gray-300';
  };
  
  return (
    <div
      className={`rounded-lg border p-3 ${getDomainColor(capability.domain)} cursor-pointer hover:opacity-80 transition-opacity`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {capability.icon && (
              <span className="text-lg">{capability.icon}</span>
            )}
            <div className="font-medium text-sm">{capability.name}</div>
          </div>
          <div className="text-xs mt-1 opacity-80">{capability.description}</div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="p-1 hover:bg-black/20 rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-black/20">
          <div className="text-xs">
            <div className="font-medium mb-2">Exemplos de perguntas:</div>
            <ul className="space-y-1">
              {capability.examples.map((example, index) => (
                <li
                  key={index}
                  className="opacity-80 hover:opacity-100 cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onExampleClick) {
                      onExampleClick(example);
                    }
                  }}
                >
                  • {example}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
