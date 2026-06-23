const OLLAMA_BASE_URL = (import.meta as any).env?.VITE_OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_DEFAULT_MODEL = (import.meta as any).env?.VITE_OLLAMA_DEFAULT_MODEL || "tinyllama:latest";

export interface OllamaMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OllamaResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export async function chatWithOllama(
  messages: OllamaMessage[],
  model: string = OLLAMA_DEFAULT_MODEL
): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data: OllamaResponse = await response.json();
    return data.message.content;
  } catch (error) {
    console.error("Error calling Ollama:", error);
    throw error;
  }
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export { OLLAMA_BASE_URL, OLLAMA_DEFAULT_MODEL };
