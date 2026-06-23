import { ArrowRight, FileText, Plus, Navigation, Download } from 'lucide-react';

interface Action {
  label: string;
  type: 'navigate' | 'create' | 'update' | 'export';
  target?: string;
}

interface QuickActionsPanelProps {
  actions: Action[];
  onActionClick: (action: Action) => void;
}

export function QuickActionsPanel({ actions, onActionClick }: QuickActionsPanelProps) {
  if (!actions || actions.length === 0) {
    return null;
  }

  const getActionIcon = (type: Action['type']) => {
    switch (type) {
      case 'navigate':
        return <Navigation className="w-4 h-4" />;
      case 'create':
        return <Plus className="w-4 h-4" />;
      case 'update':
        return <FileText className="w-4 h-4" />;
      case 'export':
        return <Download className="w-4 h-4" />;
      default:
        return <ArrowRight className="w-4 h-4" />;
    }
  };

  const getActionColor = (type: Action['type']) => {
    switch (type) {
      case 'navigate':
        return 'bg-blue-600/20 text-blue-300 border-blue-600/30 hover:bg-blue-600/30';
      case 'create':
        return 'bg-green-600/20 text-green-300 border-green-600/30 hover:bg-green-600/30';
      case 'update':
        return 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30 hover:bg-yellow-600/30';
      case 'export':
        return 'bg-purple-600/20 text-purple-300 border-purple-600/30 hover:bg-purple-600/30';
      default:
        return 'bg-gray-600/20 text-gray-300 border-gray-600/30 hover:bg-gray-600/30';
    }
  };

  return (
    <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/50">
      <div className="text-sm font-medium text-gray-300 mb-2">Ações sugeridas</div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onActionClick(action)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${getActionColor(action.type)}`}
          >
            {getActionIcon(action.type)}
            <span>{action.label}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        ))}
      </div>
    </div>
  );
}
