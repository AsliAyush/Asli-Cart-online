import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pmProductService } from "../product.service";
import type {
  ListPMProductsParams,
  CreateProductInput,
  UpdateProductInput,
} from "../types";
import { PM_DASHBOARD_QUERY_KEYS } from "../../dashboard/hooks/use-pm-dashboard";

export const PM_PRODUCTS_QUERY_KEYS = {
  list: (params: ListPMProductsParams) => ["pm", "products", "list", params] as const,
  detail: (id: string) => ["pm", "products", "detail", id] as const,
  categories: ["pm", "products", "categories"] as const,
};

export function usePMProducts() {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<ListPMProductsParams>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    categoryId: "",
  });

  const productsQuery = useQuery({
    queryKey: PM_PRODUCTS_QUERY_KEYS.list(params),
    queryFn: () => pmProductService.listProducts(params),
    staleTime: 30000,
  });

  const categoriesQuery = useQuery({
    queryKey: PM_PRODUCTS_QUERY_KEYS.categories,
    queryFn: () => pmProductService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductInput) => pmProductService.createProduct(data),
    onSuccess: (newProd) => {
      toast.success(`Product "${newProd.name}" created successfully as DRAFT!`);
      queryClient.invalidateQueries({ queryKey: ["pm", "products"] });
      queryClient.invalidateQueries({ queryKey: PM_DASHBOARD_QUERY_KEYS.summary });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      pmProductService.updateProduct(id, data),
    onSuccess: (updated) => {
      toast.success(`Product "${updated.name}" updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ["pm", "products"] });
      queryClient.invalidateQueries({ queryKey: PM_PRODUCTS_QUERY_KEYS.detail(updated.id) });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update product");
    },
  });

  const submitApprovalMutation = useMutation({
    mutationFn: (id: string) => pmProductService.submitForApproval(id),
    onSuccess: (item) => {
      toast.success(`Product "${item.name}" submitted for Admin approval!`);
      queryClient.invalidateQueries({ queryKey: ["pm", "products"] });
      queryClient.invalidateQueries({ queryKey: PM_DASHBOARD_QUERY_KEYS.summary });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to submit product");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => pmProductService.archiveProduct(id),
    onSuccess: (archived) => {
      toast.success(`Product "${archived.name}" archived successfully!`);
      queryClient.invalidateQueries({ queryKey: ["pm", "products"] });
      queryClient.invalidateQueries({ queryKey: PM_DASHBOARD_QUERY_KEYS.summary });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to archive product");
    },
  });

  const assignSmmMutation = useMutation({
    mutationFn: ({ id, isAssigned }: { id: string; isAssigned: boolean }) =>
      pmProductService.assignToSmm(id, isAssigned),
    onSuccess: (updated, vars) => {
      toast.success(
        `Product successfully ${vars.isAssigned ? "assigned to" : "unassigned from"} Social Media Manager`
      );
      queryClient.invalidateQueries({ queryKey: ["pm", "products"] });
      queryClient.invalidateQueries({ queryKey: PM_DASHBOARD_QUERY_KEYS.summary });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update SMM status");
    },
  });

  return {
    items: productsQuery.data?.items || [],
    pagination: productsQuery.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,
    params,
    setParams,
    categories: categoriesQuery.data || [],
    isLoadingCategories: categoriesQuery.isLoading,

    createProduct: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateProduct: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    submitForApproval: submitApprovalMutation.mutateAsync,
    isSubmitting: submitApprovalMutation.isPending,

    archiveProduct: archiveMutation.mutateAsync,
    isArchiving: archiveMutation.isPending,

    assignToSmm: assignSmmMutation.mutateAsync,
    isAssigningSmm: assignSmmMutation.isPending,

    refetch: productsQuery.refetch,
  };
}

