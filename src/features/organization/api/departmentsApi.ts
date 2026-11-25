/**
 * RTK Query: `/departments` list, detail, create, update, delete, and employees.
 * Shared with employee onboarding dropdowns via the `Department` LIST tag.
 */
import { baseApi } from '@/services/api/baseApi'
import { getApiErrorMessage } from '@/services/api/errors'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  BackendDepartment,
  BackendDepartmentDetail,
  CreateDepartmentBody,
  DepartmentEmployeesPage,
  DepartmentsPage,
  ListDepartmentEmployeesArgs,
  ListDepartmentsArgs,
  UpdateDepartmentBody,
} from './departmentsApi.types'

export const DEPARTMENTS_PAGE_SIZE = 20
export const DEPARTMENTS_MAX_LIMIT = 100

export const DEPARTMENTS_LIST_TAG = { type: 'Department' as const, id: 'LIST' }

/** @deprecated Prefer `BackendDepartment` — kept for employee onboarding imports. */
export type DepartmentListItem = BackendDepartment
/** @deprecated Prefer `ListDepartmentsArgs`. */
export type DepartmentListQuery = ListDepartmentsArgs
/** @deprecated Prefer `DepartmentsPage`. */
export type DepartmentListResult = DepartmentsPage

function clampLimit(limit: number | undefined, fallback = DEPARTMENTS_PAGE_SIZE) {
  return Math.min(Math.max(Math.trunc(limit ?? fallback), 1), DEPARTMENTS_MAX_LIMIT)
}

function clampPage(page: number | undefined) {
  return Math.max(Math.trunc(page ?? 1), 1)
}

function listParams(args: ListDepartmentsArgs = {}) {
  const params: Record<string, string | number | boolean> = {
    page: clampPage(args.page),
    limit: clampLimit(args.limit),
    sortBy: args.sortBy ?? 'name',
    sortOrder: args.sortOrder ?? 'asc',
  }
  const search = args.search?.trim()
  if (search) params.search = search.slice(0, 120)
  if (args.isActive !== undefined) params.isActive = args.isActive
  return params
}

function employeeListParams(args: Omit<ListDepartmentEmployeesArgs, 'id'>) {
  const params: Record<string, string | number> = {
    page: clampPage(args.page),
    limit: clampLimit(args.limit),
    sortBy: args.sortBy ?? 'firstName',
    sortOrder: args.sortOrder ?? 'asc',
  }
  const search = args.search?.trim()
  if (search) params.search = search.slice(0, 120)
  if (args.employmentStatus) params.employmentStatus = args.employmentStatus
  return params
}

function pageTags(page: DepartmentsPage | undefined) {
  return [
    DEPARTMENTS_LIST_TAG,
    ...(page?.items ?? []).map((item) => ({
      type: 'Department' as const,
      id: item.id,
    })),
  ]
}

function normaliseCreateBody(body: CreateDepartmentBody): CreateDepartmentBody {
  const description = body.description?.trim()
  return {
    code: body.code.trim().toUpperCase(),
    name: body.name.trim().replace(/\s+/g, ' '),
    ...(description ? { description: description.slice(0, 500) } : {}),
    ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
  }
}

function normaliseUpdateBody(body: UpdateDepartmentBody): UpdateDepartmentBody {
  const next: UpdateDepartmentBody = {}
  if (body.code !== undefined) next.code = body.code.trim().toUpperCase()
  if (body.name !== undefined) next.name = body.name.trim().replace(/\s+/g, ' ')
  if (body.description !== undefined) {
    next.description =
      body.description === null || body.description.trim() === ''
        ? null
        : body.description.trim().slice(0, 500)
  }
  if (body.isActive !== undefined) next.isActive = body.isActive
  return next
}

export const departmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /departments (departments:manage). */
    listDepartments: build.query<DepartmentsPage, ListDepartmentsArgs | void>({
      query: (args) => ({
        url: '/departments',
        params: listParams(args ?? {}),
      }),
      transformResponse: (response: ApiResponse<DepartmentsPage>) =>
        unwrapData(response),
      providesTags: (result) => pageTags(result),
    }),

    /** GET /departments/:id (departments:manage). */
    getDepartment: build.query<BackendDepartmentDetail, string>({
      query: (id) => `/departments/${encodeURIComponent(id.trim())}`,
      transformResponse: (response: ApiResponse<BackendDepartmentDetail>) =>
        unwrapData(response),
      providesTags: (_result, _error, id) => [{ type: 'Department', id }],
    }),

    /** GET /departments/:id/employees (departments:manage). */
    listDepartmentEmployees: build.query<
      DepartmentEmployeesPage,
      ListDepartmentEmployeesArgs
    >({
      query: ({ id, ...query }) => ({
        url: `/departments/${encodeURIComponent(id.trim())}/employees`,
        params: employeeListParams(query),
      }),
      transformResponse: (response: ApiResponse<DepartmentEmployeesPage>) =>
        unwrapData(response),
      providesTags: (_result, _error, { id }) => [
        { type: 'Department', id },
        { type: 'Department', id: `${id}-employees` },
      ],
    }),

    /** POST /departments (departments:manage). */
    createDepartment: build.mutation<BackendDepartment, CreateDepartmentBody>({
      query: (body) => ({
        url: '/departments',
        method: 'POST',
        body: normaliseCreateBody(body),
      }),
      transformResponse: (response: ApiResponse<BackendDepartment>) =>
        unwrapData(response),
      invalidatesTags: [DEPARTMENTS_LIST_TAG],
    }),

    /** PATCH /departments/:id (departments:manage). */
    updateDepartment: build.mutation<
      BackendDepartment,
      { id: string; body: UpdateDepartmentBody }
    >({
      query: ({ id, body }) => ({
        url: `/departments/${encodeURIComponent(id.trim())}`,
        method: 'PATCH',
        body: normaliseUpdateBody(body),
      }),
      transformResponse: (response: ApiResponse<BackendDepartment>) =>
        unwrapData(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Department', id },
        DEPARTMENTS_LIST_TAG,
      ],
    }),

    /** DELETE /departments/:id (departments:manage). */
    deleteDepartment: build.mutation<null, string>({
      query: (id) => ({
        url: `/departments/${encodeURIComponent(id.trim())}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<null>) => unwrapData(response),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Department', id },
        { type: 'Department', id: `${id}-employees` },
        DEPARTMENTS_LIST_TAG,
      ],
    }),
  }),
})

export const {
  useListDepartmentsQuery,
  useGetDepartmentQuery,
  useListDepartmentEmployeesQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentsApi

export function getDepartmentErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return getApiErrorMessage(error, fallback)
}
