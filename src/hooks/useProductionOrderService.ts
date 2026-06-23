import { useService } from "./useService";
import { productionOrderService, type ProductionOrder, type CreateProductionOrderInput, type UpdateProductionOrderInput } from "@/services";

export function useProductionOrderCreate() {
  return useService<ProductionOrder, CreateProductionOrderInput>({
    serviceFn: productionOrderService.create.bind(productionOrderService),
  });
}

export function useProductionOrderUpdate() {
  return useService<ProductionOrder, { id: string; input: UpdateProductionOrderInput }>({
    serviceFn: ({ id, input }) => productionOrderService.update(id, input),
  });
}

export function useProductionOrderDelete() {
  return useService<void, string>({
    serviceFn: productionOrderService.delete.bind(productionOrderService),
  });
}

export function useProductionOrderGet() {
  return useService<ProductionOrder, string>({
    serviceFn: productionOrderService.getById.bind(productionOrderService),
  });
}

export function useProductionOrderList() {
  return useService<ProductionOrder[], { 
    status?: ProductionOrder['status'];
    product_id?: string;
    priority?: ProductionOrder['priority'];
  }>({
    serviceFn: productionOrderService.list.bind(productionOrderService),
  });
}

export function useProductionOrderValidate() {
  return useService<{ valid: boolean; issues: string[] }, string>({
    serviceFn: productionOrderService.validate.bind(productionOrderService),
  });
}

export function useProductionOrderRelease() {
  return useService<ProductionOrder, string>({
    serviceFn: productionOrderService.release.bind(productionOrderService),
  });
}

export function useProductionOrderStart() {
  return useService<ProductionOrder, string>({
    serviceFn: productionOrderService.start.bind(productionOrderService),
  });
}

export function useProductionOrderComplete() {
  return useService<ProductionOrder, string>({
    serviceFn: productionOrderService.complete.bind(productionOrderService),
  });
}

export function useProductionOrderProgress() {
  return useService<{ completed: number; total: number; percentage: number }, string>({
    serviceFn: productionOrderService.getProgress.bind(productionOrderService),
  });
}
