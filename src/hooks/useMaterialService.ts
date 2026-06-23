import { useService } from "./useService";
import { materialService, type Material, type CreateMaterialInput, type UpdateMaterialInput } from "@/services/MaterialService";

export function useMaterialCreate() {
  return useService<Material, CreateMaterialInput>({
    serviceFn: materialService.create.bind(materialService),
  });
}

export function useMaterialUpdate() {
  return useService<Material, { id: string; input: UpdateMaterialInput }>({
    serviceFn: ({ id, input }) => materialService.update(id, input),
  });
}

export function useMaterialDelete() {
  return useService<void, string>({
    serviceFn: materialService.delete.bind(materialService),
  });
}

export function useMaterialGetById() {
  return useService<Material, string>({
    serviceFn: materialService.getById.bind(materialService),
  });
}

export function useMaterialList() {
  return useService<Material[], { search?: string; categoria?: string; fornecedor?: string; lowStock?: boolean }>({
    serviceFn: materialService.list.bind(materialService),
  });
}

export function useMaterialGetLowStock() {
  return useService<Material[], void>({
    serviceFn: materialService.getLowStockMaterials.bind(materialService),
  });
}

export function useMaterialGetByCategory() {
  return useService<Material[], string>({
    serviceFn: materialService.getByCategory.bind(materialService),
  });
}

export function useMaterialGetBySupplier() {
  return useService<Material[], string>({
    serviceFn: materialService.getBySupplier.bind(materialService),
  });
}

export function useMaterialGetTotalStock() {
  return useService<number, void>({
    serviceFn: materialService.getTotalStock.bind(materialService),
  });
}

export function useMaterialUpdateStock() {
  return useService<Material, { id: string; quantity: number }>({
    serviceFn: ({ id, quantity }) => materialService.updateStock(id, quantity),
  });
}

export function useMaterialCheckAvailability() {
  return useService<{ available: boolean; currentStock: number }, { id: string; requiredQuantity: number }>({
    serviceFn: ({ id, requiredQuantity }) => materialService.checkAvailability(id, requiredQuantity),
  });
}
