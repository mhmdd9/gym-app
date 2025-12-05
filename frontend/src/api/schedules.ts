import { apiClient } from './client'
import type { ApiResponse, Schedule, CreateScheduleRequest } from '../types'

export const schedulesApi = {
  /**
   * Get active schedules for a club
   */
  getClubSchedules: (clubId: number) =>
    apiClient.get<ApiResponse<Schedule[]>>(`/v1/schedules/club/${clubId}`),

  /**
   * Get all schedules for a club (including inactive)
   */
  getAllClubSchedules: (clubId: number) =>
    apiClient.get<ApiResponse<Schedule[]>>(`/v1/schedules/club/${clubId}/all`),

  /**
   * Get a specific schedule
   */
  getSchedule: (id: number) =>
    apiClient.get<ApiResponse<Schedule>>(`/v1/schedules/${id}`),

  /**
   * Create a new schedule
   */
  createSchedule: (clubId: number, data: CreateScheduleRequest) =>
    apiClient.post<ApiResponse<Schedule>>(`/v1/schedules/club/${clubId}`, data),

  /**
   * Update a schedule
   */
  updateSchedule: (id: number, data: CreateScheduleRequest) =>
    apiClient.put<ApiResponse<Schedule>>(`/v1/schedules/${id}`, data),

  /**
   * Delete a schedule
   */
  deleteSchedule: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/v1/schedules/${id}`),

  /**
   * Toggle schedule status
   */
  toggleScheduleStatus: (id: number) =>
    apiClient.post<ApiResponse<Schedule>>(`/v1/schedules/${id}/toggle`),

  /**
   * Generate sessions from schedules
   */
  generateSessions: (clubId: number, startDate: string, endDate: string) =>
    apiClient.post<ApiResponse<{ sessionsCreated: number }>>(
      `/v1/schedules/club/${clubId}/generate`,
      null,
      { params: { startDate, endDate } }
    ),
}
