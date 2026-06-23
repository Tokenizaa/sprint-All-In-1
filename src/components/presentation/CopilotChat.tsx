import * as React from "react";
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, CheckCircle, XCircle, Zap } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { industrialCopilotCore } from '@/services/IndustrialCopilotCore';
import { responsePrioritizationEngine } from '@/services/ResponsePrioritizationEngine';
import type { ChatMessage } from '@/services';
import type { CopilotResponse } from '@/services/IndustrialCopilotCore';

interface ChatMessageWithMeta extends ChatMessage {
  timestamp?: string;
  metadata?: any;
}
import { CopilotWelcomeScreen } from './CopilotWelcomeScreen';
import { SourcesPanel } from './SourcesPanel';
import { QuickActionsPanel } from './QuickActionsPanel';

interface CopilotChatProps {
  conversationId?: string;
  userId?: string;
  onConversationChange?: (conversationId: string) => void;
  includeInsights?: boolean;
  includeAlerts?: boolean;
  externalQuestion?: string;
  onQuestionSent?: () => void;
}

export function CopilotChat({
  conversationId,
  userId,
  onConversationChange,
  includeInsights = false,
  includeAlerts = false,
  externalQuestion,
  onQuestionSent
}: CopilotChatProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageWithMeta[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const [lastResponse, setLastResponse] = useState<CopilotResponse | null>(null);
  const [responseStrategy, setResponseStrategy] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number>(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle external question from capabilities
  useEffect(() => {
    if (externalQuestion) {
      setInput(externalQuestion);
      inputRef.current?.focus();
    }
  }, [externalQuestion]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingResponse]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    let activeId = currentConversationId;
    if (!activeId || activeId.trim() === '') {
      activeId = crypto.randomUUID();
      setCurrentConversationId(activeId);
      if (onConversationChange) {
        onConversationChange(activeId);
      }
    }

    const userMessage: ChatMessageWithMeta = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    setIsLoading(true);
    setStreamingResponse('');
    setResponseStrategy(null);
    setResponseTime(0);
    
    try {
      // Try new prioritization engine first (non-AI responses)
      const prioritizedResult = await responsePrioritizationEngine.execute({
        query: messageToSend,
        tenantId: userId,
      });

      setResponseStrategy(prioritizedResult.strategy);
      setResponseTime(prioritizedResult.executionTime);

      const assistantMessage: ChatMessageWithMeta = {
        role: 'assistant',
        content: prioritizedResult.response,
        timestamp: new Date().toISOString(),
        metadata: {
          strategy: prioritizedResult.strategy,
          sources: prioritizedResult.sources,
          confidence: prioritizedResult.confidence,
          executionTime: prioritizedResult.executionTime,
          usedAI: prioritizedResult.usedAI,
        },
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Still save to conversation via core for persistence
      await industrialCopilotCore.saveMessage(
        activeId,
        userMessage
      );
      await industrialCopilotCore.saveMessage(
        activeId,
        assistantMessage
      );
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      
      // Fallback to original core if prioritization fails
      try {
        const response = await industrialCopilotCore.processMessage(messageToSend, activeId);
        
        setLastResponse(response);
        
        const assistantMessage: ChatMessageWithMeta = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } catch (coreError) {
        console.error('Erro no fallback:', coreError);
        
        const errorMessage: ChatMessageWithMeta = {
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleStreamingSend = async () => {
    if (!input.trim() || isLoading) return;
    
    let activeId = currentConversationId;
    if (!activeId || activeId.trim() === '') {
      activeId = crypto.randomUUID();
      setCurrentConversationId(activeId);
      if (onConversationChange) {
        onConversationChange(activeId);
      }
    }

    const userMessage: ChatMessageWithMeta = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    setIsLoading(true);
    setStreamingResponse('');
    
    if (onQuestionSent) {
      onQuestionSent();
    }
    
    try {
      await industrialCopilotCore.processMessageWithStreaming(
        messageToSend,
        (chunk) => {
          setStreamingResponse(prev => prev + chunk);
        },
        activeId
      );
      
      const assistantMessage: ChatMessageWithMeta = {
        role: 'assistant',
        content: streamingResponse,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setStreamingResponse('');
    } catch (error) {
      console.error('Erro ao processar mensagem com streaming:', error);
      
      const errorMessage: ChatMessageWithMeta = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setStreamingResponse('');
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearConversation = () => {
    if (currentConversationId) {
      industrialCopilotCore.clearConversation(currentConversationId);
    }
    setMessages([]);
    setCurrentConversationId(undefined);
    setLastResponse(null);
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-900 dark:bg-gray-950">
      {/* Header - Minimal */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-medium text-white">Industrial Copilot</h2>
          <span className="px-1.5 py-0.5 bg-green-600/20 text-green-400 text-[10px] rounded-full">Online</span>
        </div>
        <button
          onClick={clearConversation}
          className="text-[10px] text-gray-400 hover:text-white transition-colors"
        >
          Nova conversa
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {messages.length === 0 ? (
          <CopilotWelcomeScreen onSuggestionClick={(suggestion) => setInput(suggestion)} />
        ) : (
          <div className="p-4 space-y-4">
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {(message.timestamp || message.metadata) && (
                <div
                  className={`text-xs mt-2 flex items-center gap-2 ${
                    message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp && (
                    <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                  )}
                  {message.metadata?.strategy && (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {message.metadata.strategy}
                      {!message.metadata.usedAI && (
                        <span className="text-green-400">✓</span>
                      )}
                    </span>
                  )}
                  {message.metadata?.executionTime && (
                    <span>({message.metadata.executionTime}ms)</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {streamingResponse && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-3 bg-gray-800 text-gray-100">
              <div className="whitespace-pre-wrap">{streamingResponse}</div>
              <Loader2 className="w-4 h-4 animate-spin text-gray-500 mt-2" />
            </div>
          </div>
        )}
        
        {isLoading && !streamingResponse && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        </div>
        )}
      </div>
      
      {/* Sources Panel */}
      {lastResponse && lastResponse.metadata?.sources && (
        <SourcesPanel sources={lastResponse.metadata.sources} />
      )}
      
      {/* Quick Actions Panel */}
      {lastResponse && lastResponse.metadata?.actions && lastResponse.metadata.actions.length > 0 && (
        <QuickActionsPanel 
          actions={lastResponse.metadata.actions}
          onActionClick={(action) => {
            if (action.type === 'navigate' && action.target) {
              navigate({ to: action.target });
            } else if (action.type === 'create') {
              // Para ações de criação, envia um prompt ao chat
              const createPrompt = `Quero ${action.label.toLowerCase()}. Por favor, me oriente sobre como criar um novo registro.`;
              setInput(createPrompt);
              inputRef.current?.focus();
            } else if (action.type === 'export') {
              // Para exportação, envia um prompt ao chat
              const exportPrompt = `Quero ${action.label.toLowerCase()}. Por favor, gere os dados para exportação.`;
              setInput(exportPrompt);
              inputRef.current?.focus();
            } else if (action.type === 'update') {
              // Para atualização, envia um prompt ao chat
              const updatePrompt = `Quero ${action.label.toLowerCase()}. Por favor, me oriente sobre como atualizar.`;
              setInput(updatePrompt);
              inputRef.current?.focus();
            }
          }}
        />
      )}
      
      {/* Input */}
      <div className="p-3 border-t border-gray-800 shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
