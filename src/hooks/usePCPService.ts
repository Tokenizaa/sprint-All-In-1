import { useService } from "./useService";
import { pcpService, type ProductionPlan, type ProductionPlanItem, type CreateProductionPlanInput, type AddPlanItemInput } from "@/services/PCPService";

export function usePCPCreatePlan() {
  return useService<ProductionPlan, CreateProductionPlanInput>({
    serviceFn: pcpService.createPlan.bind(pcpService),
  });
}

export function usePCPUpdatePlan() {
  return useService<ProductionPlan, { id: string; input: Partial<CreateProductionPlanInput> & { status?: ProductionPlan['status'] } }>({
    serviceFn: ({ id, input }) => pcpService.updatePlan(id, input),
  });
}

export function usePCPDeletePlan() {
  return useService<void, string>({
    serviceFn: pcpService.deletePlan.bind(pcpService),
  });
}

export function usePCPGetPlan() {
  return useService<ProductionPlan, string>({
    serviceFn: pcpService.getPlanById.bind(pcpService),
  });
}

export function usePCPListPlans() {
  return useService<ProductionPlan[], { status?: ProductionPlan['status']; start_date?: string; end_date?: string }>({
    serviceFn: pcpService.listPlans.bind(pcpService),
  });
}

export function usePCPAddPlanItem() {
  return useService<ProductionPlanItem, AddPlanItemInput>({
    serviceFn: pcpService.addPlanItem.bind(pcpService),
  });
}

export function usePCPUpdatePlanItem() {
  return useService<ProductionPlanItem, { id: string; input: Partial<AddPlanItemInput> & { status?: ProductionPlanItem['status'] } }>({
    serviceFn: ({ id, input }) => pcpService.updatePlanItem(id, input),
  });
}

export function usePCPDeletePlanItem() {
  return useService<void, string>({
    serviceFn: pcpService.deletePlanItem.bind(pcpService),
  });
}

export function usePCPListPlanItems() {
  return useService<ProductionPlanItem[], string>({
    serviceFn: pcpService.listPlanItems.bind(pcpService),
  });
}

export function usePCPApprovePlan() {
  return useService<ProductionPlan, string>({
    serviceFn: pcpService.approvePlan.bind(pcpService),
  });
}

export function usePCPActivatePlan() {
  return useService<ProductionPlan, string>({
    serviceFn: pcpService.activatePlan.bind(pcpService),
  });
}

export function usePCPCompletePlan() {
  return useService<ProductionPlan, string>({
    serviceFn: pcpService.completePlan.bind(pcpService),
  });
}

export function usePCPCancelPlan() {
  return useService<ProductionPlan, string>({
    serviceFn: pcpService.cancelPlan.bind(pcpService),
  });
}

export function usePCPGenerateAutoPlan() {
  return useService<ProductionPlan, { startDate: string; endDate: string; options?: { includeBacklog?: boolean } }>({
    serviceFn: ({ startDate, endDate, options }) => pcpService.generateAutoPlan(startDate, endDate, options),
  });
}

export function usePCPCalculateCapacity() {
  return useService<{ totalCapacity: number; usedCapacity: number; availableCapacity: number; utilizationRate: number }, { startDate: string; endDate: string }>({
    serviceFn: ({ startDate, endDate }) => pcpService.calculateCapacity(startDate, endDate),
  });
}

export function usePCPIdentifyBottlenecks() {
  return useService<Array<{ itemId: string; itemName: string; bottleneckType: string; severity: 'low' | 'medium' | 'high' }>, string>({
    serviceFn: pcpService.identifyBottlenecks.bind(pcpService),
  });
}

export function usePCPSimulateWhatIf() {
  return useService<{ impact: string; recommendations: string[] }, { planId: string; changes: Array<{ itemId: string; newStartDate?: string; newEndDate?: string; newPriority?: string }> }>({
    serviceFn: ({ planId, changes }) => pcpService.simulateWhatIf(planId, changes),
  });
}
