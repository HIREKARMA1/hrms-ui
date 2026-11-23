import { useCallback, useMemo } from 'react'

import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from '../utils/permissions'
import { useRbacSession } from './useRbacSession'

export function usePermissions() {
  const { session } = useRbacSession()
  const permissions = session.permissions

  const can = useCallback(
    (permission?: string) => hasPermission(permissions, permission),
    [permissions],
  )

  const canAny = useCallback(
    (required?: string[]) => hasAnyPermission(permissions, required),
    [permissions],
  )

  const canAll = useCallback(
    (required?: string[]) => hasAllPermissions(permissions, required),
    [permissions],
  )

  return useMemo(
    () => ({
      permissions,
      can,
      canAny,
      canAll,
      permissionsLoaded: permissions != null,
    }),
    [permissions, can, canAny, canAll],
  )
}
