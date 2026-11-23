import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

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
  }),
})

export const { useGetDashboardSummaryQuery } = dashboardApi