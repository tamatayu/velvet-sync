export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'thought';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: ChatMessage;
  thought?: string;
}

export interface IChatService {
  sendUserMessage(sessionId: string, content: string): Promise<ChatResponse>;
  getHistory(sessionId: string): Promise<ChatMessage[]>;
  clearSession(sessionId: string): Promise<void>;
}