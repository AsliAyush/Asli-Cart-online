import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { customerCatalogService } from "../services";
import type { ListCustomerProductsParams } from "../types";

export const CUSTOMER_CATALOG_KEYS = {
  all: ["customer-catalog"] as const,
  products: (params?: ListCustomerProductsParams) =>
    [...CUSTOMER_CATALOG_KEYS.all, "products", params] as const,
  product: (idOrSlug: string) =>
    [...CUSTOMER_CATALOG_KEYS.all, "product", idOrSlug] as const,
  categories: () => [...CUSTOMER_CATALOG_KEYS.all, "categories"] as const,
  search: (q: string, page?: number, limit?: number) =>
    [...CUSTOMER_CATALOG_KEYS.all, "search", q, page, limit] as const,
};

export function useCustomerProducts(params?: ListCustomerProductsParams) {
  return useQuery({
    queryKey: CUSTOMER_CATALOG_KEYS.products(params),
    queryFn: () => customerCatalogService.listProducts(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

export function useCustomerProductDetails(idOrSlug: string) {
  return useQuery({
    queryKey: CUSTOMER_CATALOG_KEYS.product(idOrSlug),
    queryFn: () => customerCatalogService.getProductDetails(idOrSlug),
    enabled: Boolean(idOrSlug),
    staleTime: 60 * 1000,
  });
}

export function useCustomerCategories() {
  return useQuery({
    queryKey: CUSTOMER_CATALOG_KEYS.categories(),
    queryFn: () => customerCatalogService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCustomerSearch(q: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: CUSTOMER_CATALOG_KEYS.search(q, page, limit),
    queryFn: () => customerCatalogService.searchProducts(q, page, limit),
    enabled: Boolean(q && q.trim().length > 0),
    staleTime: 30 * 1000,
  });
}

