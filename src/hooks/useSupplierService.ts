import { useService } from "./useService";
import { supplierService, type Supplier, type CreateSupplierInput, type UpdateSupplierInput } from "@/services/SupplierService";

export function useSupplierCreate() {
  return useService<Supplier, CreateSupplierInput>({
    serviceFn: supplierService.create.bind(supplierService),
  });
}

export function useSupplierUpdate() {
  return useService<Supplier, { id: string; input: UpdateSupplierInput }>({
    serviceFn: ({ id, input }) => supplierService.update(id, input),
  });
}

export function useSupplierDelete() {
  return useService<void, string>({
    serviceFn: supplierService.delete.bind(supplierService),
  });
}

export function useSupplierGetById() {
  return useService<Supplier, string>({
    serviceFn: supplierService.getById.bind(supplierService),
  });
}

export function useSupplierList() {
  return useService<Supplier[], { search?: string; categoria?: string; topRated?: boolean }>({
    serviceFn: supplierService.list.bind(supplierService),
  });
}

export function useSupplierGetByCategory() {
  return useService<Supplier[], string>({
    serviceFn: supplierService.getByCategory.bind(supplierService),
  });
}

export function useSupplierGetTopRated() {
  return useService<Supplier[], void>({
    serviceFn: supplierService.getTopRatedSuppliers.bind(supplierService),
  });
}

export function useSupplierGetAverageLeadTime() {
  return useService<Array<{ categoria: string; averageLeadTime: number }>, void>({
    serviceFn: supplierService.getAverageLeadTimeByCategory.bind(supplierService),
  });
}

export function useSupplierUpdateRating() {
  return useService<Supplier, { id: string; rating: number }>({
    serviceFn: ({ id, rating }) => supplierService.updateRating(id, rating),
  });
}

export function useSupplierGetCritical() {
  return useService<Array<{ supplier: Supplier; issue: string; severity: 'high' | 'medium' | 'low' }>, void>({
    serviceFn: supplierService.getCriticalSuppliers.bind(supplierService),
  });
}

export function useSupplierGetByMaterial() {
  return useService<Supplier[], string>({
    serviceFn: supplierService.getByMaterial.bind(supplierService),
  });
}
