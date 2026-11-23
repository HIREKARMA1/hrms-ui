import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type { ApiLeaveTypeItem, LeaveTypesListData } from '../types/api/leaveTypesList.types'

function normalizeLeaveTypesList(raw: unknown): LeaveTypesListData {
  if (Array.isArray(raw)) {
    return { items: raw as ApiLeaveTypeItem[] }
  }
  if (raw && typeof raw === 'object' && 'items' in raw) {
    return raw as LeaveTypesListData
  }
  if (raw && typeof raw === 'object' && 'leaveTypes' in raw) {
    const leaveTypes = (raw as { leaveTypes: ApiLeaveTypeItem[] }).leaveTypes
    return { items: Array.isArray(leaveTypes) ? leaveTypes : [] }
  }
  return { items: [] }
}

export const leaveTypesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /leave-types — catalog for apply and balances. */
    getLeaveTypes: build.query<LeaveTypesListData, void>({
      query: () => ({ url: '/leave-types' }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeLeaveTypesList(unwrapData(response)),
      providesTags: [{ type: 'Leave', id: 'TYPES' }],
    }),
  }),
})

export const { useGetLeaveTypesQuery } = leaveTypesApi