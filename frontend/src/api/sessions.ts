import { apiClient } from './client'
import type { ApiResponse, ClassSession, Activity, Trainer, CreateClassSessionRequest, CreateActivityRequest } from '../types'

export const sessionsApi = {
  /**
   * Get available sessions by date (public)
   */
  getAvailableSessions: (date: string) =>
    apiClient.get<ApiResponse<ClassSession[]>>('/v1/classes', { params: { date } }),

  /**
   * Get upcoming sessions for a club (public)
   */
  getClubSessions: (clubId: number) =>
    apiClient.get<ApiResponse<ClassSession[]>>(`/v1/classes/club/${clubId}`),

  /**
   * Get all sessions for club management (staff only - includes all statuses)
   */
  getClubSessionsForManagement: (clubId: number) =>
    apiClient.get<ApiResponse<ClassSession[]>>(`/v1/classes/club/${clubId}/manage`),

  /**
   * Get session by ID
   */
  getSessionById: (id: number) =>
    apiClient.get<ApiResponse<ClassSession>>(`/v1/classes/${id}`),

  /**
   * Create a new class session (staff only)
   */
  createSession: (data: CreateClassSessionRequest) =>
    apiClient.post<ApiResponse<ClassSession>>('/v1/classes', data),

  /**
   * Cancel a class session (staff only)
   */
  cancelSession: (id: number) =>
    apiClient.post<ApiResponse<void>>(`/v1/classes/${id}/cancel`),

  /**
   * Get activities for a club (public - only active)
   */
  getClubActivities: (clubId: number) =>
    apiClient.get<ApiResponse<Activity[]>>(`/v1/clubs/${clubId}/activities`),

  /**
   * Get all activities for a club (admin - includes inactive)
   */
  getAllClubActivities: (clubId: number) =>
    apiClient.get<ApiResponse<Activity[]>>(`/v1/clubs/${clubId}/activities/all`),

  /**
   * Create a new activity
   */
  createActivity: (clubId: number, data: CreateActivityRequest) =>
    apiClient.post<ApiResponse<Activity>>(`/v1/clubs/${clubId}/activities`, data),

  /**
   * Update an activity
   */
  updateActivity: (clubId: number, activityId: number, data: CreateActivityRequest) =>
    apiClient.put<ApiResponse<Activity>>(`/v1/clubs/${clubId}/activities/${activityId}`, data),

  /**
   * Delete an activity
   */
  deleteActivity: (clubId: number, activityId: number) =>
    apiClient.delete<ApiResponse<void>>(`/v1/clubs/${clubId}/activities/${activityId}`),

  /**
   * Toggle activity status
   */
  toggleActivityStatus: (clubId: number, activityId: number) =>
    apiClient.post<ApiResponse<Activity>>(`/v1/clubs/${clubId}/activities/${activityId}/toggle`),

  /**
   * Get trainers for a club
   */
  getClubTrainers: (clubId: number) =>
    apiClient.get<ApiResponse<Trainer[]>>(`/v1/clubs/${clubId}/trainers`),
}
