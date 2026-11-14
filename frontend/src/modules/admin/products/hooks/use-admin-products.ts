import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminProductService } from "../product.service";
import type { ListProductsParams } from "../types";
import { toast } from "sonner";

export const ADMIN_PRODUCTS_QUERY_KEYS = {
  all: ["admin", "products"] as const,
  list: (params: ListProductsParams) => [...ADMIN_PRODUCTS_QUERY_KEYS.all, "list", params] as const,
  detail: (id: string) => [...ADMIN_PRODUCTS_QUERY_KEYS.all, "detail", id] as const,
  categories: () => ["admin", "products", "categories"] as const,
};

export function useProductsList(params: ListProductsParams = {}) {
  return useQuery({
    queryKey: ADMIN_PRODUCTS_QUERY_KEYS.list(params),
    queryFn: () => adminProductService.listProducts(params),
    staleTime: 15 * 1000,
  });
}

export function useProductDetails(id?: string | null) {
  return useQuery({
    queryKey: ADMIN_PRODUCTS_QUERY_KEYS.detail(id || ""),
    queryFn: () => adminProductService.getProductById(id!),
    enabled: Boolean(id),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ADMIN_PRODUCTS_QUERY_KEYS.categories(),
    queryFn: () => adminProductService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useArchiveProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminProductService.archiveProduct(id),
    onSuccess: (archived) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEYS.all });
      toast.success(`Product ${archived.name} archived`);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || error.message || "Failed to archive product";
      toast.error(message);
    },
  });
}

