import { Database, CheckCircle } from 'lucide-react';

interface Source {
  name: string;
  type: 'production' | 'inventory' | 'quality' | 'financial' | 'supplier' | 'bom' | 'pcp' | 'database' | 'service';
}

interface SourcesPanelProps {
  sources: Source[];
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  const getSourceIcon = (type: Source['type']) => {
    switch (type) {
      case 'database':
        return <Database className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getSourceColor = (type: Source['type']) => {
    switch (type) {
      case 'production':
        return 'text-orange-300';
      case 'inventory':
        return 'text-indigo-300';
      case 'quality':
        return 'text-pink-300';
      case 'financial':
        return 'text-emerald-300';
      case 'supplier':
        return 'text-cyan-300';
      case 'bom':
        return 'text-blue-300';
      case 'pcp':
        return 'text-yellow-300';
      case 'database':
        return 'text-green-300';
      case 'service':
        return 'text-purple-300';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/50">
      <div className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
        <Database className="w-4 h-4" />
        Fontes consultadas
      </div>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <div
            key={index}
            className={`flex items-center gap-1.5 px-2 py-1 bg-gray-800 rounded text-xs ${getSourceColor(source.type)}`}
          >
            {getSourceIcon(source.type)}
            <span>{source.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
