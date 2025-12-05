import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ROLES } from './hooks/usePermission'
import { useAppDispatch, useAppSelector } from './hooks/redux'
import { fetchCurrentUser } from './store/slices/authSlice'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import ClubsPage from './pages/ClubsPage'
import ClubDetailsPage from './pages/ClubDetailsPage'
import ClassesPage from './pages/ClassesPage'
import ReservationsPage from './pages/ReservationsPage'
import ProfilePage from './pages/ProfilePage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminClubsPage from './pages/AdminClubsPage'
import AdminActivitiesPage from './pages/AdminActivitiesPage'
import AdminSchedulesPage from './pages/AdminSchedulesPage'
import AdminMembershipPlansPage from './pages/AdminMembershipPlansPage'
import StaffSessionsPage from './pages/StaffSessionsPage'
import StaffPaymentsPage from './pages/StaffPaymentsPage'
import StaffCheckInPage from './pages/StaffCheckInPage'
import UserMembershipsPage from './pages/UserMembershipsPage'
import PurchaseMembershipPage from './pages/PurchaseMembershipPage'

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Fetch user data if authenticated but user is not loaded
    if (isAuthenticated && !user) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch, isAuthenticated, user])

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

        {/* Clubs routes */}
        <Route
          path="/clubs"
          element={
            <ProtectedRoute>
              <ClubsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clubs/:id"
          element={
            <ProtectedRoute>
              <ClubDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Classes route */}
        <Route
          path="/classes"
          element={
            <ProtectedRoute>
              <ClassesPage />
            </ProtectedRoute>
          }
        />

        {/* Reservations route */}
        <Route
          path="/reservations"
          element={
            <ProtectedRoute>
              <ReservationsPage />
            </ProtectedRoute>
          }
        />

        {/* Profile route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Memberships routes */}
        <Route
          path="/memberships"
          element={
            <ProtectedRoute>
              <UserMembershipsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/memberships/purchase"
          element={
            <ProtectedRoute>
              <PurchaseMembershipPage />
            </ProtectedRoute>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clubs"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.GYM_OWNER]}>
              <AdminClubsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activities"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER]}>
              <AdminActivitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schedules"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER]}>
              <AdminSchedulesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/membership-plans"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER]}>
              <AdminMembershipPlansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.GYM_OWNER]}>
              <Navigate to="/admin/clubs" replace />
            </ProtectedRoute>
          }
        />

        {/* Staff-only routes */}
        <Route
          path="/staff/sessions"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER, ROLES.TRAINER]}>
              <StaffSessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/payments"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER, ROLES.RECEPTIONIST]}>
              <StaffPaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/checkin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER, ROLES.RECEPTIONIST]}>
              <StaffCheckInPage />
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
