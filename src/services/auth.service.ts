import { api } from './api'
import type { LoginRequest, AuthResponse, UserProfileResponse } from '@/types/auth.types'
import type { MessageResponse } from '@/types/api.types'

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/public/api/v1/auth/login', data)
    return response.data
  },

  async getProfile(): Promise<UserProfileResponse> {
    const response = await api.get<UserProfileResponse>('/private/api/v1/auth/me')
    return response.data
  },

  async logout(): Promise<MessageResponse> {
    try {
      const response = await api.post<MessageResponse>('/private/api/v1/auth/logout')
      return response.data
    } catch {
      return { message: 'Logged out' }
    }
  },
}
