import { apiClient } from './client';
import { ApiResponse } from '../types';

export interface ProductDTO {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock?: number;
  minStockAlert?: number;
  location: string;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface GetProductsFilters {
  search?: string;
  category?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export const productsApi = {
  getProducts: async (filters: GetProductsFilters = {}) => {
    const response = await apiClient.get<ApiResponse<ProductDTO[]>>('/products', { params: filters });
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ProductDTO>>(`/products/${id}`);
    return response.data.data;
  },

  createProduct: async (data: CreateProductInput) => {
    const response = await apiClient.post<ApiResponse<ProductDTO>>('/products', data);
    return response.data.data;
  },

  updateProduct: async (id: string, data: UpdateProductInput) => {
    const response = await apiClient.patch<ApiResponse<ProductDTO>>(`/products/${id}`, data);
    return response.data.data;
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/products/${id}`);
    return response.data.data;
  }
};
