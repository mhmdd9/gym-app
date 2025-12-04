import { apiClient } from './client'
import type { ApiResponse, PageResponse, PaginationParams, Reservation } from '../types'

export const reservationsApi = {
  /**
   * Get current user's reservations (paginated)
   */
  getMyReservations: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<PageResponse<Reservation>>>('/v1/reservations/my', { params }),

  /**
   * Get current user's active reservations
   */
  getMyActiveReservations: () =>
    apiClient.get<ApiResponse<Reservation[]>>('/v1/reservations/my/active'),

  /**
   * Get a specific reservation by ID
   */
  getReservationById: (id: number) =>
    apiClient.get<ApiResponse<Reservation>>(`/v1/reservations/${id}`),

  /**
   * Get reservations for a club (requires staff role)
   */
  getClubReservations: (clubId: number, params?: PaginationParams) =>
    apiClient.get<ApiResponse<PageResponse<Reservation>>>(`/v1/reservations/club/${clubId}`, {
      params,
    }),

  /**
   * Create a new reservation (book a class session)
   */
  createReservation: (sessionId: number) =>
    apiClient.post<ApiResponse<Reservation>>('/v1/reservations', { sessionId }),

  /**
   * Cancel a reservation
   */
  cancelReservation: (id: number, reason?: string) =>
    apiClient.post<ApiResponse<Reservation>>(`/v1/reservations/${id}/cancel`, null, {
      params: reason ? { reason } : undefined,
    }),

  /**
   * Check in a reservation (requires staff role)
   */
  checkInReservation: (id: number) =>
    apiClient.post<ApiResponse<Reservation>>(`/v1/reservations/${id}/checkin`),
}

