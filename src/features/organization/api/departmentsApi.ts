/**
 * RTK Query: departments list for employee onboarding dropdowns.
 */
import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

export type DepartmentListItem = {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
  employeeCount: number
  createdAt: string
  updatedAt: string
}

export type DepartmentListQuery = {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  sortBy?: 'name' | 'code' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export type DepartmentListResult = {
  items: DepartmentListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const DEPARTMENTS_TAG = { type: 'Department' as const, id: 'LIST' }

export const departmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listDepartments: build.query<DepartmentListResult, DepartmentListQuery | void>({
      query: (arg) => ({
        url: '/departments',
        params: {
          page: arg?.page ?? 1,
          limit: arg?.limit ?? 100,
          sortBy: arg?.sortBy ?? 'name',
          sortOrder: arg?.sortOrder ?? 'asc',
          ...(arg?.isActive !== undefined ? { isActive: arg.isActive } : {}),
          ...(arg?.search ? { search: arg.search } : {}),
        },
      }),
      transformResponse: (response: ApiResponse<DepartmentListResult>) => unwrapData(response),
      providesTags: [DEPARTMENTS_TAG],
    }),
  }),
})

export const { useListDepartmentsQuery } = departmentsApi
