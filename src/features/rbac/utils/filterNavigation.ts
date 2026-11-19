import { canAccessFeature } from '../services/permissionAdapter'
import type { BackendRoleCode, RoleNavItem } from '../types/roles'
import { hasPermission } from './permissions'

function isVisible(
  entry: { permission?: string; feature?: RoleNavItem['feature'] },
  roleCode: BackendRoleCode,
  permissions: string[] | null,
): boolean {
  if (entry.permission && !hasPermission(permissions, entry.permission)) {
    return false
  }
  if (entry.feature && !canAccessFeature(entry.feature, roleCode, permissions)) {
    return false
  }
  return true
}

/**
 * Sidebar filtering. Uses the same `canAccessFeature` rule as direct-URL
 * guards (`RequireAccess`) and in-page gates, so the sidebar and the URL can
 * never disagree. A parent whose children are all hidden is removed.
 */
export function filterNavigation(
  items: RoleNavItem[],
  roleCode: BackendRoleCode,
  permissions: string[] | null,
): RoleNavItem[] {
  return items
    .filter((item) => isVisible(item, roleCode, permissions))
    .flatMap((item) => {
      const hadChildren = Boolean(item.children?.length)
      const children = item.children?.filter((child) =>
        isVisible(child, roleCode, permissions),
      )
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
