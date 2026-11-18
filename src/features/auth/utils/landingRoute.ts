import {
  ROLE_LANDING_MAP,
} from '@/features/rbac/utils/roleRouteMap'
import type { BackendRoleCode } from '@/features/rbac/types/roles'

/** Post-login route for a backend role code, or null if the role is not supported by the UI. */
export function getLandingRouteForUserRole(role: string): string | null {
  return Object.prototype.hasOwnProperty.call(ROLE_LANDING_MAP, role)
    ? ROLE_LANDING_MAP[role as BackendRoleCode]
    : null
}
