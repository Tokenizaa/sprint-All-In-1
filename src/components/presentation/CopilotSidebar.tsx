import * as React from 'react';
import { useState, useEffect } from 'react';
import { Plus, Search, Archive, Pin, Trash2, MessageSquare, Clock } from 'lucide-react';
import { conversationManager } from '@/services';
import type { ConversationSummary } from '@/services';

interface CopilotSidebarProps {
  userId?: string;
  onConversationSelect: (conversationId: string) => void;
  currentConversationId?: string;
  onNewConversation: () => void;
}

export function CopilotSidebar({
  userId,
  onConversationSelect,
  currentConversationId,
  onNewConversation
}: CopilotSidebarProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  
  useEffect(() => {
    loadConversations();
  }, [userId, showArchived]);
  
  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const filter = {
        userId,
        isArchived: showArchived ? true : false,
        limit: 20
      };
      
      const data = await conversationManager.listConversations(filter);
      setConversations(data);
    } catch (error) {
      console.error('Erro ao carregar conversações:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadConversations();
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await conversationManager.searchConversations(searchQuery, userId);
      setConversations(data);
    } catch (error) {
      console.error('Erro ao buscar conversações:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Tem certeza que deseja deletar esta conversação?')) {
      return;
    }
    
    try {
      await conversationManager.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (currentConversationId === conversationId) {
        onNewConversation();
      }
    } catch (error) {
      console.error('Erro ao deletar conversação:', error);
    }
  };
  
  const handleArchive = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      if (showArchived) {
        await conversationManager.unarchiveConversation(conversationId);
      } else {
        await conversationManager.archiveConversation(conversationId);
      }
      
      loadConversations();
    } catch (error) {
      console.error('Erro ao arquivar conversação:', error);
    }
  };
  
  const handlePin = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        if (conversation.isPinned) {
          await conversationManager.unpinConversation(conversationId);
        } else {
          await conversationManager.pinConversation(conversationId);
        }
        
        loadConversations();
      }
    } catch (error) {
      console.error('Erro ao fixar conversação:', error);
    }
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours} h`;
    if (diffDays < 7) return `${diffDays} d`;
    
    return date.toLocaleDateString();
  };
  
  const pinnedConversations = conversations.filter(c => c.isPinned);
  const otherConversations = conversations.filter(c => !c.isPinned);
  
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={onNewConversation}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova conversa
        </button>
      </div>
      
      {/* Search */}
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar conversas..."
            className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Toggle Archived */}
      <div className="px-4 py-2 border-b border-gray-800">
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`text-sm flex items-center gap-2 ${
            showArchived ? 'text-blue-400' : 'text-gray-400'
          } hover:text-white transition-colors`}
        >
          <Archive className="w-4 h-4" />
          {showArchived ? 'Ver ativas' : 'Ver arquivadas'}
        </button>
      </div>
      
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Carregando...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {showArchived ? 'Nenhuma conversação arquivada' : 'Nenhuma conversação'}
          </div>
        ) : (
          <>
            {/* Pinned Conversations */}
            {pinnedConversations.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-gray-500 px-2 py-1">
                  Fixadas
                </div>
                {pinnedConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={currentConversationId === conversation.id}
                    onSelect={() => onConversationSelect(conversation.id)}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onPin={handlePin}
                    formatTime={formatTime}
                    showArchived={showArchived}
                  />
                ))}
              </div>
            )}
            
            {/* Other Conversations */}
            {otherConversations.length > 0 && (
              <div className="p-2">
                {pinnedConversations.length > 0 && (
                  <div className="text-xs text-gray-500 px-2 py-1">
                    {showArchived ? 'Arquivadas' : 'Conversas'}
                  </div>
                )}
                {otherConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={currentConversationId === conversation.id}
                    onSelect={() => onConversationSelect(conversation.id)}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onPin={handlePin}
                    formatTime={formatTime}
                    showArchived={showArchived}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface ConversationItemProps {
  key?: any;
  conversation: ConversationSummary;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onArchive: (id: string, e: React.MouseEvent) => void;
  onPin: (id: string, e: React.MouseEvent) => void;
  formatTime: (timestamp: string) => string;
  showArchived: boolean;
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onArchive,
  onPin,
  formatTime,
  showArchived
}: ConversationItemProps) {
  return (
    <div
      onClick={onSelect}
      className={`group px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-blue-600/20 text-blue-400'
          : 'hover:bg-gray-800 text-gray-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {conversation.title || 'Sem título'}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <MessageSquare className="w-3 h-3" />
            <span>{conversation.messageCount}</span>
            <Clock className="w-3 h-3" />
            <span>{formatTime(conversation.lastMessageTime)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {conversation.isPinned && (
            <button
              onClick={(e) => onPin(conversation.id, e)}
              className="p-1 hover:bg-gray-700 rounded"
              title="Desafixar"
            >
              <Pin className="w-3 h-3 text-blue-400 fill-current" />
            </button>
          )}
          {!conversation.isPinned && (
            <button
              onClick={(e) => onPin(conversation.id, e)}
              className="p-1 hover:bg-gray-700 rounded"
              title="Fixar"
            >
              <Pin className="w-3 h-3 text-gray-400" />
            </button>
          )}
          <button
            onClick={(e) => onArchive(conversation.id, e)}
            className="p-1 hover:bg-gray-700 rounded"
            title={showArchived ? 'Desarquivar' : 'Arquivar'}
          >
            <Archive className="w-3 h-3 text-gray-400" />
          </button>
          <button
            onClick={(e) => onDelete(conversation.id, e)}
            className="p-1 hover:bg-gray-700 rounded"
            title="Deletar"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
