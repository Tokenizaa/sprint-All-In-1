import { useService } from "./useService";
import { businessRulesService, type ValidationResult } from "@/services";

export function useValidateProductionOrder() {
  return useService<ValidationResult, string>({
    serviceFn: businessRulesService.validateProductionOrder.bind(businessRulesService),
  });
}

export function useCheckMaterialAvailability() {
  return useService<{ canProduce: boolean; reasons: string[] }, { productId: string; quantity: number }>({
    serviceFn: ({ productId, quantity }) => businessRulesService.checkMaterialAvailability(productId, quantity),
  });
}

export function useCheckCapacity() {
  return useService<{ hasCapacity: boolean; reasons: string[] }, { productId: string; quantity: number; startDate?: string; dueDate?: string }>({
    serviceFn: ({ productId, quantity, startDate, dueDate }) => businessRulesService.checkCapacity(productId, quantity, startDate, dueDate),
  });
}

export function useCalculateMaterialConsumption() {
  return useService<Array<{ materialId?: string; componentId?: string; quantity: number }>, { productId: string; quantity: number }>({
    serviceFn: ({ productId, quantity }) => businessRulesService.calculateMaterialConsumption(productId, quantity),
  });
}

export function useUpdateStockAfterConsumption() {
  return useService<void, { productId: string; quantity: number; referenceId: string }>({
    serviceFn: ({ productId, quantity, referenceId }) => businessRulesService.updateStockAfterConsumption(productId, quantity, referenceId),
  });
}

export function useCalculateProductionEfficiency() {
  return useService<{ efficiency: number; targetEfficiency: number; variance: number }, string>({
    serviceFn: businessRulesService.calculateProductionEfficiency.bind(businessRulesService),
  });
}

export function useCanDeleteProduct() {
  return useService<{ canDelete: boolean; reasons: string[] }, string>({
    serviceFn: businessRulesService.canDeleteProduct.bind(businessRulesService),
  });
}

export function useCanDeleteMaterial() {
  return useService<{ canDelete: boolean; reasons: string[] }, string>({
    serviceFn: businessRulesService.canDeleteMaterial.bind(businessRulesService),
  });
}

export function useLowStockAlerts() {
  return useService<Array<{ inventoryId: string; itemName: string; current: number; min: number }>, void>({
    serviceFn: businessRulesService.generateLowStockAlerts.bind(businessRulesService),
  });
}

export function useExpiryAlerts() {
  return useService<Array<{ lotId: string; lotNumber: string; expiryDate: string; productName: string }>, number>({
    serviceFn: businessRulesService.generateExpiryAlerts.bind(businessRulesService),
  });
}
