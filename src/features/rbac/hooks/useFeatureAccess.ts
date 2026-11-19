import { useCallback, useMemo } from 'react'

import { canAccessFeature } from '../services/permissionAdapter'
import type { FeatureAccessKey } from '../types/features'
import { useOptionalRbacSession, useRbacSession } from './useRbacSession'

export function useFeatureAccess() {
  const { roleCode, session } = useRbacSession()

  const canAccess = useCallback(
    (feature: FeatureAccessKey) =>
      canAccessFeature(feature, roleCode, session.permissions),
    [roleCode, session.permissions],
  )

  return useMemo(
    () => ({
      canAccess,
      roleCode,
      employeeId: session.userId,
      displayName: session.displayName,
    }),
    [canAccess, roleCode, session.userId, session.displayName],
  )
}

/**
 * Safe outside RoleLayout. Every authenticated route (including legacy
 * /employees, /attendance, ...) now renders inside an RbacProvider, so without
 * a context there is no authenticated user and nothing is granted.
 */
export function useOptionalFeatureAccess() {
  const rbac = useOptionalRbacSession()

  const canAccess = useCallback(
    (feature: FeatureAccessKey) => {
      if (!rbac) return false
      return canAccessFeature(feature, rbac.roleCode, rbac.session.permissions)
    },
    [rbac],
  )

  return useMemo(
    () => ({
      canAccess,
      isRoleScoped: Boolean(rbac),
      roleCode: rbac?.roleCode ?? null,
      employeeId: rbac?.session.userId ?? null,
      displayName: rbac?.session.displayName ?? null,
    }),
    [canAccess, rbac],
  )
}
