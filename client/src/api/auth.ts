import { apiClient } from './client';
import { ApiResponse, User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data.data;
  },

  register: async (data: { name: string; email: string; password: string; requestedRole: string }): Promise<LoginResponse | { message: string, status: string }> => {
    const response = await apiClient.post<ApiResponse<LoginResponse | { message: string, status: string }>>('/auth/register', data);
    return response.data.data;
  },

  forgotPassword: async (email: string): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>('/auth/forgot-password', { email });
    return response.data.message || '';
  },

  resetPassword: async (password: string): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>('/auth/reset-password', { password });
    return response.data.message || '';
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },
};
