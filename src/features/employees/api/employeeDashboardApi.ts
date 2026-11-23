import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  AbsentTodayData,
  AttendanceAnalyticsData,
  ByDepartmentData,
  DashboardDateRangeArgs,
  DashboardListArgs,
  LateArrivalsData,
  LeaveAnalyticsData,
  NewJoinersData,
  OnLeaveTodayData,
  OnProbationData,
  PresentTodayData,
  TerminatedData,
  UpcomingAnniversariesData,
  UpcomingBirthdaysData,
} from './employeeDashboardApi.types'

function cleanParams(params: Record<string, string | number | undefined>) {
  const next: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    next[key] = value
  }
  return next
}

/**
 * HR dashboard list / analytics endpoints under `/dashboard/*`.
 * Headcount summary stays on `employeesApi.getEmployeeSummary`.
 */
export const employeeDashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPresentToday: build.query<PresentTodayData, DashboardListArgs | void>({
      query: (args) => ({
        url: '/dashboard/attendance/present-today',
        params: cleanParams({ page: args?.page ?? 1, limit: args?.limit ?? 1 }),
      }),
      transformResponse: (response: ApiResponse<PresentTodayData>) => unwrapData(response),
    }),

    getAbsentToday: build.query<AbsentTodayData, DashboardListArgs | void>({
      query: (args) => ({
        url: '/dashboard/attendance/absent-today',
        params: cleanParams({ page: args?.page ?? 1, limit: args?.limit ?? 1 }),
      }),
      transformResponse: (response: ApiResponse<AbsentTodayData>) => unwrapData(response),
    }),

    getOnLeaveToday: build.query<OnLeaveTodayData, DashboardListArgs | void>({
      query: (args) => ({
        url: '/dashboard/leaves/on-leave',
        params: cleanParams({ page: args?.page ?? 1, limit: args?.limit ?? 1 }),
      }),
      transformResponse: (response: ApiResponse<OnLeaveTodayData>) => unwrapData(response),
    }),

    getLateArrivalsToday: build.query<LateArrivalsData, DashboardListArgs | void>({
      query: (args) => ({
        url: '/dashboard/attendance/late-arrivals',
        params: cleanParams({ page: args?.page ?? 1, limit: args?.limit ?? 1 }),
      }),
      transformResponse: (response: ApiResponse<LateArrivalsData>) => unwrapData(response),
    }),

    getUpcomingBirthdays: build.query<UpcomingBirthdaysData, DashboardListArgs | void>({
      query: (args) => ({
        url: '/dashboard/employees/upcoming-birthdays',
        params: cleanParams({
          page: args?.page ?? 1,
          limit: args?.limit ?? 8,
          days: args?.days ?? 30,
          departmentId: args?.departmentId,
          search: args?.search,
        }),
      }),
      transformResponse: (response: ApiResponse<UpcomingBirthdaysData>) => unwrapData(response),
    }),

    getUpcomingAnniversaries: build.query<
      UpcomingAnniversariesData,
      DashboardListArgs | void
    >({
      query: (args) => ({
        url: '/dashboard/employees/upcoming-anniversaries',
        params: cleanParams({
          page: args?.page ?? 1,
          limit: args?.limit ?? 8,
          days: args?.days ?? 30,
          departmentId: args?.departmentId,
          search: args?.search,
        }),
      }),
      transformResponse: (response: ApiResponse<UpcomingAnniversariesData>) =>
        unwrapData(response),
    }),

    getNewJoiners: build.query<NewJoinersData, DashboardListArgs | void>({
      query: (args) => ({
        url: '/dashboard/employees/new-joiners',
        params: cleanParams({
          page: args?.page ?? 1,
          limit: args?.limit ?? 10,
          year: args?.year,
          month: args?.month,
          departmentId: args?.departmentId,
          search: args?.search,
        }),
      }),
      transformResponse: (response: ApiResponse<NewJoinersData>) => unwrapData(response),
    }),

    getEmployeesByDepartment: build.query<ByDepartmentData, { search?: string } | void>({
      query: (args) => ({
        url: '/dashboard/employees/by-department',
        params: cleanParams({ search: args?.search }),
      }),
      transformResponse: (response: ApiResponse<ByDepartmentData>) => unwrapData(response),
    }),

    getAttendanceAnalytics: build.query<AttendanceAnalyticsData, DashboardDateRangeArgs | void>({
      query: (args) => ({
        url: '/dashboard/analytics/attendance',
        params: cleanParams({
          startDate: args?.startDate,
          endDate: args?.endDate,
          departmentId: args?.departmentId,
        }),
      }),
      transformResponse: (response: ApiResponse<AttendanceAnalyticsData>) => unwrapData(response),
    }),

    getLeaveAnalytics: build.query<LeaveAnalyticsData, DashboardDateRangeArgs | void>({
      query: (args) => ({
        url: '/dashboard/analytics/leaves',
        params: cleanParams({
          startDate: args?.startDate,
          endDate: args?.endDate,
          departmentId: args?.departmentId,
        }),
      }),
      transformResponse: (response: ApiResponse<LeaveAnalyticsData>) => unwrapData(response),
    }),

    getTerminatedEmployees: build.query<TerminatedData, DashboardListArgs | void>({
      query: (args) => ({
        url: '/dashboard/employees/terminated',
        params: cleanParams({
          page: args?.page ?? 1,
          limit: args?.limit ?? 1,
          departmentId: args?.departmentId,
          search: args?.search,
        }),
      }),
      transformResponse: (response: ApiResponse<TerminatedData>) => unwrapData(response),
    }),

    getOnProbationEmployees: build.query<OnProbationData, DashboardListArgs | void>({
      query: (args) => ({
        url: '/dashboard/employees/on-probation',
        params: cleanParams({
          page: args?.page ?? 1,
          limit: args?.limit ?? 1,
          departmentId: args?.departmentId,
          search: args?.search,
        }),
      }),
      transformResponse: (response: ApiResponse<OnProbationData>) => unwrapData(response),
    }),
  }),
})

export const {
  useGetPresentTodayQuery,
  useGetAbsentTodayQuery,
  useGetOnLeaveTodayQuery,
  useGetLateArrivalsTodayQuery,
  useGetUpcomingBirthdaysQuery,
  useGetUpcomingAnniversariesQuery,
  useGetNewJoinersQuery,
  useGetEmployeesByDepartmentQuery,
  useGetAttendanceAnalyticsQuery,
  useGetLeaveAnalyticsQuery,
  useGetTerminatedEmployeesQuery,
  useGetOnProbationEmployeesQuery,
} = employeeDashboardApi
