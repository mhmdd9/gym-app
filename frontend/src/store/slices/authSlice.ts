import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authApi } from '../../api/auth'

interface User {
  id: number
  phoneNumber: string
  email?: string
  firstName?: string
  lastName?: string
  fullName?: string
  roles: string[]
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  otpSent: boolean
  otpPhoneNumber: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
  otpSent: false,
  otpPhoneNumber: null,
}

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (phoneNumber: string, { rejectWithValue }) => {
    try {
      const response = await authApi.login({ phoneNumber })
      return { phoneNumber, ...response.data.data } // Extract nested data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP')
    }
  }
)

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ phoneNumber, code }: { phoneNumber: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOtp({ phoneNumber, code })
      return response.data.data // Extract the nested auth data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Invalid OTP')
    }
  }
)

export const signup = createAsyncThunk(
  'auth/signup',
  async (data: { phoneNumber: string; firstName?: string; lastName?: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.signup(data)
      return { phoneNumber: data.phoneNumber, ...response.data.data } // Extract nested data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Signup failed')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.me()
      return response.data.data
    } catch (error: any) {
      // If fetching user fails (e.g., token expired), clear auth state
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user')
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout()
  } catch (error) {
    // Ignore errors on logout
  }
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetOtpState: (state) => {
      state.otpSent = false
      state.otpPhoneNumber = null
    },
    setCredentials: (state, action: PayloadAction<{ accessToken: string; refreshToken: string; user: User }>) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user
      state.isAuthenticated = true
      localStorage.setItem('accessToken', action.payload.accessToken)
      localStorage.setItem('refreshToken', action.payload.refreshToken)
    },
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.isLoading = false
        state.otpSent = true
        state.otpPhoneNumber = action.payload.phoneNumber
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.user = action.payload.user
        state.otpSent = false
        state.otpPhoneNumber = null
        localStorage.setItem('accessToken', action.payload.accessToken)
        localStorage.setItem('refreshToken', action.payload.refreshToken)
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false
        state.otpSent = true
        state.otpPhoneNumber = action.payload.phoneNumber
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.isAuthenticated = false
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.isAuthenticated = false
      })
  },
})

export const { clearError, resetOtpState, setCredentials } = authSlice.actions
export default authSlice.reducer

