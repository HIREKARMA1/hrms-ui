import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'

import { RbacProvider } from '../context/RbacProvider'
import type { BackendRoleCode } from '../types/roles'
import {
  getPrimaryRoleCode,
  getUserLandingRoute,
  userHoldsRole,
} from '../utils/userRoles'
import { AccessDeniedPage } from './AccessDeniedPage'

type RoleLayoutProps = {
  /**
   * Workspace role for this route group. Omit for shared/legacy routes: the
   * authenticated user's own primary role is used.
   */
  roleCode?: BackendRoleCode
}

/**
 * Reuses the existing MainLayout (sidebar + header) while injecting role context.
 *
 * Must render inside RequireAuth. The URL only names the workspace; access is
 * granted only when the authenticated user actually holds that role
 * (`user.role` or `user.roles`). Otherwise no workspace content is rendered.
 */
export function RoleLayout({ roleCode }: RoleLayoutProps) {
  const { user } = useAuthenticatedUser()
  if (!user) return null

  const workspaceRole = roleCode ?? getPrimaryRoleCode(user)
  if (!workspaceRole || !userHoldsRole(user, workspaceRole)) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-app-bg px-4">
        <AccessDeniedPage
          featureLabel="this workspace"
          homeHref={getUserLandingRoute(user) ?? '/'}
        />
      </div>
    )
  }

  return (
    <RbacProvider roleCode={workspaceRole}>
      <MainLayout />
    </RbacProvider>
  )
}
