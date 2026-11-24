import type { AuthUser } from '@/features/auth/types/auth.types'
import { getLandingRouteForUserRole } from '@/features/auth/utils/landingRoute'

import type { BackendRoleCode } from '../types/roles'
import {
  ROLE_PRIORITY,
  getHighestPriorityRole,
  normalizeBackendRoleCode,
} from './roleRouteMap'

export function isBackendRoleCode(value: unknown): value is BackendRoleCode {
  return (
    typeof value === 'string' &&
    (ROLE_PRIORITY as readonly string[]).includes(value)
  )
}

/**
 * Roles the user actually holds: the legacy `role` plus dynamic `roles`
 * (same union the server's RolesGuard uses), limited to UI-supported codes,
 * in landing-priority order (never the API array order).
 */
export function getHeldRoleCodes(user: AuthUser): BackendRoleCode[] {
  const held = new Set<BackendRoleCode>()
  for (const raw of [user.role, ...user.roles]) {
    const code = normalizeBackendRoleCode(raw)
    if (code) held.add(code)
  }
  return ROLE_PRIORITY.filter((code) => held.has(code))
}

/** Workspace authorization: true only if the user actually holds the role. */
export function userHoldsRole(user: AuthUser, roleCode: BackendRoleCode): boolean {
  return getHeldRoleCodes(user).includes(roleCode)
}

/**
 * Landing/primary workspace role: the highest-priority role the user holds
 * (SUPER_ADMIN > HR_ADMIN > MANAGER > EMPLOYEE). Real accounts keep the
 * legacy `role` as EMPLOYEE even when HR_ADMIN or MANAGER is assigned, so the
 * legacy field alone cannot decide this. Priority only chooses the landing
 * workspace; it never grants access or permissions.
 */
export function getPrimaryRoleCode(user: AuthUser): BackendRoleCode | null {
  return getHighestPriorityRole(user.role, user.roles)
}

/** The user's own landing route, by the same priority as post-login. */
export function getUserLandingRoute(user: AuthUser): string | null {
  return getLandingRouteForUserRole(user.role, user.roles)
}
