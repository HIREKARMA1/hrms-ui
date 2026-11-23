import type { AuthUser } from '@/features/auth/types/auth.types'

import { getRoleUiConfig } from '../config/roleNavigation'
import type { BackendRoleCode } from '../types/roles'
import { getLandingRouteForRole, ROLE_ROUTE_MAP } from './roleRouteMap'
import { getHeldRoleCodes, getPrimaryRoleCode } from './userRoles'

export type WorkspaceOption = {
  roleCode: BackendRoleCode
  label: string
  /** Where selecting this workspace navigates (its landing route). */
  route: string
  isCurrent: boolean
}

/**
 * Workspaces the authenticated user may switch between: exactly the roles the
 * user actually holds (`role` plus `roles`), in landing-priority order.
 * Switching is navigation only. Each workspace route is still guarded by
 * RoleLayout, and permissions always come from the backend user, so listing
 * a workspace here grants nothing.
 */
export function getAvailableWorkspaces(
  user: AuthUser,
  currentRole: BackendRoleCode | null,
): WorkspaceOption[] {
  return getHeldRoleCodes(user).map((roleCode) => ({
    roleCode,
    label: getRoleUiConfig(roleCode).label,
    route: getLandingRouteForRole(roleCode),
    isCurrent: roleCode === currentRole,
  }))
}

/**
 * Workspace-scoped path for a module (`/{prefix}/{section}`) in the user's
 * primary workspace, or null if the user holds no supported role. Used by
 * legacy un-prefixed URLs. The destination route still enforces its own
 * feature guard, so this grants nothing.
 */
export function getWorkspaceModulePath(user: AuthUser, section: string): string | null {
  const roleCode = getPrimaryRoleCode(user)
  return roleCode ? `${ROLE_ROUTE_MAP[roleCode]}/${section}` : null
}

/** The switcher only appears for users who hold more than one workspace role. */
export function canSwitchWorkspaces(workspaces: readonly WorkspaceOption[]): boolean {
  return workspaces.length > 1
}
