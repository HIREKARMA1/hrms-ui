/** Types aligned with hrms-server roles / permissions response mappers. */

export type RoleResponse = {
  id: string
  code: string
  name: string
  description: string | null
  isSystem: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  userCount: number
  permissionCount: number
}

export type RolesPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type RolesListData = {
  items: RoleResponse[]
  pagination: RolesPagination
}

export type ListRolesParams = {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  isSystem?: boolean
}

export type CreateRoleBody = {
  code: string
  name: string
  description?: string
  isActive?: boolean
}

export type UpdateRoleBody = {
  name?: string
  description?: string | null
  isActive?: boolean
}

export type RolePermissionItem = {
  id: string
  code: string
  module: string
  description: string | null
}

export type RoleWithPermissionsResponse = RoleResponse & {
  permissions: RolePermissionItem[]
}

export type AssignRolePermissionsBody = {
  permissionIds: string[]
}

export type PermissionResponse = {
  id: string
  code: string
  module: string
  description: string | null
  createdAt: string
  updatedAt: string
  roleCount: number
}

export type PermissionsListData = {
  items: PermissionResponse[]
  pagination: RolesPagination
}
