import axios from 'axios'
import type { AppDispatch } from '../store'

const API_BASE_URL = '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Lazy store reference to break circular dependency
let storeInstance: { dispatch: AppDispatch } | null = null

export const setStoreInstance = (store: { dispatch: AppDispatch }) => {
  storeInstance = store
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, {
            refreshToken,
          })

          const { accessToken, refreshToken: newRefreshToken, user } = response.data.data
          
          // Use lazy import to avoid circular dependency
          if (storeInstance) {
            const { setCredentials } = await import('../store/slices/authSlice')
            storeInstance.dispatch(setCredentials({ 
              accessToken, 
              refreshToken: newRefreshToken, 
              user 
            }))
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

