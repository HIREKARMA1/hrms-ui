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
 * Deny by default: when a permission is required and permissions are not
 * loaded (null) or empty, children are hidden. Omitting every requirement
 * means no permission is needed.
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
