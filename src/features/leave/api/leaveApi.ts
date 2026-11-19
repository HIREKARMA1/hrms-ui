import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  LeaveBalanceData,
  LeaveBalanceQuery,
} from '../types/api/leaveBalance.types'
import type {
  LeaveHistoryData,
  LeaveHistoryQuery,
} from '../types/api/leaveHistory.types'
import type {
  ApiTeamCalendarDayRow,
  TeamLeaveCalendarData,
  TeamLeaveCalendarQuery,
} from '../types/api/teamLeaveCalendar.types'
import type { ApplyLeaveRequestBody } from '../types/api/leaveApply.types'
import type {
  ApiLeaveRequestItem,
  LeaveListData,
  LeaveListQuery,
} from '../types/api/leaveList.types'
import type { LeaveRequest } from '../types/leaveRequest'
import { mapApiLeaveRequestItem } from '../utils/mapApiLeaveRequest'

function normalizeLeaveListData(raw: unknown): LeaveListData {
  if (Array.isArray(raw)) {
    return {
      items: raw as ApiLeaveRequestItem[],
      total: raw.length,
      page: 1,
      limit: raw.length || 1,
    }
  }
  if (raw && typeof raw === 'object' && 'items' in raw) {
    return raw as LeaveListData
  }
  return { items: [], total: 0, page: 1, limit: 20 }
}

function normalizeLeaveBalanceData(raw: unknown): LeaveBalanceData {
  if (Array.isArray(raw)) {
    return { items: raw as LeaveBalanceData['items'] }
  }
  if (raw && typeof raw === 'object' && 'items' in raw) {
    return raw as LeaveBalanceData
  }
  if (raw && typeof raw === 'object' && 'balances' in raw) {
    const balances = (raw as { balances: LeaveBalanceData['items'] }).balances
    return { items: Array.isArray(balances) ? balances : [] }
  }
  return { items: [] }
}

function normalizeLeaveHistoryData(raw: unknown): LeaveHistoryData {
  if (Array.isArray(raw)) {
    return { items: raw as LeaveHistoryData['items'] }
  }
  if (raw && typeof raw === 'object' && 'items' in raw) {
    return raw as LeaveHistoryData
  }
  if (raw && typeof raw === 'object' && 'history' in raw) {
    const history = (raw as { history: LeaveHistoryData['items'] }).history
    return { items: Array.isArray(history) ? history : [] }
  }
  return { items: [] }
}

function normalizeTeamLeaveCalendarData(raw: unknown): TeamLeaveCalendarData {
  if (Array.isArray(raw)) {
    return { items: raw as ApiTeamCalendarDayRow[] }
  }
  if (raw && typeof raw === 'object' && 'items' in raw) {
    return raw as TeamLeaveCalendarData
  }
  if (raw && typeof raw === 'object' && 'entries' in raw) {
    const entries = (raw as { entries: ApiTeamCalendarDayRow[] }).entries
    return { items: Array.isArray(entries) ? entries : [] }
  }
  if (raw && typeof raw === 'object' && 'days' in raw) {
    const days = (raw as { days: Record<string, ApiTeamCalendarDayRow[] | ApiTeamCalendarDayRow> })
      .days
    const items: ApiTeamCalendarDayRow[] = []
    for (const [date, value] of Object.entries(days ?? {})) {
      const rows = Array.isArray(value) ? value : [value]
      for (const row of rows) {
        if (row && typeof row === 'object') {
          items.push({ ...row, date: row.date ?? row.day ?? row.calendarDate ?? date })
        }
      }
    }
    return { items }
  }
  return { items: [] }
}

function normalizeLeaveDetail(raw: unknown): ApiLeaveRequestItem {
  if (raw && typeof raw === 'object' && 'leaveRequest' in raw) {
    return (raw as { leaveRequest: ApiLeaveRequestItem }).leaveRequest
  }
  return raw as ApiLeaveRequestItem
}

export const leaveApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /leaves — requires `leaves:read`. */
    getLeaveRequests: build.query<LeaveListData, LeaveListQuery | void>({
      query: (params) => ({
        url: '/leaves',
        params: params ?? { page: 1, limit: 100 },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeLeaveListData(unwrapData(response)),
      providesTags: (result) =>
        result
          ? [
              { type: 'Leave', id: 'LIST' },
              ...result.items.map((item) => ({
                type: 'Leave' as const,
                id: item.id,
              })),
            ]
          : [{ type: 'Leave', id: 'LIST' }],
    }),
    /** GET /leaves/{id} — single leave request detail. */
    getLeaveById: build.query<LeaveRequest, string>({
      query: (id) => ({
        url: `/leaves/${encodeURIComponent(id)}`,
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        mapApiLeaveRequestItem(normalizeLeaveDetail(unwrapData(response))),
      providesTags: (_result, _error, id) => [{ type: 'Leave', id }],
    }),
    /** GET /leaves/balance/{employeeId} — requires auth scoped to employeeId. */
    getLeaveBalances: build.query<LeaveBalanceData, LeaveBalanceQuery>({
      query: ({ employeeId, year, leaveTypeId }) => ({
        url: `/leaves/balance/${encodeURIComponent(employeeId)}`,
        params: {
          ...(year !== undefined ? { year } : {}),
          ...(leaveTypeId ? { leaveTypeId } : {}),
        },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeLeaveBalanceData(unwrapData(response)),
      providesTags: (_result, _error, arg) => [
        { type: 'Leave', id: `BALANCE-${arg.employeeId}` },
      ],
    }),
    /** GET /leaves/history/{employeeId} — append-only balance ledger. */
    getLeaveHistory: build.query<LeaveHistoryData, LeaveHistoryQuery>({
      query: ({ employeeId, year, leaveTypeId, page, limit }) => ({
        url: `/leaves/history/${encodeURIComponent(employeeId)}`,
        params: {
          ...(year !== undefined ? { year } : {}),
          ...(leaveTypeId ? { leaveTypeId } : {}),
          ...(page !== undefined ? { page } : {}),
          ...(limit !== undefined ? { limit } : {}),
        },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeLeaveHistoryData(unwrapData(response)),
      providesTags: (_result, _error, arg) => [
        { type: 'Leave', id: `HISTORY-${arg.employeeId}` },
      ],
    }),
    /** GET /leaves/calendar/team — approved team leave for managers. */
    getTeamLeaveCalendar: build.query<TeamLeaveCalendarData, TeamLeaveCalendarQuery>({
      query: ({ year, month }) => ({
        url: '/leaves/calendar/team',
        params: { year, month },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeTeamLeaveCalendarData(unwrapData(response)),
      providesTags: (_result, _error, arg) => [
        { type: 'Leave', id: `CALENDAR-TEAM-${arg.year}-${arg.month}` },
      ],
    }),
    /** GET /leaves/calendar — approved own leave (employee self). */
    getLeaveCalendar: build.query<TeamLeaveCalendarData, TeamLeaveCalendarQuery>({
      query: ({ year, month }) => ({
        url: '/leaves/calendar',
        params: { year, month },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeTeamLeaveCalendarData(unwrapData(response)),
      providesTags: (_result, _error, arg) => [
        { type: 'Leave', id: `CALENDAR-SELF-${arg.year}-${arg.month}` },
      ],
    }),
    /** POST /leaves — apply for leave (`leaves:create`). */
    applyLeave: build.mutation<LeaveRequest, ApplyLeaveRequestBody>({
      query: (body) => ({
        url: '/leaves',
        method: 'POST',
        body: {
          employeeId: body.employeeId,
          leaveTypeId: body.leaveTypeId,
          startDate: body.startDate,
          endDate: body.endDate,
          dayPortion: body.dayPortion ?? 'FULL_DAY',
          ...(body.reason?.trim() ? { reason: body.reason.trim() } : {}),
        },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        mapApiLeaveRequestItem(normalizeLeaveDetail(unwrapData(response))),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Leave', id: 'LIST' },
        { type: 'Leave', id: 'APPROVAL-PENDING' },
        { type: 'Leave', id: `BALANCE-${arg.employeeId}` },
        { type: 'Leave', id: `HISTORY-${arg.employeeId}` },
        { type: 'Leave', id: `EMPLOYEE-DASHBOARD-${arg.employeeId}` },
      ],
    }),
  }),
})

export const {
  useGetLeaveRequestsQuery,
  useLazyGetLeaveRequestsQuery,
  useGetLeaveByIdQuery,
  useGetLeaveBalancesQuery,
  useGetLeaveHistoryQuery,
  useGetTeamLeaveCalendarQuery,
  useGetLeaveCalendarQuery,
  useApplyLeaveMutation,
} = leaveApi