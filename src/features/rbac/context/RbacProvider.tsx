import { useMemo, type ReactNode } from 'react'

import { getRoleUiConfig } from '../config/roleNavigation'
import { mockSessionsByRole } from '../mocks/rbacMocks'
import { canAccessFeature } from '../services/permissionAdapter'
import type { BackendRoleCode, RoleNavItem } from '../types/roles'
import { hasPermission } from '../utils/permissions'
import { RbacContext } from './rbacContext'

type RbacProviderProps = {
  roleCode: BackendRoleCode
  children: ReactNode
}

function filterNavigation(
  items: RoleNavItem[],
  roleCode: BackendRoleCode,
  permissions: string[] | null,
): RoleNavItem[] {
  return items
    .filter((item) => {
      if (item.permission && !hasPermission(permissions, item.permission)) {
        return false
      }
      if (item.feature && !canAccessFeature(item.feature, roleCode, permissions)) {
        return false
      }
      return true
    })
    .flatMap((item) => {
      const hadChildren = Boolean(item.children?.length)
      const children = item.children?.filter((child) => {
        if (child.permission && !hasPermission(permissions, child.permission)) {
          return false
        }
        if (
          child.feature &&
          !canAccessFeature(child.feature, roleCode, permissions)
        ) {
          return false
        }
        return true
      })
      if (hadChildren && (!children || children.length === 0)) {
        return []
      }
      const next: RoleNavItem = {
        ...item,
        children: children?.length ? children : undefined,
      }
      return [next]
    })
}

export function RbacProvider({ roleCode, children }: RbacProviderProps) {
  const value = useMemo(() => {
    const session = mockSessionsByRole[roleCode]
    const config = getRoleUiConfig(roleCode)
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
  }, [roleCode])

  return <RbacContext.Provider value={value}>{children}</RbacContext.Provider>
}
