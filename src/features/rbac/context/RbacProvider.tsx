import { useMemo, type ReactNode } from 'react'

import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import { getUserDisplayName } from '@/features/auth/utils/authUser'

import { getRoleUiConfig } from '../config/roleNavigation'
import type { AuthSession, BackendRoleCode } from '../types/roles'
import { filterNavigation } from '../utils/filterNavigation'
import { RbacContext, type RbacContextValue } from './rbacContext'

type RbacProviderProps = {
  roleCode: BackendRoleCode
  children: ReactNode
}

/**
 * RBAC context for the authenticated user. `roleCode` must be a role the user
 * actually holds (enforced by RoleLayout); identity and permissions always
 * come from the Redux auth user, never from mocks.
 */
export function RbacProvider({ roleCode, children }: RbacProviderProps) {
  const { user } = useAuthenticatedUser()

  const value = useMemo((): RbacContextValue | null => {
    if (!user) return null
    const config = getRoleUiConfig(roleCode)
    const session: AuthSession = {
      userId: user.id,
      displayName: getUserDisplayName(user),
      email: user.email,
      roleCode,
      roleName: config.label,
      permissions: user.permissions,
    }
    const navigation = filterNavigation(
      config.navigation,
      roleCode,
      session.permissions,
    )

    return {
      session,
      roleCode,
      navigation,
      routePrefix: config.routePrefix,
      roleLabel: config.label,
    }
  }, [roleCode, user])

  // Signed out mid-render: render nothing rather than a session-less context.
  if (!value) return null

  return <RbacContext.Provider value={value}>{children}</RbacContext.Provider>
}
