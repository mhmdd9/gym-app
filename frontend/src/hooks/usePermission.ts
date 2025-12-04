import { useMemo } from 'react'
import { useAppSelector } from './redux'

/** Role constants matching backend Role entity */
export const ROLES = {
  ADMIN: 'ADMIN',
  GYM_OWNER: 'GYM_OWNER',
  MANAGER: 'MANAGER',
  RECEPTIONIST: 'RECEPTIONIST',
  TRAINER: 'TRAINER',
  MEMBER: 'MEMBER',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

/** Staff roles that have elevated permissions */
export const STAFF_ROLES: Role[] = [ROLES.ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER, ROLES.RECEPTIONIST, ROLES.TRAINER]

/** Admin roles that can manage clubs and sessions */
export const ADMIN_ROLES: Role[] = [ROLES.ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER]

interface UsePermissionReturn {
  /** User's roles */
  roles: string[]
  /** Check if user has any of the specified roles */
  hasRole: (...roles: string[]) => boolean
  /** Check if user has all of the specified roles */
  hasAllRoles: (...roles: string[]) => boolean
  /** Check if user is any staff member */
  isStaff: boolean
  /** Check if user is admin or gym owner */
  isAdmin: boolean
  /** Check if user can manage clubs (create/update/delete) */
  canManageClubs: boolean
  /** Check if user can manage class sessions */
  canManageSessions: boolean
  /** Check if user can record payments */
  canRecordPayments: boolean
  /** Check if user can check-in reservations */
  canCheckIn: boolean
  /** Check if user can view all club reservations */
  canViewClubReservations: boolean
}

/**
 * Custom hook for checking user permissions and roles.
 * Provides convenient methods for role-based UI rendering.
 *
 * @example
 * ```tsx
 * const { canManageClubs, hasRole } = usePermission()
 *
 * return (
 *   <>
 *     {canManageClubs && <CreateClubButton />}
 *     {hasRole('TRAINER') && <TrainerDashboard />}
 *   </>
 * )
 * ```
 */
export function usePermission(): UsePermissionReturn {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  return useMemo(() => {
    const roles = user?.roles || []

    const hasRole = (...checkRoles: string[]): boolean => {
      if (!isAuthenticated) return false
      return checkRoles.some((role) => roles.includes(role))
    }

    const hasAllRoles = (...checkRoles: string[]): boolean => {
      if (!isAuthenticated) return false
      return checkRoles.every((role) => roles.includes(role))
    }

    const isStaff = hasRole(...STAFF_ROLES)
    const isAdmin = hasRole(ROLES.ADMIN, ROLES.GYM_OWNER)

    return {
      roles,
      hasRole,
      hasAllRoles,
      isStaff,
      isAdmin,
      canManageClubs: hasRole(ROLES.ADMIN, ROLES.GYM_OWNER),
      canManageSessions: hasRole(ROLES.ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER, ROLES.TRAINER),
      canRecordPayments: hasRole(ROLES.ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER, ROLES.RECEPTIONIST),
      canCheckIn: hasRole(ROLES.ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER, ROLES.RECEPTIONIST),
      canViewClubReservations: hasRole(ROLES.ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER, ROLES.RECEPTIONIST),
    }
  }, [user, isAuthenticated])
}

export default usePermission

