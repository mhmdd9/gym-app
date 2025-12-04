import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ROLES } from './hooks/usePermission'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import UnauthorizedPage from './pages/UnauthorizedPage'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Routes>
        {/* Guest-only routes */}
        <Route
          path="/login"
          element={
            <ProtectedRoute guestOnly>
              <LoginPage />
            </ProtectedRoute>
          }
        />

        {/* Public routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected routes - any authenticated user */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Admin-only routes (example for future) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.GYM_OWNER]}>
              {/* TODO: Add admin dashboard component */}
              <div className="text-white p-8">Admin Dashboard (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* Staff-only routes (example for future) */}
        <Route
          path="/staff/*"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER, ROLES.RECEPTIONIST]}>
              {/* TODO: Add staff dashboard component */}
              <div className="text-white p-8">Staff Dashboard (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App

