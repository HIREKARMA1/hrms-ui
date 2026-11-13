import type { PermissionCode } from '../types/roles'

/**
 * Permission checks for UI gating only.
 * Backend authorization remains mandatory for all mutations.
 */
export function hasPermission(
  permissions: PermissionCode[] | null | undefined,
  required?: PermissionCode,
): boolean {
  if (!required) return true
  // Permissions not loaded yet — do not invent codes; fall back to role menus.
  if (permissions == null) return true
  return permissions.includes(required)
}

export function hasAnyPermission(
  permissions: PermissionCode[] | null | undefined,
  required?: PermissionCode[],
): boolean {
  if (!required || required.length === 0) return true
  if (permissions == null) return true
  return required.some((code) => permissions.includes(code))
}

export function hasAllPermissions(
  permissions: PermissionCode[] | null | undefined,
  required?: PermissionCode[],
): boolean {
  if (!required || required.length === 0) return true
  if (permissions == null) return true
  return required.every((code) => permissions.includes(code))
}
