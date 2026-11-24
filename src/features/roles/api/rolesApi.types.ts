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
  userCount: number
  permissionCount: number
}

export type RolesPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

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
