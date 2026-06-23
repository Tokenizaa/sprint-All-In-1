import { useService } from "./useService";
import { mrpService, type MaterialRequirement, type PurchaseOrder, type CreatePurchaseOrderInput, type AddPurchaseOrderItemInput } from "@/services/MRPService";

export function useMRPCalculateRequirements() {
  return useService<MaterialRequirement[], string[]>({
    serviceFn: mrpService.calculateMaterialRequirements.bind(mrpService),
  });
}

export function useMRPGeneratePurchaseOrders() {
  return useService<PurchaseOrder[], MaterialRequirement[]>({
    serviceFn: mrpService.generatePurchaseOrders.bind(mrpService),
  });
}

export function useMRPCreatePurchaseOrder() {
  return useService<PurchaseOrder, CreatePurchaseOrderInput>({
    serviceFn: mrpService.createPurchaseOrder.bind(mrpService),
  });
}

export function useMRPAddPurchaseOrderItem() {
  return useService<any, AddPurchaseOrderItemInput>({
    serviceFn: mrpService.addPurchaseOrderItem.bind(mrpService),
  });
}

export function useMRPListPurchaseOrders() {
  return useService<PurchaseOrder[], { status?: PurchaseOrder['status']; supplierId?: string }>({
    serviceFn: mrpService.listPurchaseOrders.bind(mrpService),
  });
}

export function useMRPUpdatePurchaseOrderStatus() {
  return useService<PurchaseOrder, { id: string; status: PurchaseOrder['status'] }>({
    serviceFn: ({ id, status }) => mrpService.updatePurchaseOrderStatus(id, status),
  });
}

export function useMRPOptimizeCosts() {
  return useService<{ savings: number; recommendations: string[] }, MaterialRequirement[]>({
    serviceFn: mrpService.optimizeCosts.bind(mrpService),
  });
}

export function useMRPManageLeadTimes() {
  return useService<void, { materialId: string; newLeadTime: number }>({
    serviceFn: ({ materialId, newLeadTime }) => mrpService.manageLeadTimes(materialId, newLeadTime),
  });
}

export function useMRPCalculateAverageLeadTime() {
  return useService<{ averageLeadTime: number; onTimeDeliveryRate: number }, string>({
    serviceFn: mrpService.calculateAverageLeadTime.bind(mrpService),
  });
}
