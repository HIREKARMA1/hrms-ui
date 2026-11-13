import type { BackendRoleCode } from '../types/roles'

/**
 * Configurable backend role code → workspace prefix mapping.
 * Backend codes must remain unchanged.
 */
export const ROLE_ROUTE_MAP: Record<BackendRoleCode, `/${string}`> = {
  SUPER_ADMIN: '/superadmin',
  HR_ADMIN: '/admin',
  MANAGER: '/hr',
  EMPLOYEE: '/employee',
}

/**
 * Post-login landing routes per backend role.
 * HR uses the existing shared DashboardPage at /hr/dashboard.
 */
export const ROLE_LANDING_MAP: Record<BackendRoleCode, `/${string}`> = {
  SUPER_ADMIN: '/superadmin/dashboard',
  HR_ADMIN: '/admin/dashboard',
  MANAGER: '/hr/dashboard',
  EMPLOYEE: '/employee/dashboard',
}

export const ROUTE_ROLE_MAP: Record<string, BackendRoleCode> = {
  '/superadmin': 'SUPER_ADMIN',
  '/admin': 'HR_ADMIN',
  '/hr': 'MANAGER',
  '/employee': 'EMPLOYEE',
}

export function getRouteForRole(roleCode: BackendRoleCode): string {
  return ROLE_ROUTE_MAP[roleCode]
}

export function getLandingRouteForRole(roleCode: BackendRoleCode): string {
  return ROLE_LANDING_MAP[roleCode]
}

export function getRoleFromPathname(pathname: string): BackendRoleCode | null {
  const prefix = Object.keys(ROUTE_ROLE_MAP).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
  return prefix ? ROUTE_ROLE_MAP[prefix] : null
}
