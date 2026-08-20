import { api } from './api'
import type { PageResponse, MessageResponse } from '@/types/api.types'
import type {
  AdminSearchUserRequest,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  AdminUpdateUserStatusRequest,
  AdminResetPasswordRequest,
  AdminResetPinRequest,
  AdminUserSummaryResponse,
  AdminUserDetailResponse,
} from '@/types/user.types'

export const adminUserService = {
  async searchUsers(params?: AdminSearchUserRequest): Promise<PageResponse<AdminUserSummaryResponse>> {
    const response = await api.post<PageResponse<AdminUserSummaryResponse>>('/private/api/v1/admin/users/search', params || {})
    return response.data
  },

  async getUserDetail(id: string): Promise<AdminUserDetailResponse> {
    const response = await api.get<AdminUserDetailResponse>(`/private/api/v1/admin/users/${id}`)
    return response.data
  },

  async createUser(data: AdminCreateUserRequest): Promise<AdminUserDetailResponse> {
    const response = await api.post<AdminUserDetailResponse>('/private/api/v1/admin/users/create', data)
    return response.data
  },

  async updateUser(id: string, data: AdminUpdateUserRequest): Promise<AdminUserDetailResponse> {
    const response = await api.put<AdminUserDetailResponse>(`/private/api/v1/admin/users/${id}`, data)
    return response.data
  },

  async updateUserStatus(id: string, data: AdminUpdateUserStatusRequest): Promise<MessageResponse> {
    const response = await api.patch<MessageResponse>(`/private/api/v1/admin/users/${id}/status`, data)
    return response.data
  },

  async unlockUser(id: string): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>(`/private/api/v1/admin/users/${id}/unlock`)
    return response.data
  },

  async resetPassword(id: string, data: AdminResetPasswordRequest): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>(`/private/api/v1/admin/users/${id}/reset-password`, data)
    return response.data
  },

  async resetPin(id: string, data: AdminResetPinRequest): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>(`/private/api/v1/admin/users/${id}/reset-pin`, data)
    return response.data
  },

  async deleteUser(id: string): Promise<MessageResponse> {
    const response = await api.delete<MessageResponse>(`/private/api/v1/admin/users/${id}`)
    return response.data
  },
}
