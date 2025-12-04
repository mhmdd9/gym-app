// Common API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// Pagination response
export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

// Club types
export interface Club {
  id: number
  ownerId: number
  name: string
  description?: string
  address: string
  city: string
  phoneNumber?: string
  email?: string
  latitude?: number
  longitude?: number
  isActive: boolean
  openingTime?: string // HH:mm format
  closingTime?: string // HH:mm format
}

// Class Session types
export interface ClassSession {
  id: number
  activityId: number
  activityName: string
  trainerId?: number
  trainerName?: string
  clubId: number
  clubName: string
  sessionDate: string // YYYY-MM-DD format
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  capacity: number
  bookedCount: number
  availableSpots: number
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED'
}

// Reservation types
export interface Reservation {
  id: number
  userId: number
  sessionId: number
  clubId: number
  status: 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED'
  bookedAt: string // ISO datetime
  cancelledAt?: string // ISO datetime
  cancellationReason?: string
  checkedInAt?: string // ISO datetime
}

// User types (re-export for convenience)
export interface User {
  id: number
  phoneNumber: string
  email?: string
  firstName?: string
  lastName?: string
  fullName?: string
  roles: string[]
}

// Request types
export interface CreateReservationRequest {
  sessionId: number
}

export interface CancelReservationRequest {
  reason?: string
}

// Query params
export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
}

