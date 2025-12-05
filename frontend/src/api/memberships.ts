import { apiClient as api } from './client'
import type {
  ApiResponse,
  MembershipPlan,
  CreateMembershipPlanRequest,
  UserMembership,
  PurchaseMembershipRequest,
  ValidateMembershipResponse,
  Attendance,
  CheckInRequest,
  UserSearchResult,
} from '../types'

// Membership Plans API
export const getMembershipPlans = (clubId: number): Promise<ApiResponse<MembershipPlan[]>> =>
  api.get(`/v1/clubs/${clubId}/membership-plans`).then((res) => res.data)

export const getAllMembershipPlans = (clubId: number): Promise<ApiResponse<MembershipPlan[]>> =>
  api.get(`/v1/clubs/${clubId}/membership-plans/all`).then((res) => res.data)

export const getMembershipPlan = (clubId: number, planId: number): Promise<ApiResponse<MembershipPlan>> =>
  api.get(`/v1/clubs/${clubId}/membership-plans/${planId}`).then((res) => res.data)

export const createMembershipPlan = (
  clubId: number,
  data: CreateMembershipPlanRequest
): Promise<ApiResponse<MembershipPlan>> =>
  api.post(`/v1/clubs/${clubId}/membership-plans`, data).then((res) => res.data)

export const updateMembershipPlan = (
  clubId: number,
  planId: number,
  data: CreateMembershipPlanRequest
): Promise<ApiResponse<MembershipPlan>> =>
  api.put(`/v1/clubs/${clubId}/membership-plans/${planId}`, data).then((res) => res.data)

export const toggleMembershipPlanStatus = (clubId: number, planId: number): Promise<ApiResponse<void>> =>
  api.post(`/v1/clubs/${clubId}/membership-plans/${planId}/toggle`).then((res) => res.data)

export const deleteMembershipPlan = (clubId: number, planId: number): Promise<ApiResponse<void>> =>
  api.delete(`/v1/clubs/${clubId}/membership-plans/${planId}`).then((res) => res.data)

// User Memberships API
export const getMyMemberships = (): Promise<ApiResponse<UserMembership[]>> =>
  api.get('/v1/memberships/my').then((res) => res.data)

export const getMyActiveMemberships = (): Promise<ApiResponse<UserMembership[]>> =>
  api.get('/v1/memberships/my/active').then((res) => res.data)

export const getMyMembershipsByClub = (clubId: number): Promise<ApiResponse<UserMembership[]>> =>
  api.get(`/v1/memberships/my/club/${clubId}`).then((res) => res.data)

// Request membership (creates with PENDING status - user flow)
export const requestMembership = (data: PurchaseMembershipRequest): Promise<ApiResponse<UserMembership>> =>
  api.post('/v1/memberships/request', data).then((res) => res.data)

export const validateMembership = (userId: number, clubId: number): Promise<ApiResponse<ValidateMembershipResponse>> =>
  api.get(`/v1/memberships/validate/${userId}/club/${clubId}`).then((res) => res.data)

export const searchUsersByPhone = (phone: string): Promise<ApiResponse<UserSearchResult[]>> =>
  api.get('/v1/memberships/search-users', { params: { phone } }).then((res) => res.data)

export const getUserMemberships = (userId: number): Promise<ApiResponse<UserMembership[]>> =>
  api.get(`/v1/memberships/user/${userId}`).then((res) => res.data)

export const getUserActiveMemberships = (userId: number): Promise<ApiResponse<UserMembership[]>> =>
  api.get(`/v1/memberships/user/${userId}/active`).then((res) => res.data)

// Staff endpoints for managing membership requests
export const getPendingMemberships = (clubId: number): Promise<ApiResponse<UserMembership[]>> =>
  api.get(`/v1/memberships/club/${clubId}/pending`).then((res) => res.data)

export const getClubMemberships = (clubId: number): Promise<ApiResponse<UserMembership[]>> =>
  api.get(`/v1/memberships/club/${clubId}/all`).then((res) => res.data)

export const getMembershipsByPlan = (planId: number): Promise<ApiResponse<UserMembership[]>> =>
  api.get(`/v1/memberships/plan/${planId}`).then((res) => res.data)

export interface ApproveMembershipRequest {
  amount: number
  method: 'CASH' | 'CARD' | 'POS' | 'BANK_TRANSFER'
  referenceNumber?: string
  notes?: string
}

export const approveMembership = (membershipId: number, request: ApproveMembershipRequest): Promise<ApiResponse<UserMembership>> =>
  api.post(`/v1/memberships/${membershipId}/approve`, request).then((res) => res.data)

export const rejectMembership = (membershipId: number, reason?: string): Promise<ApiResponse<void>> =>
  api.post(`/v1/memberships/${membershipId}/reject`, null, { params: { reason } }).then((res) => res.data)

export const suspendMembership = (membershipId: number): Promise<ApiResponse<void>> =>
  api.post(`/v1/memberships/${membershipId}/suspend`).then((res) => res.data)

export const cancelMembership = (membershipId: number): Promise<ApiResponse<void>> =>
  api.post(`/v1/memberships/${membershipId}/cancel`).then((res) => res.data)

// Attendance API
export const checkIn = (data: CheckInRequest): Promise<ApiResponse<Attendance>> =>
  api.post('/v1/attendance/check-in', data).then((res) => res.data)

export const getTodayAttendance = (clubId: number): Promise<ApiResponse<Attendance[]>> =>
  api.get(`/v1/attendance/club/${clubId}/today`).then((res) => res.data)

export const getAttendanceByDateRange = (
  clubId: number,
  startDate: string,
  endDate: string
): Promise<ApiResponse<Attendance[]>> =>
  api.get(`/v1/attendance/club/${clubId}?startDate=${startDate}&endDate=${endDate}`).then((res) => res.data)

export const getUserAttendance = (userId: number): Promise<ApiResponse<Attendance[]>> =>
  api.get(`/v1/attendance/user/${userId}`).then((res) => res.data)

export const getMyAttendance = (): Promise<ApiResponse<Attendance[]>> =>
  api.get('/v1/attendance/my').then((res) => res.data)

export const getSessionAttendance = (sessionId: number): Promise<ApiResponse<Attendance[]>> =>
  api.get(`/v1/attendance/session/${sessionId}`).then((res) => res.data)

export const getAttendanceCount = (membershipId: number): Promise<ApiResponse<number>> =>
  api.get(`/v1/attendance/membership/${membershipId}/count`).then((res) => res.data)
