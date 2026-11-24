/**
 * Permission catalogue shapes for production `GET /permissions`.
 *
 * OpenAPI: Permission has no `name` field. Search matches `code` and
 * `description`. Filter by `module`. Response includes a role usage count
 * (exposed as `roleCount`, parallel to `userCount` / `permissionCount` on roles).
 */

export type BackendPermission = {
  id: string
  code: string
  module: string
  description: string | null
  createdAt: string
  updatedAt: string
  roleCount: number
}

/** Alias used by permission management mappers. */
export type PermissionResponse = BackendPermission

export type PermissionsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type PermissionsPage = {
  items: BackendPermission[]
  pagination: PermissionsPagination
}

export type ListPermissionsArgs = {
  page?: number
  limit?: number
  /** Matches code and description (max 120). */
  search?: string
  /** Exact module filter (max 64). */
  module?: string
}
