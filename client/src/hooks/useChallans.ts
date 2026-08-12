import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challansApi, GetChallansFilters, CreateChallanInput, UpdateChallanInput } from '../api/challans';
import { inventoryKeys } from './useInventory';
import { productKeys } from './useProducts';
import { useNotification } from './useNotification';

export const challanKeys = {
  all: ['challans'] as const,
  lists: () => [...challanKeys.all, 'list'] as const,
  list: (filters: GetChallansFilters) => [...challanKeys.lists(), filters] as const,
  details: () => [...challanKeys.all, 'detail'] as const,
  detail: (id: string) => [...challanKeys.details(), id] as const,
};

export function useChallans(filters: GetChallansFilters = {}) {
  return useQuery({
    queryKey: challanKeys.list(filters),
    queryFn: () => challansApi.getChallans(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useChallan(id: string) {
  return useQuery({
    queryKey: challanKeys.detail(id),
    queryFn: () => challansApi.getChallanById(id),
    enabled: !!id,
  });
}

export function useCreateChallan() {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: (data: CreateChallanInput) => challansApi.createChallan(data),
    onSuccess: async (data) => {
      notify.success('Challan created', `Draft challan has been created.`);
      await queryClient.invalidateQueries({ queryKey: challanKeys.lists() });
    },
  });
}

export function useUpdateChallan() {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChallanInput }) => challansApi.updateChallan(id, data),
    onSuccess: async (data, variables) => {
      notify.success('Challan updated', 'The challan details have been saved.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: challanKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: challanKeys.detail(variables.id) })
      ]);
    },
  });
}

export function useCancelChallan() {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: (id: string) => challansApi.cancelChallan(id),
    onSuccess: async (data, variables) => {
      notify.success('Challan cancelled', 'The challan has been cancelled.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: challanKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: challanKeys.detail(variables) })
      ]);
    },
  });
}

export function useConfirmChallan() {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: (id: string) => challansApi.confirmChallan(id),
    onSuccess: async (data, variables) => {
      notify.success('Challan confirmed', 'Stock has been deducted and challan is now active.');
      await Promise.all([
        // 1. Invalidate Challan itself
        queryClient.invalidateQueries({ queryKey: challanKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: challanKeys.detail(variables) }),
        
        // 2. Invalidate Products (stock has changed)
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        
        // 3. Invalidate Inventory Overview & Ledgers (new stock movements recorded)
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      ]);
    },
  });
}
