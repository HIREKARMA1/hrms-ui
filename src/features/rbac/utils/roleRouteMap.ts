import type { BackendRoleCode } from '../types/roles'

/**
 * Configurable backend role code → workspace prefix mapping.
 * Backend codes must remain unchanged (production: SUPER_ADMIN, HR_ADMIN,
 * MANAGER, EMPLOYEE).
 */
export const ROLE_ROUTE_MAP: Record<BackendRoleCode, `/${string}`> = {
  SUPER_ADMIN: '/superadmin',
  HR_ADMIN: '/hradmin',
  MANAGER: '/manager',
  EMPLOYEE: '/employee',
}

/**
 * Post-login landing routes per backend role.
 */
export const ROLE_LANDING_MAP: Record<BackendRoleCode, `/${string}`> = {
  SUPER_ADMIN: '/superadmin/dashboard',
  HR_ADMIN: '/hradmin/dashboard',
  MANAGER: '/manager/dashboard',
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
 * Legacy UI / seed aliases that are not production UserRole codes today.
 * Production OpenAPI uses HR_ADMIN and MANAGER; these aliases only help if an
 * older payload still appears. They are never sent to the API as write values.
 */
const LEGACY_ROLE_ALIASES: Record<string, BackendRoleCode> = {
  ADMIN: 'MANAGER',
  HR: 'HR_ADMIN',
}

/** Map a raw role string from auth payloads to a supported workspace role. */
export function normalizeBackendRoleCode(value: unknown): BackendRoleCode | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const code = value.trim().toUpperCase()
  if ((ROLE_PRIORITY as readonly string[]).includes(code)) {
    return code as BackendRoleCode
  }
  return LEGACY_ROLE_ALIASES[code] ?? null
}

/**
 * Highest-priority supported role among the roles actually held
 * (`role` plus `roles`, the same union the backend RolesGuard uses).
 * Does not depend on the order of the API's `roles` array.
 */
export function getHighestPriorityRole(
  role: string | null | undefined,
  roles: readonly string[] = [],
): BackendRoleCode | null {
  const held = new Set<BackendRoleCode>()
  const primary = normalizeBackendRoleCode(role)
  if (primary) held.add(primary)
  for (const item of Array.isArray(roles) ? roles : []) {
    const normalized = normalizeBackendRoleCode(item)
    if (normalized) held.add(normalized)
  }
  return ROLE_PRIORITY.find((code) => held.has(code)) ?? null
}

export const ROUTE_ROLE_MAP: Record<string, BackendRoleCode> = {
  '/superadmin': 'SUPER_ADMIN',
  '/hradmin': 'HR_ADMIN',
  '/manager': 'MANAGER',
  '/employee': 'EMPLOYEE',
  // Legacy prefixes (redirect targets still resolve role for mid-navigation).
  '/admin': 'HR_ADMIN',
  '/hr': 'MANAGER',
}

export function getRouteForRole(roleCode: BackendRoleCode): string {
  return ROLE_ROUTE_MAP[roleCode]
}

export function getLandingRouteForRole(roleCode: BackendRoleCode): string {
  return ROLE_LANDING_MAP[roleCode]
}

export function getRoleFromPathname(pathname: string): BackendRoleCode | null {
  // Longest prefix first so `/hradmin` is not matched as `/hr`.
  const prefix = Object.keys(ROUTE_ROLE_MAP)
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname === route || pathname.startsWith(`${route}/`))
  return prefix ? ROUTE_ROLE_MAP[prefix] : null
}
