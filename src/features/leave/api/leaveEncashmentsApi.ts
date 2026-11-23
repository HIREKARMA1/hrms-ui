import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  ApiLeaveEncashmentPolicyItem,
  LeaveEncashmentPoliciesData,
} from '../types/api/leaveEncashmentPolicies.types'
import type {
  ApiEncashmentRequestItem,
  HrEncashmentRequestRow,
  LeaveEncashmentListData,
  LeaveEncashmentListQuery,
} from '../types/api/leaveEncashmentList.types'
import { mapApiEncashmentItemToHrRow } from '../utils/mapApiEncashmentRequest'

function normalizeEncashmentPolicies(raw: unknown): LeaveEncashmentPoliciesData {
  if (Array.isArray(raw)) {
    return { items: raw as ApiLeaveEncashmentPolicyItem[] }
  }
  if (raw && typeof raw === 'object' && 'items' in raw) {
    return raw as LeaveEncashmentPoliciesData
  }
  if (raw && typeof raw === 'object' && 'policies' in raw) {
    const policies = (raw as { policies: ApiLeaveEncashmentPolicyItem[] }).policies
    return { items: Array.isArray(policies) ? policies : [] }
  }
  return { items: [] }
}

function normalizeEncashmentList(raw: unknown): LeaveEncashmentListData {
  if (Array.isArray(raw)) {
    return { items: raw as ApiEncashmentRequestItem[] }
  }
  if (raw && typeof raw === 'object' && 'items' in raw) {
    return raw as LeaveEncashmentListData
  }
  return { items: [] }
}

function normalizeEncashmentDetail(raw: unknown): ApiEncashmentRequestItem {
  if (raw && typeof raw === 'object' && 'encashment' in raw) {
    return (raw as { encashment: ApiEncashmentRequestItem }).encashment
  }
  if (raw && typeof raw === 'object' && 'item' in raw) {
    return (raw as { item: ApiEncashmentRequestItem }).item
  }
  if (raw && typeof raw === 'object' && 'leaveEncashment' in raw) {
    return (raw as { leaveEncashment: ApiEncashmentRequestItem }).leaveEncashment
  }
  return raw as ApiEncashmentRequestItem
}

export const leaveEncashmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /leave-encashments/policies — encashment policy rules (read-only). */
    getEncashmentPolicies: build.query<LeaveEncashmentPoliciesData, void>({
      query: () => ({ url: '/leave-encashments/policies' }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeEncashmentPolicies(unwrapData(response)),
      providesTags: [{ type: 'Leave', id: 'ENCASHMENT-POLICIES' }],
    }),
    /** GET /leave-encashments — encashment request list (HR Requests). */
    getEncashmentRequests: build.query<LeaveEncashmentListData, LeaveEncashmentListQuery | void>({
      query: (params) => ({
        url: '/leave-encashments',
        params: params ?? { page: 1, limit: 100 },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeEncashmentList(unwrapData(response)),
      providesTags: (result) =>
        result
          ? [
              { type: 'Leave', id: 'ENCASHMENT-LIST' },
              ...result.items.map((item) => ({
                type: 'Leave' as const,
                id: `ENCASHMENT-${item.id}`,
              })),
            ]
          : [{ type: 'Leave', id: 'ENCASHMENT-LIST' }],
    }),
    getEncashmentById: build.query<HrEncashmentRequestRow, string>({
      query: (id) => ({
        url: `/leave-encashments/${encodeURIComponent(id)}`,
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        mapApiEncashmentItemToHrRow(normalizeEncashmentDetail(unwrapData(response))),
      providesTags: (_result, _error, id) => [{ type: 'Leave', id: `ENCASHMENT-${id}` }],
    }),
  }),
})

export const {
  useGetEncashmentPoliciesQuery,
  useGetEncashmentRequestsQuery,
  useGetEncashmentByIdQuery,
} = leaveEncashmentsApi