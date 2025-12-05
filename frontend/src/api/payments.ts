import { apiClient } from './client'
import type { ApiResponse, PendingPayment, Payment, RecordPaymentRequest } from '../types'

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
}
