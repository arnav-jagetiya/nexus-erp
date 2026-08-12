import { apiClient } from './client';
import { ApiResponse } from '../types';
import { CustomerDTO } from './customers';

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface ChallanItemDTO {
  id: string;
  challanId: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  // Product is included in getById, but optional elsewhere depending on include shape
  product?: {
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    location: string;
  };
}

export interface ChallanDTO {
  id: string;
  challanNumber: string;
  customerId: string;
  status: ChallanStatus;
  totalAmount: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  
  customer: Pick<CustomerDTO, 'id' | 'name' | 'email' | 'mobile' | 'businessName'>;
  createdBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  items: ChallanItemDTO[];
}

export interface GetChallansFilters {
  search?: string;
  status?: ChallanStatus;
  customerId?: string;
  page?: number;
  limit?: number;
}

export interface CreateChallanInput {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface UpdateChallanInput {
  customerId?: string;
  items?: {
    productId: string;
    quantity: number;
  }[];
}

export const challansApi = {
  getChallans: async (filters: GetChallansFilters = {}) => {
    const response = await apiClient.get<ApiResponse<ChallanDTO[]>>('/challans', { params: filters });
    return response.data;
  },

  getChallanById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ChallanDTO>>(`/challans/${id}`);
    return response.data.data;
  },

  createChallan: async (data: CreateChallanInput) => {
    const response = await apiClient.post<ApiResponse<ChallanDTO>>('/challans', data);
    return response.data.data;
  },

  updateChallan: async (id: string, data: UpdateChallanInput) => {
    const response = await apiClient.patch<ApiResponse<ChallanDTO>>(`/challans/${id}`, data);
    return response.data.data;
  },

  cancelChallan: async (id: string) => {
    const response = await apiClient.post<ApiResponse<ChallanDTO>>(`/challans/${id}/cancel`);
    return response.data.data;
  },

  confirmChallan: async (id: string) => {
    const response = await apiClient.post<ApiResponse<ChallanDTO>>(`/challans/${id}/confirm`);
    return response.data.data;
  }
};
