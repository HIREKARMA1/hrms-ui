import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { baseApi, EMPTY_RESPONSE_ERROR } from '@/services/api/baseApi'
import { getApiErrorMessage } from '@/services/api/errors'

import type { EncashmentRequest } from '../types/encashment'
import type { LeaveEmployee } from '../types/employee'
import type { LeaveRequest } from '../types/leaveRequest'
import type {
  AdjustLeaveBalanceBody,
  ApplyLeaveBody,
  BackendAccrualPolicy,
  BackendAccrualRunResult,
  BackendCarryForwardExpiryResult,
  BackendCarryForwardPolicy,
  BackendCarryForwardRunResult,
  BackendLeaveAdjustment,
  BackendLeaveBalance,
  BackendLeaveCalendar,
  BackendLeavePolicyDefault,
  ExpireCarryForwardBody,
  LeaveCalendarArgs,
  LeaveHistoryArgs,
  ListEncashmentsArgs,
  ListLeavesArgs,
  ListLeaveTypesArgs,
  RunAccrualBody,
  RunCarryForwardBody,
} from './leaveApi.types'
import {
  leaveEmployeeFromEmbed,
  mapEncashment,
  mapLeaveRequest,
  mapLeaveType,
  mergeLeaveEmployees,
  optionalNote,
  readEnvelopeData,
  readLeaveBalance,
  readLeaveCalendar,
  readPage,
  type LeaveTypeOption,
  type MappedPage,
} from './leaveMappers'

/** Server-side `limit` cap on every paginated leave endpoint. */
export const LEAVE_MAX_LIMIT = 100

/** `error` code of the CUSTOM_ERROR returned when a body fails validation. */
export const LEAVE_INVALID_RESPONSE = 'LEAVE_INVALID_RESPONSE'

const INVALID_RESPONSE_MESSAGE = 'The server returned an unexpected leave response. Please try again.'

const MULTI_LEVEL_WORKFLOW_MESSAGE =
  'This request uses a multi-level approval workflow. Only its assigned workflow approver can act on it, and that requires an account linked to an employee record.'

function invalidResponse(): FetchBaseQueryError {
  return { status: 'CUSTOM_ERROR', error: LEAVE_INVALID_RESPONSE }
}

type QueryResult = { data?: unknown; error?: FetchBaseQueryError }
type RawBaseQuery = (args: string | FetchArgs) => unknown

/** Runs one request and accepts it only when the envelope `data` passes `read`. */
async function fetchEnvelope<T>(
  baseQuery: RawBaseQuery,
  args: string | FetchArgs,
  read: (data: unknown) => T | null,
): Promise<{ data: T } | { error: FetchBaseQueryError }> {
  const result = (await baseQuery(args)) as QueryResult
  if (result.error) {
    const empty = result.error.status === 'CUSTOM_ERROR' && result.error.error === EMPTY_RESPONSE_ERROR
    return { error: empty ? invalidResponse() : result.error }
  }
  const data = readEnvelopeData(result.data)
  const mapped = data === undefined ? null : read(data)
  return mapped === null ? { error: invalidResponse() } : { data: mapped }
}

function clampLimit(limit: number | undefined, fallback = 20): number {
  return Math.min(Math.max(Math.trunc(limit ?? fallback), 1), LEAVE_MAX_LIMIT)
}

function clampPage(page: number | undefined): number {
  return Math.max(Math.trunc(page ?? 1), 1)
}

const id = encodeURIComponent

export type LeaveRequestPage = MappedPage<LeaveRequest> & {
  /** Employees named in the embedded `employee` blocks. */
  employees: LeaveEmployee[]
}

export type EncashmentPage = MappedPage<EncashmentRequest> & { employees: LeaveEmployee[] }

function readLeaveRequestPage(data: unknown): LeaveRequestPage | null {
  const page = readPage(data, mapLeaveRequest)
  if (!page) return null
  const rawItems = (data as { items: unknown[] }).items
  const employees = mergeLeaveEmployees(
    rawItems
      .map((item) => leaveEmployeeFromEmbed((item as { employee?: unknown } | null)?.employee))
      .filter((item): item is LeaveEmployee => item !== null),
  )
  return { ...page, employees }
}

function readEncashmentPage(data: unknown): EncashmentPage | null {
  const page = readPage(data, mapEncashment)
  if (!page) return null
  const rawItems = (data as { items: unknown[] }).items
  const employees = mergeLeaveEmployees(
    rawItems
      .map((item) => leaveEmployeeFromEmbed((item as { employee?: unknown } | null)?.employee))
      .filter((item): item is LeaveEmployee => item !== null),
  )
  return { ...page, employees }
}

function readEncashment(data: unknown): EncashmentRequest | null {
  return mapEncashment(data)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Raw policy rows are kept as-is after a minimal shape check. */
function readPolicy<T>(item: unknown): T | null {
  return isObject(item) && typeof item.id === 'string' && typeof item.leaveTypeId === 'string' ? (item as T) : null
}

function readCounters<T>(keys: string[]) {
  return (data: unknown): T | null =>
    isObject(data) && keys.every((key) => typeof data[key] === 'number') ? (data as T) : null
}

const LIST = { type: 'Leave' as const, id: 'LIST' }
const CALENDAR = { type: 'Leave' as const, id: 'CALENDAR' }
const BALANCE = { type: 'Leave' as const, id: 'BALANCE' }
const TYPES = { type: 'Leave' as const, id: 'TYPES' }
const POLICIES = { type: 'Leave' as const, id: 'POLICIES' }
const ENCASHMENTS = { type: 'Leave' as const, id: 'ENCASHMENTS' }
const DEFAULTS = { type: 'Leave' as const, id: 'DEFAULTS' }

const REQUEST_CHANGED = [LIST, CALENDAR, BALANCE]

export const leaveApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ----- /leaves ---------------------------------------------------------

    /**
     * GET /leaves (leaves:read). Without leaves:approve or
     * leaves:create_on_behalf the server scopes the list to the caller's
     * linked employee and answers 403 when there is none.
     */
    listLeaves: build.query<LeaveRequestPage, ListLeavesArgs>({
      queryFn: (args, _api, _extra, baseQuery) =>
        fetchEnvelope(
          baseQuery,
          { url: '/leaves', params: { ...args, page: clampPage(args.page), limit: clampLimit(args.limit) } },
          readLeaveRequestPage,
        ),
      providesTags: [LIST],
    }),

    /** GET /leaves/:id (leaves:read). */
    getLeave: build.query<LeaveRequest, string>({
      queryFn: (leaveId, _api, _extra, baseQuery) => fetchEnvelope(baseQuery, `/leaves/${id(leaveId)}`, mapLeaveRequest),
      providesTags: [LIST],
    }),

    /** GET /leaves/history/:employeeId (leaves:read; own, team or org-wide). */
    getLeaveHistory: build.query<LeaveRequestPage, LeaveHistoryArgs>({
      queryFn: ({ employeeId, ...rest }, _api, _extra, baseQuery) =>
        fetchEnvelope(
          baseQuery,
          {
            url: `/leaves/history/${id(employeeId)}`,
            params: { ...rest, page: clampPage(rest.page), limit: clampLimit(rest.limit) },
          },
          readLeaveRequestPage,
        ),
      providesTags: [LIST],
    }),

    /** GET /leaves/balance/:employeeId?year (leaves:read). Empty items when no balance rows exist. */
    getLeaveBalance: build.query<BackendLeaveBalance, { employeeId: string; year?: number }>({
      queryFn: ({ employeeId, year }, _api, _extra, baseQuery) =>
        fetchEnvelope(baseQuery, { url: `/leaves/balance/${id(employeeId)}`, params: { year } }, readLeaveBalance),
      providesTags: [BALANCE],
    }),

    /**
     * GET /leaves/calendar (leaves:read). APPROVED leave only: org-wide with
     * leaves:create_on_behalf, the linked employee's department with
     * leaves:approve, otherwise the caller's own employee (empty when unlinked).
     */
    getLeaveCalendar: build.query<BackendLeaveCalendar, LeaveCalendarArgs>({
      queryFn: (params, _api, _extra, baseQuery) =>
        fetchEnvelope(baseQuery, { url: '/leaves/calendar', params }, readLeaveCalendar),
      providesTags: [CALENDAR],
    }),

    /** GET /leaves/calendar/team (leaves:approve or leaves:create_on_behalf). */
    getTeamLeaveCalendar: build.query<BackendLeaveCalendar, LeaveCalendarArgs>({
      queryFn: (params, _api, _extra, baseQuery) =>
        fetchEnvelope(baseQuery, { url: '/leaves/calendar/team', params }, readLeaveCalendar),
      providesTags: [CALENDAR],
    }),

    /** POST /leaves (leaves:create for own employeeId, leaves:create_on_behalf otherwise). */
    applyLeave: build.mutation<LeaveRequest, ApplyLeaveBody>({
      queryFn: (body, _api, _extra, baseQuery) =>
        fetchEnvelope(baseQuery, { url: '/leaves', method: 'POST', body }, mapLeaveRequest),
      invalidatesTags: REQUEST_CHANGED,
    }),

    /** POST /leaves/:id/approve (leaves:approve). Single-level PENDING requests only. */
    approveLeave: build.mutation<LeaveRequest, { id: string; note?: string }>({
      queryFn: ({ id: leaveId, note }, _api, _extra, baseQuery) =>
        fetchEnvelope(
          baseQuery,
          { url: `/leaves/${id(leaveId)}/approve`, method: 'POST', body: noteBody(note) },
          mapLeaveRequest,
        ),
      invalidatesTags: REQUEST_CHANGED,
    }),

    /** POST /leaves/:id/reject (leaves:approve). */
    rejectLeave: build.mutation<LeaveRequest, { id: string; note?: string }>({
      queryFn: ({ id: leaveId, note }, _api, _extra, baseQuery) =>
        fetchEnvelope(
          baseQuery,
          { url: `/leaves/${id(leaveId)}/reject`, method: 'POST', body: noteBody(note) },
          mapLeaveRequest,
        ),
      invalidatesTags: REQUEST_CHANGED,
    }),

    /** POST /leaves/:id/cancel (leaves:cancel; own request, or any with leaves:approve). */
    cancelLeave: build.mutation<LeaveRequest, { id: string; reason?: string }>({
      queryFn: ({ id: leaveId, reason }, _api, _extra, baseQuery) => {
        const trimmed = optionalNote(reason)
        return fetchEnvelope(
          baseQuery,
          { url: `/leaves/${id(leaveId)}/cancel`, method: 'POST', body: trimmed ? { reason: trimmed } : {} },
          mapLeaveRequest,
        )
      },
      invalidatesTags: REQUEST_CHANGED,
    }),

    // ----- /leave-types ----------------------------------------------------

    /** GET /leave-types (leave_types:read), sorted by code. */
    listLeaveTypes: build.query<MappedPage<LeaveTypeOption>, ListLeaveTypesArgs>({
      queryFn: (args, _api, _extra, baseQuery) =>
        fetchEnvelope(
          baseQuery,
          { url: '/leave-types', params: { ...args, page: clampPage(args.page), limit: clampLimit(args.limit) } },
          (data) => readPage(data, mapLeaveType),
        ),
      providesTags: [TYPES],
    }),

    // ----- /leave-policies -------------------------------------------------

    /** GET /leave-policies/accrual (leave_policies:read). */
    listAccrualPolicies: build.query<MappedPage<BackendAccrualPolicy>, { page?: number; limit?: number }>({
      queryFn: ({ page, limit }, _api, _extra, baseQuery) =>
        fetchEnvelope(
          baseQuery,
          { url: '/leave-policies/accrual', params: { page: clampPage(page), limit: clampLimit(limit) } },
          (data) => readPage(data, readPolicy<BackendAccrualPolicy>),
        ),
      providesTags: [POLICIES],
    }),

    /** GET /leave-policies/carry-forward (leave_policies:read). */
    listCarryForwardPolicies: build.query<MappedPage<BackendCarryForwardPolicy>, { page?: number; limit?: number }>({
      queryFn: ({ page, limit }, _api, _extra, baseQuery) =>
        fetchEnvelope(
          baseQuery,
          { url: '/leave-policies/carry-forward', params: { page: clampPage(page), limit: clampLimit(limit) } },
          (data) => readPage(data, readPolicy<BackendCarryForwardPolicy>),
        ),
      providesTags: [POLICIES],
    }),

    /** POST /leave-policies/accrual/run (leave_policies:run). */
    runAccrual: build.mutation<BackendAccrualRunResult, RunAccrualBody>({
      queryFn: (body, _api, _extra, baseQuery) =>
        fetchEnvelope(
          baseQuery,
          { url: '/leave-policies/accrual/run', method: 'POST', body },
          readCounters<BackendAccrualRunResult>(['processedEmployees', 'accruedCount', 'skippedManual', 'skippedDuplicate', 'skippedIneligible']),
        ),
      invalidatesTags: [BALANCE],
    }),

    /** POST /leave-policies/carry-forward/run (leave_policies:run). */
    runCarryForward: build.mutation<BackendCarryForwardRunResult, RunCarryForwardBody>({
      queryFn: (body, _api, _extra, baseQuery) =>
        fetchEnvelope(
          baseQuery,
          { url: '/leave-policies/carry-forward/run', method: 'POST', body },
          readCounters<BackendCarryForwardRunResult>(['processedBalances', 'carriedCount', 'skippedDisabled', 'skippedDuplicate', 'fromYear', 'toYear']),
        ),
      invalidatesTags: [BALANCE],
    }),

    /** POST /leave-policies/carry-forward/expire (leave_policies:run). */
    expireCarryForward: build.mutation<BackendCarryForwardExpiryResult, ExpireCarryForwardBody>({
      queryFn: (body, _api, _extra, baseQuery) =>
        fetchEnvelope(
          baseQuery,
          { url: '/leave-policies/carry-forward/expire', method: 'POST', body },
          readCounters<BackendCarryForwardExpiryResult>(['expiredCount', 'skippedDuplicate']),
        ),
      invalidatesTags: [BALANCE],
    }),

    // ----- /leave-encashments ----------------------------------------------

    /**
     * GET /leave-encashments (leave_encashments:read). Org-wide with
     * leave_encashments:approve; otherwise own / department team, which needs
     * a linked employee.
     */
    listEncashments: build.query<EncashmentPage, ListEncashmentsArgs>({
      queryFn: (args, _api, _extra, baseQuery) =>
        fetchEnvelope(
          baseQuery,
          { url: '/leave-encashments', params: { ...args, page: clampPage(args.page), limit: clampLimit(args.limit) } },
          readEncashmentPage,
        ),
      providesTags: [ENCASHMENTS],
    }),

    /** POST /leave-encashments/:id/approve (leave_encashments:approve). Deducts balance. */
    approveEncashment: build.mutation<EncashmentRequest, { id: string; note?: string }>({
      queryFn: ({ id: encashmentId, note }, _api, _extra, baseQuery) =>
        fetchEnvelope(
          baseQuery,
          { url: `/leave-encashments/${id(encashmentId)}/approve`, method: 'POST', body: noteBody(note) },
          readEncashment,
        ),
      invalidatesTags: [ENCASHMENTS, BALANCE],
    }),

    /** POST /leave-encashments/:id/reject (leave_encashments:reject). */
    rejectEncashment: build.mutation<EncashmentRequest, { id: string; note?: string }>({
      queryFn: ({ id: encashmentId, note }, _api, _extra, baseQuery) =>
        fetchEnvelope(
          baseQuery,
          { url: `/leave-encashments/${id(encashmentId)}/reject`, method: 'POST', body: noteBody(note) },
          readEncashment,
        ),
      invalidatesTags: [ENCASHMENTS],
    }),

    // ----- /employee-leave-policies ----------------------------------------

    /** GET /employee-leave-policies/defaults (employee_leave_policies:read). `data` is a bare array. */
    listLeavePolicyDefaults: build.query<BackendLeavePolicyDefault[], void>({
      queryFn: (_arg, _api, _extra, baseQuery) =>
        fetchEnvelope(baseQuery, '/employee-leave-policies/defaults', (data) =>
          Array.isArray(data)
            ? data.filter(
                (item): item is BackendLeavePolicyDefault =>
                  isObject(item) &&
                  typeof item.id === 'string' &&
                  typeof item.leaveTypeId === 'string' &&
                  typeof item.leaveTypeCode === 'string' &&
                  typeof item.leaveTypeName === 'string' &&
                  typeof item.annualEntitlement === 'number' &&
                  typeof item.monthlyAccrualAmount === 'number',
              )
            : null,
        ),
      providesTags: [DEFAULTS],
    }),

    /** POST /employee-leave-policies/adjustments (employee_leave_policies:adjust). */
    adjustLeaveBalance: build.mutation<BackendLeaveAdjustment, AdjustLeaveBalanceBody>({
      queryFn: (body, _api, _extra, baseQuery) =>
        fetchEnvelope(
          baseQuery,
          { url: '/employee-leave-policies/adjustments', method: 'POST', body },
          (data) => (isObject(data) && typeof data.id === 'string' && typeof data.entitledDays === 'number' ? (data as BackendLeaveAdjustment) : null),
        ),
      invalidatesTags: [BALANCE],
    }),
  }),
})

function noteBody(note: string | undefined): { note?: string } {
  const trimmed = optionalNote(note)
  return trimmed ? { note: trimmed } : {}
}

/** True for the 409 the core approve/reject endpoints return for workflow requests. */
export function isMultiLevelWorkflowError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('status' in error)) return false
  const { status, data } = error as { status: unknown; data?: { message?: unknown } }
  return status === 409 && typeof data?.message === 'string' && data.message.includes('multi-level approval workflow')
}

/** User-facing message for any leave API error. */
export function getLeaveErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    (error as { status?: unknown }).status === 'CUSTOM_ERROR' &&
    (error as { error?: unknown }).error === LEAVE_INVALID_RESPONSE
  ) {
    return INVALID_RESPONSE_MESSAGE
  }
  if (isMultiLevelWorkflowError(error)) return MULTI_LEVEL_WORKFLOW_MESSAGE
  return getApiErrorMessage(error, fallback)
}

export { MULTI_LEVEL_WORKFLOW_MESSAGE }

export const {
  useListLeavesQuery,
  useGetLeaveQuery,
  useGetLeaveHistoryQuery,
  useGetLeaveBalanceQuery,
  useGetLeaveCalendarQuery,
  useGetTeamLeaveCalendarQuery,
  useApplyLeaveMutation,
  useApproveLeaveMutation,
  useRejectLeaveMutation,
  useCancelLeaveMutation,
  useListLeaveTypesQuery,
  useListAccrualPoliciesQuery,
  useListCarryForwardPoliciesQuery,
  useRunAccrualMutation,
  useRunCarryForwardMutation,
  useExpireCarryForwardMutation,
  useListEncashmentsQuery,
  useApproveEncashmentMutation,
  useRejectEncashmentMutation,
  useListLeavePolicyDefaultsQuery,
  useAdjustLeaveBalanceMutation,
} = leaveApi
