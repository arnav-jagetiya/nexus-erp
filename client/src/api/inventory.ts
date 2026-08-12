import { apiClient } from './client';
import { ApiResponse } from '../types';

export interface StockMovementDTO {
  id: string;
  productId: string;
  quantity: number;
  movementType: 'IN' | 'OUT';
  reason: string;
  createdById: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InventoryOverviewDTO {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalMovements: number;
  recentMovements: StockMovementDTO[];
}

export interface CreateMovementInput {
  productId: string;
  quantity: number;
  movementType: 'IN' | 'OUT';
  reason: string;
}

export interface GetMovementsFilters {
  productId?: string;
  movementType?: 'IN' | 'OUT';
  page?: number;
  limit?: number;
}

export const inventoryApi = {
  getOverview: async () => {
    const response = await apiClient.get<ApiResponse<InventoryOverviewDTO>>('/inventory');
    return response.data.data;
  },

  listMovements: async (filters: GetMovementsFilters = {}) => {
    const response = await apiClient.get<ApiResponse<StockMovementDTO[]>>('/inventory/movements', { params: filters });
    return response.data;
  },

  createMovement: async (data: CreateMovementInput) => {
    const response = await apiClient.post<ApiResponse<StockMovementDTO>>('/inventory/movements', data);
    return response.data.data;
  }
};
