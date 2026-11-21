/**
 * RTK Query endpoints for User Management (hrms-server `/users` + role list).
 *
 * Create always starts as EMPLOYEE; Admin/HR elevation uses POST /users/:id/roles
 * (`users:assign_roles`) after create. Passwords are never kept in the store
 * (`track: false` on create).
 */
import { baseApi } from '@/services/api/baseApi'
import { getApiErrorMessage } from '@/services/api/errors'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  AssignUserRolesBody,
  BackendUser,
  CreateUserBody,
  ListUsersArgs,
  UpdateUserBody,
  UsersPage,
} from './usersApi.types'

export const USERS_PAGE_SIZE = 20
export const USERS_MAX_LIMIT = 100

const LIST_TAG = { type: 'User' as const, id: 'LIST' }

function clampLimit(limit: number | undefined) {
  return Math.min(Math.max(Math.trunc(limit ?? USERS_PAGE_SIZE), 1), USERS_MAX_LIMIT)
}

function clampPage(page: number | undefined) {
  return Math.max(Math.trunc(page ?? 1), 1)
}

function listParams(args: ListUsersArgs) {
  const params: Record<string, string | number | boolean> = {
    page: clampPage(args.page),
    limit: clampLimit(args.limit),
  }
  const search = args.search?.trim()
  if (search) params.search = search
  if (args.role) params.role = args.role
  if (args.isActive !== undefined) params.isActive = args.isActive
  const roleCode = args.roleCode?.trim().toUpperCase()
  if (roleCode) params.roleCode = roleCode
  return params
}

function pageTags(page: UsersPage | undefined) {
  return [
    LIST_TAG,
    ...(page?.items ?? []).map((item) => ({ type: 'User' as const, id: item.id })),
  ]
}

const CONFLICT_FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  employeeId: 'Employee link',
}

/** Prefer Nest `message`, then name conflict fields from a 409 body. */
export function getUserErrorMessage(error: unknown, fallback: string): string {
  const message = getApiErrorMessage(error, fallback)
  if (typeof error !== 'object' || error === null || !('status' in error)) return message
  const { status, data } = error as { status: unknown; data?: { conflicts?: unknown; message?: unknown } }
  if (status === 409 && Array.isArray(data?.conflicts) && data.conflicts.length > 0) {
    const fields = data.conflicts
      .filter((field): field is string => typeof field === 'string')
      .map((field) => CONFLICT_FIELD_LABELS[field] ?? field)
    if (fields.length) return `${message}: ${fields.join(', ')}.`
  }
  return message
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /users (users:read). */
    listUsers: build.query<UsersPage, ListUsersArgs | void>({
      query: (args = {}) => ({
        url: '/users',
        params: listParams(args ?? {}),
      }),
      transformResponse: (response: ApiResponse<UsersPage>) => unwrapData(response),
      providesTags: (result) => pageTags(result),
    }),

    /** GET /users/:id (users:read). */
    getUser: build.query<BackendUser, string>({
      query: (id) => `/users/${encodeURIComponent(id)}`,
      transformResponse: (response: ApiResponse<BackendUser>) => unwrapData(response),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    /**
     * POST /users (users:create). Always creates an active EMPLOYEE; role is
     * not accepted on this endpoint.
     */
    createUser: build.mutation<BackendUser, CreateUserBody>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body: {
          email: body.email.trim(),
          password: body.password,
          ...(body.employeeId?.trim() ? { employeeId: body.employeeId.trim() } : {}),
        },
      }),
      transformResponse: (response: ApiResponse<BackendUser>) => unwrapData(response),
      invalidatesTags: [LIST_TAG],
    }),

    /** PATCH /users/:id (users:update) — email and/or employeeId only. */
    updateUser: build.mutation<BackendUser, { id: string; body: UpdateUserBody }>({
      query: ({ id, body }) => ({
        url: `/users/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<BackendUser>) => unwrapData(response),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }, LIST_TAG],
    }),

    /**
     * PATCH /users/:id/deactivate (users:deactivate). Soft-deactivates and
     * revokes refresh tokens; idempotent when already inactive.
     */
    deactivateUser: build.mutation<BackendUser, string>({
      query: (id) => ({
        url: `/users/${encodeURIComponent(id)}/deactivate`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<BackendUser>) => unwrapData(response),
      invalidatesTags: (_result, _error, id) => [{ type: 'User', id }, LIST_TAG],
    }),

    /**
     * POST /users/:id/roles (users:assign_roles). Additive; cannot self-assign.
     * SUPER_ADMIN assignment is blocked unless the actor is SUPER_ADMIN.
     */
    assignUserRoles: build.mutation<BackendUser, { id: string; body: AssignUserRolesBody }>({
      query: ({ id, body }) => ({
        url: `/users/${encodeURIComponent(id)}/roles`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<BackendUser>) => unwrapData(response),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }, LIST_TAG],
    }),

    /**
     * DELETE /users/:id/roles/:roleId (users:assign_roles). SUPER_ADMIN removal
     * is blocked unless the actor is SUPER_ADMIN and another active SUPER_ADMIN
     * remains (server-enforced).
     */
    removeUserRole: build.mutation<BackendUser, { id: string; roleId: string }>({
      query: ({ id, roleId }) => ({
        url: `/users/${encodeURIComponent(id)}/roles/${encodeURIComponent(roleId)}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<BackendUser>) => unwrapData(response),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }, LIST_TAG],
    }),

  }),
})

export const {
  useListUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
  useAssignUserRolesMutation,
  useRemoveUserRoleMutation,
} = usersApi

export type { BackendUser, ListUsersArgs, CreateUserBody, UpdateUserBody }
