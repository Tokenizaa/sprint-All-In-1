import { useState } from 'react';
import { aiService } from '@/services';

export function AIChatTest() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setStreamingContent('');

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await aiService.sendMessageWithStreaming(
        [{ role: 'user', content: input }],
        undefined,
        (chunk) => {
          setStreamingContent(prev => prev + chunk.content);
        },
        {
          factoryName: 'Fábrica Teste',
          currentModule: 'produção',
        }
      );

      if (result.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: result.data?.content || 'Sem resposta' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Erro: ${result.error}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}` }]);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      setInput('');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Teste de IA - Ollama TinyLlama</h1>
      
      <div className="border rounded-lg p-4 mb-4 h-96 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-1 rounded ${
              msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
            }`}>
              <strong>{msg.role === 'user' ? 'Você' : 'IA'}:</strong> {msg.content}
            </span>
          </div>
        ))}
        {streamingContent && (
          <div className="text-left mb-2">
            <span className="inline-block px-3 py-1 rounded bg-gray-200 text-gray-800">
              <strong>IA:</strong> {streamingContent}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Digite sua mensagem..."
          className="flex-1 border rounded px-3 py-2"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Configuração:</p>
        <ul className="list-disc list-inside">
          <li>Base URL: {process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api'}</li>
          <li>Model: {process.env.OLLAMA_MODEL || 'tinyllama'}</li>
        </ul>
      </div>
    </div>
  );
}
