import { useService } from "./useService";
import { bomService, type BOMItem, type CreateBOMItemInput, type UpdateBOMItemInput } from "@/services/BOMService";

export function useBOMAddItem() {
  return useService<BOMItem, CreateBOMItemInput>({
    serviceFn: bomService.addItem.bind(bomService),
  });
}

export function useBOMUpdateItem() {
  return useService<BOMItem, { id: string; input: UpdateBOMItemInput }>({
    serviceFn: ({ id, input }) => bomService.updateItem(id, input),
  });
}

export function useBOMRemoveItem() {
  return useService<void, string>({
    serviceFn: bomService.removeItem.bind(bomService),
  });
}

export function useBOMGetByProduct() {
  return useService<BOMItem[], string>({
    serviceFn: bomService.getByProduct.bind(bomService),
  });
}

export function useBOMDuplicate() {
  return useService<void, { fromProductId: string; toProductId: string }>({
    serviceFn: ({ fromProductId, toProductId }) => bomService.duplicateBOM(fromProductId, toProductId),
  });
}

export function useBOMIsComplete() {
  return useService<{ complete: boolean; missingItems: string[] }, string>({
    serviceFn: bomService.isComplete.bind(bomService),
  });
}

export function useBOMCalculateTotalCost() {
  return useService<number, string>({
    serviceFn: bomService.calculateTotalCost.bind(bomService),
  });
}
