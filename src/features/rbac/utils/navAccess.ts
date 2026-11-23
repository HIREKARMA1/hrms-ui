import type { RoleNavItem } from '../types/roles'

/** Every real navigation destination in a nav tree (section labels excluded). */
export function collectNavPaths(items: RoleNavItem[]): Set<string> {
  const paths = new Set<string>()
  for (const item of items) {
    paths.add(item.path)
    for (const child of item.children ?? []) {
      if (!child.isSectionLabel) paths.add(child.path)
    }
  }
  return paths
}

export type ModulePageAccess = 'allowed' | 'hidden' | 'unknown'

/**
 * Decides whether the catch-all placeholder page (`RoleModulePage`) may render
 * `pathname`:
 * - `allowed`: the path is a destination in the role's navigation and is still
 *   visible to this user after feature/permission filtering.
 * - `hidden`: it is in the role's navigation but filtered out for this user.
 * - `unknown`: it is not a destination of the role's navigation at all, so
 *   nothing authorises it. Denied (deny by default).
 */
export function getModulePageAccess(
  roleNavigation: RoleNavItem[],
  visibleNavigation: RoleNavItem[],
  pathname: string,
): ModulePageAccess {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (!collectNavPaths(roleNavigation).has(path)) return 'unknown'
  return collectNavPaths(visibleNavigation).has(path) ? 'allowed' : 'hidden'
}
