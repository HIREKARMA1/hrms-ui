import {
  ROLE_LANDING_MAP,
  getHighestPriorityRole,
} from '@/features/rbac/utils/roleRouteMap'

/**
 * Post-login route for the roles a user holds, or null if none is supported
 * by the UI. Pass the legacy `role` and the dynamic `roles`; the landing
 * workspace is the highest-priority held role
 * (SUPER_ADMIN > HR_ADMIN > MANAGER > EMPLOYEE). This only picks where the
 * user lands; it does not grant any access.
 */
export function getLandingRouteForUserRole(
  role: string,
  roles: readonly string[] = [],
): string | null {
  const landingRole = getHighestPriorityRole(role, roles)
  return landingRole ? ROLE_LANDING_MAP[landingRole] : null
}
