import { apiClient } from './client'
import type { ApiResponse, Club, PageResponse, PaginationParams } from '../types'

export const clubsApi = {
  /**
   * Get all active clubs (public endpoint)
   */
  getAllClubs: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<PageResponse<Club>>>('/v1/clubs', { params }),

  /**
   * Get club by ID (public endpoint)
   */
  getClubById: (id: number) => apiClient.get<ApiResponse<Club>>(`/v1/clubs/${id}`),

  /**
   * Get clubs owned by the current user (requires GYM_OWNER or ADMIN role)
   */
  getMyClubs: () => apiClient.get<ApiResponse<Club[]>>('/v1/clubs/my-clubs'),

  /**
   * Create a new club (requires GYM_OWNER or ADMIN role)
   */
  createClub: (data: Omit<Club, 'id' | 'ownerId' | 'isActive'>) =>
    apiClient.post<ApiResponse<Club>>('/v1/clubs', data),

  /**
   * Update a club (requires GYM_OWNER or ADMIN role)
   */
  updateClub: (id: number, data: Omit<Club, 'id' | 'ownerId' | 'isActive'>) =>
    apiClient.put<ApiResponse<Club>>(`/v1/clubs/${id}`, data),

  /**
   * Delete (deactivate) a club (requires GYM_OWNER or ADMIN role)
   */
  deleteClub: (id: number) => apiClient.delete<ApiResponse<void>>(`/v1/clubs/${id}`),
}

