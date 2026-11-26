import type { PermissionResponse } from '../api/permissionsApi.types'
import type { ManagedPermission } from '../types/permissionManagement.types'

export function toManagedPermission(
  permission: PermissionResponse,
): ManagedPermission {
  return {
    id: permission.id,
    code: permission.code,
    module: permission.module,
    description: permission.description,
    roleCount: permission.roleCount,
    relatedRoles: permission.relatedRoles ?? [],
    createdAt:
      typeof permission.createdAt === 'string'
        ? permission.createdAt
        : String(permission.createdAt),
    updatedAt:
      typeof permission.updatedAt === 'string'
        ? permission.updatedAt
        : String(permission.updatedAt),
  }
}

export function getPermissionModules(
  permissions: Array<Pick<ManagedPermission, 'module'>>,
): string[] {
  return [...new Set(permissions.map((item) => item.module))].sort((a, b) =>
    a.localeCompare(b),
  )
}
