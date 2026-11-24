/**
 * RTK Query: `/users` list, detail, create, update, deactivate, and role assign/remove.
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

/** @deprecated Prefer `CreateUserBody` — kept for CreateEmployeeLoginPanel imports. */
export type CreateUserRequest = CreateUserBody
/** @deprecated Prefer `BackendUser`. */
export type CreatedUser = BackendUser

function cleanListParams(args: ListUsersArgs = {}) {
  const params: Record<string, string | number | boolean> = {}
  if (args.page !== undefined) params.page = args.page
  if (args.limit !== undefined) params.limit = args.limit
  if (args.search?.trim()) params.search = args.search.trim()
  if (args.role) params.role = args.role
  if (args.isActive !== undefined) params.isActive = args.isActive
  if (args.roleCode?.trim()) params.roleCode = args.roleCode.trim().toUpperCase()
  return params
}

function normaliseCreateBody(body: CreateUserBody): CreateUserBody {
  const email = body.email.trim()
  const employeeId = body.employeeId?.trim()
  return {
    email,
    password: body.password,
    ...(employeeId ? { employeeId } : {}),
  }
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<UsersPage, ListUsersArgs | void>({
      query: (args) => ({
        url: '/users',
        params: cleanListParams(args ?? {}),
      }),
      transformResponse: (response: ApiResponse<UsersPage>) => unwrapData(response),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((user) => ({ type: 'User' as const, id: user.id })),
              { type: 'User' as const, id: 'LIST' },
            ]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),

    getUser: build.query<BackendUser, string>({
      query: (id) => `/users/${encodeURIComponent(id.trim())}`,
      transformResponse: (response: ApiResponse<BackendUser>) => unwrapData(response),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    createUser: build.mutation<BackendUser, CreateUserBody>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body: normaliseCreateBody(body),
      }),
      transformResponse: (response: ApiResponse<BackendUser>) => unwrapData(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'User', id: 'LIST' },
        'Employee',
        ...(arg.employeeId?.trim()
          ? [{ type: 'Employee' as const, id: arg.employeeId.trim() }]
          : []),
      ],
    }),

    updateUser: build.mutation<BackendUser, { id: string; body: UpdateUserBody }>({
      query: ({ id, body }) => ({
        url: `/users/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<BackendUser>) => unwrapData(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
        'Employee',
      ],
    }),

    deactivateUser: build.mutation<BackendUser, string>({
      query: (id) => ({
        url: `/users/${encodeURIComponent(id)}/deactivate`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<BackendUser>) => unwrapData(response),
      invalidatesTags: (_result, _error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    assignUserRoles: build.mutation<
      BackendUser,
      { id: string; body: AssignUserRolesBody }
    >({
      query: ({ id, body }) => ({
        url: `/users/${encodeURIComponent(id)}/roles`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<BackendUser>) => unwrapData(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    removeUserRole: build.mutation<BackendUser, { id: string; roleId: string }>({
      query: ({ id, roleId }) => ({
        url: `/users/${encodeURIComponent(id)}/roles/${encodeURIComponent(roleId)}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<BackendUser>) => unwrapData(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
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

export function getUserErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback)
}
