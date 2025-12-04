import { apiClient } from './client'

interface User {
  id: number
  phoneNumber: string
  email?: string
  firstName?: string
  lastName?: string
  fullName?: string
  isActive: boolean
  isVerified: boolean
  roles: string[]
  lastLoginAt?: string
  createdAt: string
}

interface Role {
  id: number
  name: string
  description?: string
}

interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface UpdateUserRolesRequest {
  roles: string[]
}

interface UpdateUserStatusRequest {
  isActive: boolean
}

export const adminApi = {
  // User management
  getUsers: (params?: { search?: string; page?: number; size?: number }) =>
    apiClient.get<ApiResponse<PageResponse<User>>>('/v1/admin/users', { params }),

  getUserById: (id: number) =>
    apiClient.get<ApiResponse<User>>(`/v1/admin/users/${id}`),

  updateUserRoles: (id: number, data: UpdateUserRolesRequest) =>
    apiClient.put<ApiResponse<User>>(`/v1/admin/users/${id}/roles`, data),

  updateUserStatus: (id: number, data: UpdateUserStatusRequest) =>
    apiClient.put<ApiResponse<User>>(`/v1/admin/users/${id}/status`, data),

  // Roles
  getRoles: () =>
    apiClient.get<ApiResponse<Role[]>>('/v1/admin/users/roles'),
}

export type { User, Role, PageResponse, UpdateUserRolesRequest, UpdateUserStatusRequest }
