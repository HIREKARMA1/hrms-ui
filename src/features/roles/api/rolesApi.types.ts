/** Types aligned with hrms-server roles / permissions response mappers. */

export type RoleResponse = {
/**
 * Role Management shapes from production OpenAPI (`/api/v1/roles`).
 * Passwords and tokens are never present on these responses.
 */

export type BackendRole = {
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
export type RolesPage = {
  items: BackendRole[]
  pagination: RolesPagination
}

export type ListRolesArgs = {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  isSystem?: boolean
}

/** POST /roles — `isSystem` is always false on the server. */
export type CreateRoleBody = {
  code: string
  name: string
  description?: string
  isActive?: boolean
}

/** PATCH /roles/:id — `code` and `isSystem` are immutable. */
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
