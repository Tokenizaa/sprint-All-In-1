import { useService } from "./useService";
import { inventoryService, type InventoryItem, type CreateInventoryItemInput, type UpdateInventoryItemInput } from "@/services";

export function useInventoryCreate() {
  return useService<InventoryItem, CreateInventoryItemInput>({
    serviceFn: inventoryService.createItem.bind(inventoryService),
  });
}

export function useInventoryUpdate() {
  return useService<InventoryItem, { id: string; input: UpdateInventoryItemInput }>({
    serviceFn: ({ id, input }) => inventoryService.updateItem(id, input),
  });
}

export function useInventoryDelete() {
  return useService<void, string>({
    serviceFn: inventoryService.deleteItem.bind(inventoryService),
  });
}

export function useInventoryGet() {
  return useService<InventoryItem, string>({
    serviceFn: inventoryService.getById.bind(inventoryService),
  });
}

export function useInventoryList() {
  return useService<InventoryItem[], { 
    material_id?: string; 
    component_id?: string; 
    product_id?: string;
    sector_id?: string;
    lowStock?: boolean;
  }>({
    serviceFn: inventoryService.list.bind(inventoryService),
  });
}

export function useInventoryRegisterMovement() {
  return useService<any, {
    inventory_id: string;
    type: 'entry' | 'exit' | 'consumption' | 'production' | 'transfer';
    quantity: number;
    reason?: string;
    reference_id?: string;
  }>({
    serviceFn: inventoryService.registerMovement.bind(inventoryService),
  });
}

export function useInventoryMovementHistory() {
  return useService<any, string>({
    serviceFn: inventoryService.getMovementHistory.bind(inventoryService),
  });
}

export function useInventoryLowStock() {
  return useService<InventoryItem[], void>({
    serviceFn: inventoryService.listLowStock.bind(inventoryService),
  });
}

export function useInventoryReserveStock() {
  return useService<void, { inventoryId: string; quantity: number; referenceId: string }>({
    serviceFn: ({ inventoryId, quantity, referenceId }) => inventoryService.reserveStock(inventoryId, quantity, referenceId),
  });
}

export function useInventoryReleaseStock() {
  return useService<void, { inventoryId: string; quantity: number; referenceId: string }>({
    serviceFn: ({ inventoryId, quantity, referenceId }) => inventoryService.releaseStock(inventoryId, quantity, referenceId),
  });
}
