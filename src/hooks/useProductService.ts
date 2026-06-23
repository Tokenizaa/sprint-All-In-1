import { useService } from "./useService";
import { productService, type Product, type CreateProductInput, type UpdateProductInput } from "@/services";

export function useProductCreate() {
  return useService<Product, CreateProductInput>({
    serviceFn: productService.create.bind(productService),
  });
}

export function useProductUpdate() {
  return useService<Product, { id: string; input: UpdateProductInput }>({
    serviceFn: ({ id, input }) => productService.update(id, input),
  });
}

export function useProductDelete() {
  return useService<void, string>({
    serviceFn: productService.delete.bind(productService),
  });
}

export function useProductGet() {
  return useService<Product, string>({
    serviceFn: productService.getById.bind(productService),
  });
}

export function useProductList() {
  return useService<Product[], { search?: string; category?: string }>({
    serviceFn: productService.list.bind(productService),
  });
}

export function useProductCalculateCost() {
  return useService<number, string>({
    serviceFn: productService.calculateCost.bind(productService),
  });
}

export function useProductCanProduce() {
  return useService<{ canProduce: boolean; reasons: string[] }, { productId: string; quantity: number }>({
    serviceFn: ({ productId, quantity }) => productService.canProduce(productId, quantity),
  });
}
