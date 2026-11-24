import { getRoleFromPathname } from '@/features/rbac/utils/roleRouteMap'
import { userHoldsRole } from '@/features/rbac/utils/userRoles'

import type { AuthUser } from '../types/auth.types'
import { isPublicPath } from './sessionRedirect'

/**
 * The protected URL a signed-out user originally requested (set by
 * RequireAuth in router state), if it is safe to return to after login:
 * an in-app path, not a public route, and - for a role workspace - one the
 * user actually holds. Otherwise null (use the landing route).
 */
export function getSafeReturnPath(
  routerState: unknown,
  user: AuthUser | null,
): string | null {
  if (!user || typeof routerState !== 'object' || routerState === null) {
    return null
  }
  const from = (routerState as { from?: unknown }).from
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) {
    return null
  }

  const pathname = from.split(/[?#]/)[0] ?? ''
  if (isPublicPath(pathname)) return null

  const workspaceRole = getRoleFromPathname(pathname)
  if (workspaceRole && !userHoldsRole(user, workspaceRole)) return null

  return from
}
