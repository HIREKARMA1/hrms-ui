/**
 * Shapes from hrms-server `users.mapper` / DTOs (users.controller).
 * Passwords and token fields are never present on these responses.
 */

export type BackendUserRole = 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE'

export type BackendUserAssignedRole = {
  id: string
  code: string
  name: string
  isSystem: boolean
  isActive: boolean
}

export type BackendUserEmployeeSummary = {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  email: string
}

/** Public user payload returned by every users endpoint. */
export type BackendUser = {
  id: string
  email: string
  role: BackendUserRole
  isActive: boolean
  lastLoginAt: string | null
  employeeId: string | null
  createdAt: string
  updatedAt: string
  roles: BackendUserAssignedRole[]
  employee: BackendUserEmployeeSummary | null
}

export type UsersPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type UsersPage = {
  items: BackendUser[]
  pagination: UsersPagination
}

/** POST /users — role/isActive/passwordHash are server-controlled. */
export type CreateUserBody = {
  email: string
  password: string
  employeeId?: string
}

/** PATCH /users/:id — only email and employee link. */
export type UpdateUserBody = {
  email?: string
  employeeId?: string | null
}

export type ListUsersArgs = {
  page?: number
  limit?: number
  search?: string
  role?: BackendUserRole
  isActive?: boolean
  roleCode?: string
}

export type AssignUserRolesBody = {
  roleIds: string[]
}

/** @deprecated Prefer `@/features/roles/api/rolesApi.types` — kept for existing imports. */
export type { BackendRole as BackendRoleListItem, RolesPage } from '@/features/roles/api/rolesApi.types'
