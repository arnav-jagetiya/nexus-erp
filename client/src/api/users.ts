import { apiClient } from './client';
import { ApiResponse } from '../types';

export interface UserListDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  requestedRole: string | null;
  approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  isPrimaryAdmin: boolean;
  suspendedAt: string | null;
  suspendedUntil: string | null;
  suspensionReason: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export const usersApi = {
  getUsers: async (filters?: { approvalStatus?: string; status?: string; role?: string }): Promise<UserListDTO[]> => {
    const response = await apiClient.get<ApiResponse<UserListDTO[]>>('/users', { params: filters });
    return response.data.data;
  },

  approveUser: async (id: string): Promise<UserListDTO> => {
    const response = await apiClient.patch<ApiResponse<UserListDTO>>(`/users/${id}/approve`);
    return response.data.data;
  },

  rejectUser: async (id: string): Promise<UserListDTO> => {
    const response = await apiClient.patch<ApiResponse<UserListDTO>>(`/users/${id}/reject`);
    return response.data.data;
  },

  suspendUser: async (id: string, payload: { reason: string; until?: string }): Promise<UserListDTO> => {
    const response = await apiClient.patch<ApiResponse<UserListDTO>>(`/users/${id}/suspend`, payload);
    return response.data.data;
  },

  reactivateUser: async (id: string): Promise<UserListDTO> => {
    const response = await apiClient.patch<ApiResponse<UserListDTO>>(`/users/${id}/reactivate`);
    return response.data.data;
  },

  revokeUser: async (id: string, payload: { reason: string }): Promise<UserListDTO> => {
    const response = await apiClient.patch<ApiResponse<UserListDTO>>(`/users/${id}/revoke`, payload);
    return response.data.data;
  },

  revokeAdmin: async (id: string, payload: { newRole: string; reason?: string }): Promise<UserListDTO> => {
    const response = await apiClient.patch<ApiResponse<UserListDTO>>(`/users/${id}/revoke-admin`, payload);
    return response.data.data;
  },
};
