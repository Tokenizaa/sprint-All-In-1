// Exportar todos os serviços da camada de negócios

export { productService, ProductService } from './ProductService';
export { bomService, BOMService } from './BOMService';
export { inventoryService, InventoryService } from './InventoryService';
export { productionOrderService, ProductionOrderService } from './ProductionOrderService';
export { appointmentService, AppointmentService } from './AppointmentService';
export { movementService, MovementService } from './MovementService';
export { lotService, LotService } from './LotService';
export { businessRulesService, BusinessRulesService } from './BusinessRulesService';
export { productionWorkflowService, ProductionWorkflowService } from './ProductionWorkflowService';
export { qualityService, QualityService } from './QualityService';
export { downtimeService, DowntimeService } from './DowntimeService';
export { wipService, WIPService } from './WIPService';
export { pcpService, PCPService } from './PCPService';
export { mrpService, MRPService } from './MRPService';
export { integrationService, IntegrationService } from './IntegrationService';
export { costService, CostService } from './CostService';
export { financialService, FinancialService } from './FinancialService';
export { materialService, MaterialService } from './MaterialService';
export { supplierService, SupplierService } from './SupplierService';
export { aiService, AIService } from './AIService';

// Router components
export { copilotRouter, CopilotRouter } from './CopilotRouter';
export { sqlDirectExecutor, SQLDirectExecutor } from './SQLDirectExecutor';
export { serviceDirectExecutor, ServiceDirectExecutor } from './ServiceDirectExecutor';

// Tool Layer components
export { toolRegistry, ToolRegistry } from './ToolRegistry';
export type { ToolDefinition } from './ToolRegistry';

// Insight Engine components
export { kpiCalculator, KPICalculator } from './KPICalculator';
export { insightGenerator, InsightGenerator } from './InsightGenerator';
export { alertEngine, AlertEngine } from './AlertEngine';
export type {
  ProductionKPIs,
  InventoryKPIs,
  QualityKPIs,
  FinancialKPIs,
  SupplierKPIs,
  OverallKPIs,
  DateRange
} from './KPICalculator';
export type {
  Insight,
  InsightConfig
} from './InsightGenerator';
export type {
  Alert,
  AlertRule,
  AlertConfig
} from './AlertEngine';

// Copilot Orchestrator components
export { copilotOrchestrator, CopilotOrchestrator } from './CopilotOrchestrator';
export { conversationManager, ConversationManager } from './ConversationManager';
export { responseBuilder, ResponseBuilder } from './ResponseBuilder';
export type {
  OrchestratorRequest,
  OrchestratorResponse,
  ConversationState
} from './CopilotOrchestrator';
export type {
  Conversation,
  ConversationSummary,
  ConversationFilter
} from './ConversationManager';
export type {
  ResponseContext,
  ResponseOptions,
  BuiltResponse
} from './ResponseBuilder';

// Exportar tipos
export type {
  ServiceResult,
  ValidationError,
  BusinessRuleError,
  ServiceError,
  PaginatedResult,
  FilterOptions,
  AIContext,
  ChatMessage,
  ToolCall,
} from './types';

export { QueryType } from './types';

// NEW: Intelligent Response Architecture (FASE 4)
export { copilotIntentRouter, CopilotIntentRouter } from './CopilotIntentRouter';
export type {
  ResponseStrategy,
  Domain as IntentDomain,
  IntentClassification,
  Entity,
  IntentRouterResult
} from './CopilotIntentRouter';

export { industrialAnalyticsEngine, IndustrialAnalyticsEngine } from './IndustrialAnalyticsEngine';
export type {
  KPIRequest,
  KPIResult,
  AnalyticsRequest,
  AnalyticsResult,
  Domain as AnalyticsDomain
} from './IndustrialAnalyticsEngine';

export { insightGenerationEngine, InsightGenerationEngine } from './InsightGenerationEngine';
export type {
  Insight as GeneratedInsight,
  Severity
} from './InsightGenerationEngine';

export { responseEngine, ResponseEngine } from './ResponseEngine';
export type {
  ResponseRequest,
  ResponseResult
} from './ResponseEngine';

export { responseTemplateLibrary, ResponseTemplateLibrary } from './ResponseTemplateLibrary';
export type {
  ResponseTemplate
} from './ResponseTemplateLibrary';

export { responsePrioritizationEngine, ResponsePrioritizationEngine } from './ResponsePrioritizationEngine';
export type {
  PrioritizationRequest,
  PrioritizationResult
} from './ResponsePrioritizationEngine';

export { copilotOperationalMemory, CopilotOperationalMemory } from './CopilotOperationalMemory';
export type {
  CachedResponse,
  MemoryStatistics
} from './CopilotOperationalMemory';

// Analytics Services
export { ProductionAnalyticsService } from './analytics/ProductionAnalyticsService';
export { InventoryAnalyticsService } from './analytics/InventoryAnalyticsService';
export { MRPAnalyticsService } from './analytics/MRPAnalyticsService';
export { QualityAnalyticsService } from './analytics/QualityAnalyticsService';
export { SupplierAnalyticsService } from './analytics/SupplierAnalyticsService';
export { FinancialAnalyticsService } from './analytics/FinancialAnalyticsService';

// Type exports for hooks compatibility
export type { ValidationResult } from './BusinessRulesService';
export type { InventoryItem, CreateInventoryItemInput, UpdateInventoryItemInput } from './InventoryService';
export type { Product, CreateProductInput, UpdateProductInput } from './ProductService';
export type { ProductionOrder, CreateProductionOrderInput, UpdateProductionOrderInput } from './ProductionOrderService';
export type { CreateProductionWorkflowInput } from './ProductionWorkflowService';
