import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  AssignRolePermissionsBody,
  CreateRoleBody,
  ListRolesParams,
  RoleResponse,
  RolesListData,
  RoleWithPermissionsResponse,
  UpdateRoleBody,
} from './rolesApi.types'

const ROLE_LIST_TAG = { type: 'Role' as const, id: 'LIST' }

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /roles — paginated role list (`roles:read`). */
    listRoles: build.query<RolesListData, ListRolesParams | void>({
      query: (params) => ({
        url: '/roles',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.isActive !== undefined ? { isActive: params.isActive } : {}),
          ...(params?.isSystem !== undefined ? { isSystem: params.isSystem } : {}),
        },
      }),
      transformResponse: (response: ApiResponse<RolesListData>) =>
        unwrapData(response),
      providesTags: (result) =>
        result
          ? [
              ROLE_LIST_TAG,
              ...result.items.map((role) => ({
                type: 'Role' as const,
                id: role.id,
              })),
            ]
          : [ROLE_LIST_TAG],
    }),

    /** POST /roles — create custom role (`roles:create`). */
    createRole: build.mutation<RoleResponse, CreateRoleBody>({
      query: (body) => ({
        url: '/roles',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<RoleResponse>) =>
        unwrapData(response),
      invalidatesTags: [ROLE_LIST_TAG],
    }),

    /** PATCH /roles/:id — update role (`roles:update`). */
    updateRole: build.mutation<
      RoleResponse,
      { id: string; body: UpdateRoleBody }
    >({
      query: ({ id, body }) => ({
        url: `/roles/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<RoleResponse>) =>
        unwrapData(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Role', id },
        ROLE_LIST_TAG,
      ],
    }),

    /** DELETE /roles/:id — delete custom role (`roles:delete`). */
    deleteRole: build.mutation<null, string>({
      query: (id) => ({
        url: `/roles/${encodeURIComponent(id)}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<null>) => unwrapData(response),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Role', id },
        ROLE_LIST_TAG,
      ],
    }),

    /**
     * POST /roles/:id/permissions — replace-set role permissions
     * (`roles:assign_permissions`).
     */
    assignRolePermissions: build.mutation<
      RoleWithPermissionsResponse,
      { id: string; body: AssignRolePermissionsBody }
    >({
      query: ({ id, body }) => ({
        url: `/roles/${encodeURIComponent(id)}/permissions`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<RoleWithPermissionsResponse>) =>
        unwrapData(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Role', id },
        ROLE_LIST_TAG,
      ],
    }),
  }),
})

export const {
  useListRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRolePermissionsMutation,
} = rolesApi
