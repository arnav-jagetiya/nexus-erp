import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi, GetCustomersFilters, CreateCustomerInput, UpdateCustomerInput } from '../api/customers';
import { useNotification } from './useNotification';

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: GetCustomersFilters) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  followUps: (id: string) => [...customerKeys.detail(id), 'followUps'] as const,
};

export function useCustomers(filters: GetCustomersFilters = {}) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => customersApi.getCustomers(filters),
    placeholderData: (previousData) => previousData, // keep previous data while fetching new pages
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersApi.getCustomerById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: (data: CreateCustomerInput) => customersApi.createCustomer(data),
    onSuccess: async (data) => {
      notify.success('Customer created', `${data.name} has been added.`);
      await queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerInput }) => customersApi.updateCustomer(id, data),
    onSuccess: async (data, variables) => {
      notify.success('Customer updated', 'The customer profile has been updated.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) })
      ]);
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: (id: string) => customersApi.deleteCustomer(id),
    onSuccess: async () => {
      notify.success('Customer deleted', 'The customer record has been removed.');
      await queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

export function useCustomerFollowUps(id: string) {
  return useQuery({
    queryKey: customerKeys.followUps(id),
    queryFn: () => customersApi.getFollowUps(id),
    enabled: !!id,
  });
}

export function useCreateCustomerFollowUp() {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: ({ id, note, followUpDate }: { id: string; note: string; followUpDate?: string | null }) => 
      customersApi.createFollowUp(id, note, followUpDate),
    onSuccess: async (data, variables) => {
      notify.success('Note added', 'The follow-up activity has been recorded.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerKeys.followUps(variables.id) }),
        queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) }),
        queryClient.invalidateQueries({ queryKey: customerKeys.lists() }) // update follow-up date in lists if changed
      ]);
    },
  });
}
