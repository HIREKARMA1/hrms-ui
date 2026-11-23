/**
 * RTK Query: create login accounts linked to employees (POST /users).
 */
import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiErrorBody, type ApiResponse } from '@/services/api/types'

export type CreateUserRequest = {
  email: string
  password: string
  /** Employee cuid or employeeCode. */
  employeeId?: string
}

export type CreatedUser = {
  id: string
  email: string
  role: string
  isActive: boolean
  lastLoginAt: string | null
  employeeId: string | null
  createdAt: string
  updatedAt: string
  roles: Array<{
    id: string
    code: string
    name: string
    isSystem: boolean
    isActive: boolean
  }>
  employee: {
    id: string
    employeeCode: string
    firstName: string
    lastName: string
    email: string
  } | null
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createUser: build.mutation<CreatedUser, CreateUserRequest>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<CreatedUser>) => unwrapData(response),
      invalidatesTags: (_result, _error, arg) => [
        'User',
        'Employee',
        ...(arg.employeeId ? [{ type: 'Employee' as const, id: arg.employeeId }] : []),
      ],
    }),
  }),
})

export const { useCreateUserMutation } = usersApi

export function getUserErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback
  const data = 'data' in error ? (error.data as ApiErrorBody | undefined) : undefined
  const message = data?.message
  if (typeof message === 'string' && message.trim()) return message
  if (Array.isArray(message) && message.length > 0) return message.join('; ')
  return fallback
}
