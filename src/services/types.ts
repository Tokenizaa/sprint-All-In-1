// Tipos comuns para a camada de serviços

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface BusinessRuleError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export type ServiceError = ValidationError | BusinessRuleError;

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FilterOptions {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AIContext {
  timestamp?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  companyName?: string;
  currentModule?: string;
  relevantData?: Record<string, any>;
  kpis?: any;
  insights?: any[];
  alerts?: any[];
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export enum QueryType {
  SQL_DIRECT = 'sql_direct',
  SERVICE_DIRECT = 'service_direct',
  AI_REQUIRED = 'ai_required'
}
