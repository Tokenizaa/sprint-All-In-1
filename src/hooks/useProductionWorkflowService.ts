import { useService } from "./useService";
import { productionWorkflowService, type CreateProductionWorkflowInput } from "@/services";

export function useProductionWorkflow() {
  return useService<any, CreateProductionWorkflowInput>({
    serviceFn: productionWorkflowService.executeProductionWorkflow.bind(productionWorkflowService),
  });
}

export function useStartProduction() {
  return useService<any, { orderId: string; equipmentId?: string; employeeId?: string }>({
    serviceFn: ({ orderId, equipmentId, employeeId }) => productionWorkflowService.startProduction(orderId, equipmentId, employeeId),
  });
}

export function useCompleteProduction() {
  return useService<any, { orderId: string; finalQuantity: number; qualityChecks?: any }>({
    serviceFn: ({ orderId, finalQuantity, qualityChecks }) => productionWorkflowService.completeProduction(orderId, finalQuantity, qualityChecks),
  });
}

export function useWorkflowStatus() {
  return useService<any, string>({
    serviceFn: productionWorkflowService.getWorkflowStatus.bind(productionWorkflowService),
  });
}

export function useEstimateProductionTime() {
  return useService<{ totalMinutes: number; totalHours: number }, { productId: string; quantity: number }>({
    serviceFn: ({ productId, quantity }) => productionWorkflowService.estimateProductionTime(productId, quantity),
  });
}
