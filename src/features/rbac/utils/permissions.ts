import type { PermissionCode } from '../types/roles'

/**
 * Permission checks for UI gating only.
 * Backend authorization remains mandatory for all mutations.
 *
 * Deny by default (matches the server's PermissionPolicy): when a permission
 * is required, null/undefined/empty permissions never grant it. Omitting the
 * requirement means "no permission needed".
 */
export function hasPermission(
  permissions: PermissionCode[] | null | undefined,
  required?: PermissionCode,
): boolean {
  if (!required) return true
  return permissions?.includes(required) ?? false
}

export function hasAnyPermission(
  permissions: PermissionCode[] | null | undefined,
  required?: PermissionCode[],
): boolean {
  if (!required || required.length === 0) return true
  if (!permissions) return false
  return required.some((code) => permissions.includes(code))
}

export function hasAllPermissions(
  permissions: PermissionCode[] | null | undefined,
  required?: PermissionCode[],
): boolean {
  if (!required || required.length === 0) return true
  if (!permissions) return false
  return required.every((code) => permissions.includes(code))
}
