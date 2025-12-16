export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  errorCode?: string; // If message is about a specific error code
}

export interface AIConfig {
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  message: string;
  success: boolean;
  error?: string;
}
