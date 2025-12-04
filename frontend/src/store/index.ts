import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import { setStoreInstance } from '../api/client'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

// Set store instance for API client to avoid circular dependency
setStoreInstance(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

