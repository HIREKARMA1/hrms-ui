import { env } from '@/config/env'
import { baseApi } from '@/services/api/baseApi'
import { getApiErrorMessage } from '@/services/api/errors'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  BackendDeleteEmployeeResult,
  BackendEmployee,
  BackendEmployeeWithSync,
  DeviceSyncOutcome,
  EmployeePage,
  EmployeeSummary,
  UpdateEmployeeBody,
} from './employeeApi.types'
import { mapEmployee, mapEmployeePage, type EmployeeRecord } from './employeeMappers'

export const EMPLOYEE_PAGE_SIZE = 20
/** Server-side `take` limit (listEmployeesSchema / searchEmployeesSchema). */
export const EMPLOYEE_MAX_TAKE = 100

export type EmployeeListArgs = { skip?: number; take?: number }
export type EmployeeSearchArgs = EmployeeListArgs & { q: string }

/** Mutation result normalised to the mapped record plus any device sync outcome. */
export type EmployeeMutationResult = {
  record: EmployeeRecord
  deviceSync: DeviceSyncOutcome | null
}

export type EmployeeDeleteResult = {
  employeeId: string
  name: string
  deviceSync: DeviceSyncOutcome
}

function clampTake(take: number | undefined) {
  return Math.min(Math.max(take ?? EMPLOYEE_PAGE_SIZE, 1), EMPLOYEE_MAX_TAKE)
}

function isWithSync(value: unknown): value is BackendEmployeeWithSync {
  return (
    typeof value === 'object' &&
    value !== null &&
    'employee' in value &&
    'sync' in value
  )
}

/** PATCH returns a bare employee, or `{ employee, sync }` when device fields changed. */
export function normaliseEmployeeMutation(
  response: BackendEmployee | BackendEmployeeWithSync,
  apiBaseUrl = env.apiBaseUrl,
): EmployeeMutationResult {
  if (isWithSync(response)) {
    return {
      record: mapEmployee(response.employee, apiBaseUrl),
      deviceSync: response.sync?.device ?? null,
    }
  }
  return { record: mapEmployee(response, apiBaseUrl), deviceSync: null }
}

const CONFLICT_FIELD_LABELS: Record<string, string> = {
  employeeCode: 'Employee code',
  email: 'Work email',
  aadhaar: 'Aadhaar',
  pan: 'PAN',
}

/** `getApiErrorMessage` plus the field names from a 409 `{ message, conflicts }` body. */
export function getEmployeeErrorMessage(error: unknown, fallback: string): string {
  const message = getApiErrorMessage(error, fallback)
  if (typeof error !== 'object' || error === null || !('status' in error)) return message
  const { status, data } = error as { status: unknown; data?: { conflicts?: unknown } }
  if (status !== 409 || !Array.isArray(data?.conflicts) || data.conflicts.length === 0) {
    return message
  }
  const fields = data.conflicts
    .filter((field): field is string => typeof field === 'string')
    .map((field) => CONFLICT_FIELD_LABELS[field] ?? field)
  return fields.length ? `${message}: ${fields.join(', ')}.` : message
}

const LIST_TAG = { type: 'Employee' as const, id: 'LIST' }
const SUMMARY_TAG = { type: 'Employee' as const, id: 'SUMMARY' }

function pageTags(page: EmployeePage<EmployeeRecord> | undefined) {
  return [
    LIST_TAG,
    ...(page?.items ?? []).map((item) => ({ type: 'Employee' as const, id: item.server.id })),
  ]
}

export const employeesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /employees?skip&take (employees:read). Newest first. */
    listEmployees: build.query<EmployeePage<EmployeeRecord>, EmployeeListArgs>({
      query: ({ skip = 0, take } = {}) => ({
        url: '/employees',
        params: { skip: Math.max(skip, 0), take: clampTake(take) },
      }),
      transformResponse: (response: EmployeePage<BackendEmployee>) =>
        mapEmployeePage(response, env.apiBaseUrl),
      providesTags: (result) => pageTags(result),
    }),

    /** GET /employees/search?q&skip&take (employees:read). */
    searchEmployees: build.query<EmployeePage<EmployeeRecord>, EmployeeSearchArgs>({
      query: ({ q, skip = 0, take }) => ({
        url: '/employees/search',
        params: { q: q.trim(), skip: Math.max(skip, 0), take: clampTake(take) },
      }),
      transformResponse: (response: EmployeePage<BackendEmployee>) =>
        mapEmployeePage(response, env.apiBaseUrl),
      providesTags: (result) => pageTags(result),
    }),

    /** GET /employees/:id (employees:read). */
    getEmployee: build.query<EmployeeRecord, string>({
      query: (id) => `/employees/${encodeURIComponent(id)}`,
      transformResponse: (response: BackendEmployee) => mapEmployee(response, env.apiBaseUrl),
      providesTags: (_result, _error, id) => [{ type: 'Employee', id }],
    }),

    /** POST /employees, multipart (employees:create). Build the body with `buildCreateFormData`. */
    createEmployee: build.mutation<EmployeeMutationResult, FormData>({
      query: (body) => ({ url: '/employees', method: 'POST', body }),
      transformResponse: (response: BackendEmployeeWithSync) => normaliseEmployeeMutation(response),
      invalidatesTags: [LIST_TAG, SUMMARY_TAG],
    }),

    /** PATCH /employees/:id, JSON (employees:update). Build the body with `buildUpdatePayload`. */
    updateEmployee: build.mutation<EmployeeMutationResult, { id: string; body: UpdateEmployeeBody }>({
      query: ({ id, body }) => ({
        url: `/employees/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: BackendEmployee | BackendEmployeeWithSync) =>
        normaliseEmployeeMutation(response),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Employee', id }, LIST_TAG, SUMMARY_TAG],
    }),

    /**
     * DELETE /employees/:id (employees:delete). Hard delete from the HRMS
     * database, and from the TimeWatch device when a deviceId is linked.
     */
    deleteEmployee: build.mutation<EmployeeDeleteResult, string>({
      query: (id) => ({ url: `/employees/${encodeURIComponent(id)}`, method: 'DELETE' }),
      transformResponse: (response: BackendDeleteEmployeeResult) => {
        const employee = response?.employee
        if (!employee?.id) {
          throw new Error('Delete succeeded but response was missing employee details')
        }
        return {
          employeeId: employee.id,
          name: `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() || 'Employee',
          deviceSync: response.sync?.device ?? {
            status: 'skipped' as const,
            message:
              response.message ??
              'TimeWatch device punch data is not changed',
          },
        }
      },
      invalidatesTags: (_result, _error, id) => [{ type: 'Employee', id }, LIST_TAG, SUMMARY_TAG],
    }),

    /** POST /employees/:id/sync-device?mode&verify (employees:sync_device). */
    syncEmployeeDevice: build.mutation<
      EmployeeMutationResult,
      { id: string; mode?: 'push' | 'link'; verify?: boolean }
    >({
      query: ({ id, mode = 'push', verify }) => ({
        url: `/employees/${encodeURIComponent(id)}/sync-device`,
        method: 'POST',
        params: mode === 'link' && verify !== undefined ? { mode, verify } : { mode },
      }),
      transformResponse: (response: BackendEmployeeWithSync) => normaliseEmployeeMutation(response),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Employee', id }, LIST_TAG],
    }),

    /** GET /dashboard/summary (employees:read), enveloped. */
    getEmployeeSummary: build.query<EmployeeSummary, void>({
      query: () => '/dashboard/summary',
      transformResponse: (response: ApiResponse<EmployeeSummary>) => unwrapData(response),
      providesTags: [SUMMARY_TAG],
    }),
  }),
})

export const {
  useListEmployeesQuery,
  useSearchEmployeesQuery,
  useGetEmployeeQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useSyncEmployeeDeviceMutation,
  useGetEmployeeSummaryQuery,
} = employeesApi
