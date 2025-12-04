import { apiClient } from './client'
import type { ApiResponse, ClassSession } from '../types'

export const classesApi = {
  /**
   * Get available sessions by date (public endpoint)
   */
  getAvailableSessions: (date: string) =>
    apiClient.get<ApiResponse<ClassSession[]>>('/v1/classes', { params: { date } }),

  /**
   * Get upcoming sessions for a specific club (public endpoint)
   */
  getClubSessions: (clubId: number) =>
    apiClient.get<ApiResponse<ClassSession[]>>(`/v1/classes/club/${clubId}`),

  /**
   * Get session by ID (public endpoint)
   */
  getSessionById: (id: number) => apiClient.get<ApiResponse<ClassSession>>(`/v1/classes/${id}`),

  /**
   * Create a new class session (requires staff role)
   */
  createSession: (data: {
    activityId: number
    trainerId?: number
    clubId: number
    sessionDate: string
    startTime: string
    endTime: string
    capacity: number
    notes?: string
  }) => apiClient.post<ApiResponse<ClassSession>>('/v1/classes', data),

  /**
   * Cancel a class session (requires manager+ role)
   */
  cancelSession: (id: number) => apiClient.post<ApiResponse<void>>(`/v1/classes/${id}/cancel`),
}

