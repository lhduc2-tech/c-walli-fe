import axios, { type AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/types/api.types'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/fintech-service'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: Handle unauth & extract errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined
    if (data?.message) return data.message
    if (data?.error) return data.error
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
}
