import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../hooks/redux'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** If specified, user must have at least one of these roles */
  allowedRoles?: string[]
  /** If true, redirects authenticated users (useful for login pages) */
  guestOnly?: boolean
}

/**
 * A route guard component that handles:
 * - Authentication checks (redirects unauthenticated users to login)
 * - Role-based access control (redirects users without required roles to unauthorized page)
 * - Guest-only routes (redirects authenticated users away from login/signup)
 */
export function ProtectedRoute({ children, allowedRoles, guestOnly = false }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  // Guest-only routes (login, signup)
  if (guestOnly) {
    if (isAuthenticated) {
      return <Navigate to="/" replace />
    }
    return <>{children}</>
  }

  // Protected routes - require authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role-based access control
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user?.roles || []
    const hasRequiredRole = allowedRoles.some((role) => userRoles.includes(role))

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute

