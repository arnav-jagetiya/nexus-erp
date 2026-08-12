import { apiClient } from './client';
import { ApiResponse } from '../types';

export interface CustomerDTO {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber: string | null;
  customerType: 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
  address: string;
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  followUpDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFollowUpDTO {
  id: string;
  customerId: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateCustomerInput {
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  customerType: 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
  address: string;
  status?: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  followUpDate?: string | null;
  notes?: string | null;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export interface GetCustomersFilters {
  search?: string;
  status?: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  customerType?: 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
  page?: number;
  limit?: number;
}

export const customersApi = {
  getCustomers: async (filters: GetCustomersFilters = {}) => {
    const response = await apiClient.get<ApiResponse<CustomerDTO[]>>('/customers', { params: filters });
    return response.data;
  },

  getCustomerById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<CustomerDTO>>(`/customers/${id}`);
    return response.data.data;
  },

  createCustomer: async (data: CreateCustomerInput) => {
    const response = await apiClient.post<ApiResponse<CustomerDTO>>('/customers', data);
    return response.data.data;
  },

  updateCustomer: async (id: string, data: UpdateCustomerInput) => {
    const response = await apiClient.patch<ApiResponse<CustomerDTO>>(`/customers/${id}`, data);
    return response.data.data;
  },

  deleteCustomer: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/customers/${id}`);
    return response.data.data;
  },

  createFollowUp: async (id: string, note: string, followUpDate?: string | null) => {
    const response = await apiClient.post<ApiResponse<CustomerFollowUpDTO>>(`/customers/${id}/followups`, { note, followUpDate });
    return response.data.data;
  },

  getFollowUps: async (id: string) => {
    const response = await apiClient.get<ApiResponse<CustomerFollowUpDTO[]>>(`/customers/${id}/followups`);
    return response.data.data;
  }
};
