import { useState } from 'react';
import { LayoutDashboard, MessageSquare, Lightbulb, Sparkles, X, PanelLeft, PanelRight, ArrowLeft } from 'lucide-react';
import { CopilotChat } from './CopilotChat';
import { CopilotSidebar } from './CopilotSidebar';
import { CopilotInsightsPanel } from './CopilotInsightsPanel';
import { CopilotToolsPanel } from './CopilotToolsPanel';
import { useNavigate } from '@tanstack/react-router';

type PanelType = 'chat' | 'insights' | 'tools';

export function CopilotInterface() {
  const navigate = useNavigate();
  const [currentConversationId, setCurrentConversationId] = useState<string>();
  const [showSidebar, setShowSidebar] = useState(true);
  const [showInsights, setShowInsights] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [externalQuestion, setExternalQuestion] = useState<string>('');
  
  const handleNewConversation = () => {
    setCurrentConversationId(undefined);
  };
  
  const handleBackToDashboard = () => {
    navigate({ to: '/' });
  };

  const handleCapabilityClick = (question: string) => {
    setExternalQuestion(question);
    setShowTools(false);
  };
  
  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      {showSidebar && (
        <CopilotSidebar
          currentConversationId={currentConversationId}
          onConversationSelect={setCurrentConversationId}
          onNewConversation={handleNewConversation}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToDashboard}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Voltar para Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Toggle Sidebar"
            >
              <PanelLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-semibold text-white">Industrial OS Copilot</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInsights(!showInsights)}
              className={`p-2 rounded-lg transition-colors ${
                showInsights ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-400'
              }`}
              title="Insights"
            >
              <Lightbulb className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowTools(!showTools)}
              className={`p-2 rounded-lg transition-colors ${
                showTools ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-400'
              }`}
              title="Capacidades"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0">
            <CopilotChat
              conversationId={currentConversationId}
              onConversationChange={setCurrentConversationId}
              includeInsights={false}
              includeAlerts={false}
              externalQuestion={externalQuestion}
              onQuestionSent={() => setExternalQuestion('')}
            />
          </div>
          
          {/* Right Panels */}
          {(showInsights || showTools) && (
            <div className="w-80 border-l border-gray-800 flex flex-col shrink-0 overflow-hidden">
              {showInsights && !showTools && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-hidden">
                    <CopilotInsightsPanel onClose={() => setShowInsights(false)} />
                  </div>
                </div>
              )}
              {showTools && !showInsights && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-hidden">
                    <CopilotToolsPanel
                      onClose={() => setShowTools(false)}
                      onCapabilityClick={handleCapabilityClick}
                    />
                  </div>
                </div>
              )}
              {showInsights && showTools && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 border-b border-gray-800 overflow-hidden">
                    <CopilotInsightsPanel />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <CopilotToolsPanel
                      onCapabilityClick={handleCapabilityClick}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
