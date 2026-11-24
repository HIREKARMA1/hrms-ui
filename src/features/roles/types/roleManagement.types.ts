export type RoleType = 'system' | 'custom'

export type RolePermissionId = string

export type ManagedRole = {
  id: string
  code: string
  name: string
  description: string
  type: RoleType
  isSystem: boolean
  permissionCount: number
  /** Known permission UUIDs from assign response cache (may be empty before assign). */
  permissionIds: RolePermissionId[]
}

export type PermissionItem = {
  id: RolePermissionId
  label: string
}

export type PermissionModule = {
  id: string
  label: string
  iconName: 'users' | 'calendar' | 'wallet' | 'clock' | 'briefcase' | 'shield'
  permissions: PermissionItem[]
}

export type RoleFormValues = {
  name: string
  description: string
  permissionIds: RolePermissionId[]
}

export type RoleTypeFilter = 'all' | RoleType
