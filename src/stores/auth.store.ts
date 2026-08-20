import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'
import type { LoginRequest, AuthResponse } from '@/types/auth.types'
import { getErrorMessage } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<AuthResponse['user'] | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  )
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => {
    if (!user.value?.roles) return false
    return user.value.roles.some((r) => r.toUpperCase().includes('ADMIN'))
  })

  async function login(credentials: LoginRequest): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.login(credentials)
      if (response.accessToken) {
        token.value = response.accessToken
        user.value = response.user || null
        localStorage.setItem('token', response.accessToken)
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user))
        }
        return true
      }
      error.value = 'Không nhận được mã xác thực truy cập.'
      return false
    } catch (err) {
      error.value = getErrorMessage(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  return {
    token,
    user,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  }
})
