import { apiClient } from './client'

interface LoginRequest {
  phoneNumber: string
}

interface SignupRequest {
  phoneNumber: string
  firstName?: string
  lastName?: string
}

interface VerifyOtpRequest {
  phoneNumber: string
  code: string
}

interface OtpResponse {
  phoneNumber: string
  expiresInSeconds: number
  message: string
}

interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: {
    id: number
    phoneNumber: string
    email?: string
    firstName?: string
    lastName?: string
    fullName?: string
    roles: string[]
  }
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<OtpResponse>>('/v1/auth/login', data),

  signup: (data: SignupRequest) =>
    apiClient.post<ApiResponse<OtpResponse>>('/v1/auth/signup', data),

  verifyOtp: (data: VerifyOtpRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/v1/auth/verify-otp', data),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/v1/auth/refresh', { refreshToken }),

  logout: () => apiClient.post('/v1/auth/logout'),

  me: () => apiClient.get('/v1/auth/me'),
}

