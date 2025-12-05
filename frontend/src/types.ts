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

// Activity types
export interface Activity {
  id: number
  clubId: number
  name: string
  description?: string
  durationMinutes: number
  defaultCapacity: number
  intensityLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  category?: string
  isActive?: boolean
}

// Create activity request
export interface CreateActivityRequest {
  name: string
  description?: string
  durationMinutes: number
  defaultCapacity: number
  intensityLevel?: string
  category?: string
}

// Trainer types
export interface Trainer {
  id: number
  clubId: number
  userId?: number
  firstName: string
  lastName: string
  fullName: string
  phoneNumber?: string
  specialization?: string
  bio?: string
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

// Create session request
export interface CreateClassSessionRequest {
  activityId: number
  trainerId?: number
  clubId: number
  sessionDate: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  capacity: number
  notes?: string
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

