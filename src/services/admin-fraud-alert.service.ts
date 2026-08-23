import { api } from './api'
import type { PageResponse } from '@/types/api.types'
import type {
  FraudAlertSearchRequest,
  FraudAlertSummary,
  FraudAlertDetail,
  UpdateFraudAlertStatusRequest,
} from '@/types/fraud-alert.types'
import type { MessageResponse } from '@/types/api.types'

export const adminFraudAlertService = {
  async searchAlerts(params?: FraudAlertSearchRequest): Promise<PageResponse<FraudAlertSummary>> {
    const response = await api.post<PageResponse<FraudAlertSummary>>(
      '/private/api/v1/admin/fraud-alerts/search',
      params || {}
    )
    return response.data
  },

  async getAlertDetail(id: string): Promise<FraudAlertDetail> {
    const response = await api.get<FraudAlertDetail>(`/private/api/v1/admin/fraud-alerts/${id}`)
    return response.data
  },

  async updateAlertStatus(id: string, data: UpdateFraudAlertStatusRequest): Promise<MessageResponse> {
    const response = await api.patch<MessageResponse>(
      `/private/api/v1/admin/fraud-alerts/${id}/status`,
      data
    )
    return response.data
  },
}
