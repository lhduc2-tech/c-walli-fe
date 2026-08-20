export interface BaseRequest {
  pageIndex?: number
  pageSize?: number
  sort?: string
  direction?: 'ASC' | 'DESC' | string
}

export interface PageResponse<T> {
  size: number
  totalElements: number
  totalPages: number
  content: T[]
}

export interface MessageResponse {
  message: string
}

export interface ApiErrorResponse {
  error?: string
  message: string
  retryable?: boolean
  details?: Record<string, any>
}
