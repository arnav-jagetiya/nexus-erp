import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, GetMovementsFilters, CreateMovementInput } from '../api/inventory';
import { productKeys } from './useProducts';
import { useNotification } from './useNotification';

export const inventoryKeys = {
  all: ['inventory'] as const,
  overview: () => [...inventoryKeys.all, 'overview'] as const,
  movements: (filters: GetMovementsFilters) => [...inventoryKeys.all, 'movements', filters] as const,
};

export function useInventoryOverview() {
  return useQuery({
    queryKey: inventoryKeys.overview(),
    queryFn: () => inventoryApi.getOverview(),
  });
}

export function useStockMovements(filters: GetMovementsFilters = {}) {
  return useQuery({
    queryKey: inventoryKeys.movements(filters),
    queryFn: () => inventoryApi.listMovements(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useStockAdjustment() {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: (data: CreateMovementInput) => inventoryApi.createMovement(data),
    onSuccess: async (data, variables) => {
      notify.success('Stock movement recorded', `Stock ${variables.movementType} of ${variables.quantity} units successful.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inventoryKeys.overview() }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.movements({}) }),
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) })
      ]);
    },
  });
}
