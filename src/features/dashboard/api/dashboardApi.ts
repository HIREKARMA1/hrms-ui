import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type { DashboardEmployeesActiveData } from '../types/dashboardEmployeesActive.types'
import type { DashboardEmployeesInactiveData } from '../types/dashboardEmployeesInactive.types'
import type { DashboardEmployeesTotalData } from '../types/dashboardEmployeesTotal.types'
import type { DashboardSummaryData } from '../types/dashboardSummary.types'

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /dashboard/summary — requires `employees:read`. */
    getDashboardSummary: build.query<DashboardSummaryData, void>({
      query: () => ({ url: '/dashboard/summary' }),
      transformResponse: (response: ApiResponse<DashboardSummaryData>) =>
        unwrapData(response),
      providesTags: [{ type: 'Dashboard', id: 'SUMMARY' }],
    }),
    /** GET /dashboard/employees/total — all employee rows; Total card only. */
    getDashboardEmployeesTotal: build.query<DashboardEmployeesTotalData, void>({
      query: () => ({ url: '/dashboard/employees/total' }),
      transformResponse: (response: ApiResponse<DashboardEmployeesTotalData>) =>
        unwrapData(response),
      providesTags: [{ type: 'Dashboard', id: 'EMPLOYEES_TOTAL' }],
    }),
    /** GET /dashboard/employees/active — ACTIVE status only; Active card. */
    getDashboardEmployeesActive: build.query<DashboardEmployeesActiveData, void>({
      query: () => ({ url: '/dashboard/employees/active' }),
      transformResponse: (response: ApiResponse<DashboardEmployeesActiveData>) =>
        unwrapData(response),
      providesTags: [{ type: 'Dashboard', id: 'EMPLOYEES_ACTIVE' }],
    }),
    /** GET /dashboard/employees/inactive — TERMINATED only; Terminated card. */
    getDashboardEmployeesInactive: build.query<DashboardEmployeesInactiveData, void>({
      query: () => ({ url: '/dashboard/employees/inactive' }),
      transformResponse: (response: ApiResponse<DashboardEmployeesInactiveData>) =>
        unwrapData(response),
      providesTags: [{ type: 'Dashboard', id: 'EMPLOYEES_INACTIVE' }],
    }),
  }),
})

export const {
  useGetDashboardSummaryQuery,
  useGetDashboardEmployeesTotalQuery,
  useGetDashboardEmployeesActiveQuery,
  useGetDashboardEmployeesInactiveQuery,
} = dashboardApi