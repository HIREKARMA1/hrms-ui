import type { ReactNode } from 'react'

import { usePermissions } from '../hooks/usePermissions'

type CanProps = {
  permission?: string
  anyOf?: string[]
  allOf?: string[]
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Hides UI when the current session permissions do not allow the action.
 * If permissions are not loaded (null), children remain visible (role menus apply).
 */
export function Can({
  permission,
  anyOf,
  allOf,
  children,
  fallback = null,
}: CanProps) {
  const { can, canAny, canAll } = usePermissions()

  const allowed =
    can(permission) && canAny(anyOf) && canAll(allOf)

  if (!allowed) return <>{fallback}</>
  return <>{children}</>
}
