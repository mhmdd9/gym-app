import { apiClient } from './client'
import type { ApiResponse, PageResponse, PendingPayment, Payment, PaymentHistory, RecordPaymentRequest } from '../types'

export interface PaymentHistoryParams {
  search?: string
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export const paymentsApi = {
  /**
   * Get pending payments for a club (staff only)
   */
  getPendingPayments: (clubId: number) =>
    apiClient.get<ApiResponse<PendingPayment[]>>(`/v1/payments/club/${clubId}/pending`),

  /**
   * Get payment by reservation ID
   */
  getPaymentByReservation: (reservationId: number) =>
    apiClient.get<ApiResponse<Payment>>(`/v1/payments/reservation/${reservationId}`),

  /**
   * Record a payment (staff only)
   */
  recordPayment: (data: RecordPaymentRequest) =>
    apiClient.post<ApiResponse<Payment>>('/v1/payments', data),

  /**
   * Get payment history for a club with pagination and search (admin/owner only)
   */
  getPaymentHistory: (clubId: number, params?: PaymentHistoryParams) =>
    apiClient.get<ApiResponse<PageResponse<PaymentHistory>>>(`/v1/payments/club/${clubId}/history`, {
      params: {
        search: params?.search || '',
        page: params?.page || 0,
        size: params?.size || 20,
        sortBy: params?.sortBy || 'paidAt',
        sortDir: params?.sortDir || 'desc',
      },
    }),
}
