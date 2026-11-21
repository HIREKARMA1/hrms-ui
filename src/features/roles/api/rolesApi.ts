/**
 * RTK Query endpoints for Role Management (production `/roles`).
 *
 * List is shared with User Management assignment pickers via the `Role` LIST
 * tag. Create/update/delete follow the deployed OpenAPI contract.
 */
import { baseApi } from '@/services/api/baseApi'
import { getApiErrorMessage } from '@/services/api/errors'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  BackendRole,
  CreateRoleBody,
  ListRolesArgs,
  RolesPage,
  UpdateRoleBody,
} from './rolesApi.types'

export const ROLES_PAGE_SIZE = 20
export const ROLES_MAX_LIMIT = 100

export const ROLES_LIST_TAG = { type: 'Role' as const, id: 'LIST' }

function clampLimit(limit: number | undefined) {
  return Math.min(Math.max(Math.trunc(limit ?? ROLES_PAGE_SIZE), 1), ROLES_MAX_LIMIT)
}

function clampPage(page: number | undefined) {
  return Math.max(Math.trunc(page ?? 1), 1)
}

function listParams(args: ListRolesArgs) {
  const params: Record<string, string | number | boolean> = {
    page: clampPage(args.page),
    limit: clampLimit(args.limit),
  }
  const search = args.search?.trim()
  if (search) params.search = search.slice(0, 120)
  if (args.isActive !== undefined) params.isActive = args.isActive
  if (args.isSystem !== undefined) params.isSystem = args.isSystem
  return params
}

function pageTags(page: RolesPage | undefined) {
  return [
    ROLES_LIST_TAG,
    ...(page?.items ?? []).map((item) => ({ type: 'Role' as const, id: item.id })),
  ]
}

/** Prefer Nest `message`; surface 409 conflicts safely. */
export function getRoleErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback)
}

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /roles (roles:read). */
    listRoles: build.query<RolesPage, ListRolesArgs | void>({
      query: (args = {}) => ({
        url: '/roles',
        params: listParams(args ?? {}),
      }),
      transformResponse: (response: ApiResponse<RolesPage>) => unwrapData(response),
      providesTags: (result) => pageTags(result),
    }),

    /**
     * POST /roles (roles:create). Always creates a non-system role.
     * Code must be UNIQUE UPPER_SNAKE_CASE (`^[A-Z][A-Z0-9_]{1,63}$`).
     */
    createRole: build.mutation<BackendRole, CreateRoleBody>({
      query: (body) => ({
        url: '/roles',
        method: 'POST',
        body: {
          code: body.code.trim().toUpperCase(),
          name: body.name.trim(),
          ...(body.description !== undefined
            ? { description: body.description.trim().slice(0, 500) }
            : {}),
          ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
        },
      }),
      transformResponse: (response: ApiResponse<BackendRole>) => unwrapData(response),
      invalidatesTags: [ROLES_LIST_TAG],
    }),

    /**
     * PATCH /roles/:id (roles:update). Cannot change code/isSystem.
     * System roles cannot be deactivated (server returns 400).
     */
    updateRole: build.mutation<BackendRole, { id: string; body: UpdateRoleBody }>({
      query: ({ id, body }) => ({
        url: `/roles/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<BackendRole>) => unwrapData(response),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Role', id }, ROLES_LIST_TAG],
    }),

    /**
     * DELETE /roles/:id (roles:delete). System roles and roles with user
     * assignments are protected (400 / 409).
     */
    deleteRole: build.mutation<{ id: string } | BackendRole | null, string>({
      query: (id) => ({
        url: `/roles/${encodeURIComponent(id)}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<BackendRole | { id: string } | null>) =>
        unwrapData(response),
      invalidatesTags: (_result, _error, id) => [{ type: 'Role', id }, ROLES_LIST_TAG],
    }),
  }),
})

export const {
  useListRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi
