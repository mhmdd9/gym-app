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
  activityType?: 'CLASS' | 'OPEN_GYM'
}

// Create activity request
export interface CreateActivityRequest {
  name: string
  description?: string
  durationMinutes: number
  defaultCapacity: number
  intensityLevel?: string
  category?: string
  activityType?: string
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

// Payment types
export interface PendingPayment {
  reservationId: number
  userId: number
  userPhoneNumber?: string
  userFullName?: string
  sessionId: number
  activityName?: string
  sessionDate?: string // YYYY-MM-DD
  startTime?: string // HH:mm
  endTime?: string // HH:mm
  trainerName?: string
  bookedAt: string // ISO datetime
  clubId: number
  clubName?: string
}

export interface Payment {
  id: number
  reservationId: number
  userId: number
  clubId: number
  amount: number
  currency: string
  method: 'CASH' | 'CARD' | 'POS' | 'BANK_TRANSFER'
  referenceNumber?: string
  status: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'
  paidAt?: string
  recordedBy?: number
  notes?: string
}

export interface RecordPaymentRequest {
  reservationId: number
  amount: number
  method: 'CASH' | 'CARD' | 'POS' | 'BANK_TRANSFER'
  referenceNumber?: string
  notes?: string
}

// Payment History (enriched payment for admin view)
export interface PaymentHistory {
  id: number
  reservationId?: number
  membershipId?: number
  userId: number
  userFullName?: string
  userPhone?: string
  clubId: number
  amount: number
  currency: string
  method: 'CASH' | 'CARD' | 'POS' | 'BANK_TRANSFER'
  referenceNumber?: string
  status: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'
  paidAt?: string
  recordedBy?: number
  recordedByName?: string
  notes?: string
  paymentType: 'RESERVATION' | 'MEMBERSHIP'
  activityName?: string
  planName?: string
}

// Schedule types
export interface Schedule {
  id: number
  clubId: number
  clubName?: string
  activityId: number
  activityName?: string
  activityType?: string
  trainerId?: number
  trainerName?: string
  startTime: string // HH:mm
  endTime: string // HH:mm
  daysOfWeek: string[] // MONDAY, TUESDAY, etc.
  validFrom: string // YYYY-MM-DD
  validUntil?: string // YYYY-MM-DD
  capacity?: number
  isActive?: boolean
  notes?: string
}

export interface CreateScheduleRequest {
  activityId: number
  trainerId?: number
  startTime: string // HH:mm
  endTime: string // HH:mm
  daysOfWeek: string[] // MONDAY, TUESDAY, etc.
  validFrom: string // YYYY-MM-DD
  validUntil?: string // YYYY-MM-DD
  capacity?: number
  notes?: string
}

// Membership Plan types
export interface MembershipPlan {
  id: number
  clubId: number
  activityId?: number
  activityName?: string
  name: string
  description?: string
  durationDays: number
  price: number
  isActive: boolean
}

export interface CreateMembershipPlanRequest {
  activityId?: number
  name: string
  description?: string
  durationDays: number
  price: number
}

// User Membership types
export interface UserMembership {
  id: number
  userId: number
  planId: number
  clubId: number
  startDate: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED'
  paymentId?: number
  notes?: string
  // Enriched fields
  planName?: string
  clubName?: string
  userName?: string
  userPhone?: string
}

export interface PurchaseMembershipRequest {
  planId: number
  clubId: number
  startDate?: string
  endDate?: string
  paymentId?: number
  notes?: string
}

export interface ValidateMembershipResponse {
  valid: boolean
  message: string
  membershipId?: number
  planId?: number
  endDate?: string
}

// Attendance types
export interface Attendance {
  id: number
  userId: number
  membershipId: number
  clubId: number
  sessionId?: number
  checkInTime: string // ISO datetime
  recordedByUserId?: number
  notes?: string
  // Enriched fields
  userName?: string
  userPhone?: string
  planName?: string
  sessionName?: string
}

export interface CheckInRequest {
  userId: number
  membershipId: number
  clubId: number
  sessionId?: number
  notes?: string
}

// User search result for check-in
export interface UserSearchResult {
  id: number
  phoneNumber: string
  fullName?: string
}

