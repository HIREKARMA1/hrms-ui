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

/**
 * Landing priority, highest first. Used ONLY to choose which workspace a user
 * lands in. It never grants access: a workspace is allowed only if the user
 * actually holds its role, and permissions come solely from the backend.
 */
export const ROLE_PRIORITY: readonly BackendRoleCode[] = [
  'SUPER_ADMIN',
  'HR_ADMIN',
  'MANAGER',
  'EMPLOYEE',
]

/**
 * Highest-priority supported role among the roles actually held
 * (`role` plus `roles`, the same union the backend RolesGuard uses).
 * Does not depend on the order of the API's `roles` array.
 */
export function getHighestPriorityRole(
  role: string | null | undefined,
  roles: readonly string[] = [],
): BackendRoleCode | null {
  const held = new Set<string>(Array.isArray(roles) ? roles : [])
  if (role) held.add(role)
  return ROLE_PRIORITY.find((code) => held.has(code)) ?? null
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
