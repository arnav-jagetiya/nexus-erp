import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, GetProductsFilters, CreateProductInput, UpdateProductInput } from '../api/products';
import { useNotification } from './useNotification';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: GetProductsFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export function useProducts(filters: GetProductsFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsApi.getProducts(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProductById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: (data: CreateProductInput) => productsApi.createProduct(data),
    onSuccess: async (data) => {
      notify.success('Product created', `${data.sku} has been added to the catalog.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: ['inventory', 'overview'] })
      ]);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) => productsApi.updateProduct(id, data),
    onSuccess: async (data, variables) => {
      notify.success('Product updated', 'The product details have been saved.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) }),
        queryClient.invalidateQueries({ queryKey: ['inventory', 'overview'] })
      ]);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: async () => {
      notify.success('Product deleted', 'The product has been removed.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: ['inventory', 'overview'] })
      ]);
    },
  });
}
