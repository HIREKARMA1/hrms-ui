import type { RoleResponse } from '../api/rolesApi.types'
import type { ManagedRole, RolePermissionId } from '../types/roleManagement.types'

export function toManagedRole(
  role: RoleResponse,
  permissionIds: RolePermissionId[] = [],
): ManagedRole {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description ?? '',
    type: role.isSystem ? 'system' : 'custom',
    isSystem: role.isSystem,
    permissionCount: role.permissionCount,
    permissionIds,
  }
}

/** Backend role codes are UPPER_SNAKE_CASE, 2–64 chars. */
export function toRoleCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64)
    .replace(/_+$/g, '')
}
