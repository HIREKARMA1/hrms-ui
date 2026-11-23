import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  ApiLeaveAccrualPolicyItem,
  LeaveAccrualPoliciesData,
} from '../types/api/leaveAccrualPolicies.types'
import type {
  ApiLeaveCarryForwardPolicyItem,
  LeaveCarryForwardPoliciesData,
} from '../types/api/leaveCarryForwardPolicies.types'

function normalizeAccrualPolicies(raw: unknown): LeaveAccrualPoliciesData {
  if (Array.isArray(raw)) {
    return { items: raw as ApiLeaveAccrualPolicyItem[] }
  }
  if (raw && typeof raw === 'object' && 'items' in raw) {
    return raw as LeaveAccrualPoliciesData
  }
  if (raw && typeof raw === 'object' && 'policies' in raw) {
    const policies = (raw as { policies: ApiLeaveAccrualPolicyItem[] }).policies
    return { items: Array.isArray(policies) ? policies : [] }
  }
  return { items: [] }
}

function normalizeCarryForwardPolicies(raw: unknown): LeaveCarryForwardPoliciesData {
  if (Array.isArray(raw)) {
    return { items: raw as ApiLeaveCarryForwardPolicyItem[] }
  }
  if (raw && typeof raw === 'object' && 'items' in raw) {
    return raw as LeaveCarryForwardPoliciesData
  }
  if (raw && typeof raw === 'object' && 'policies' in raw) {
    const policies = (raw as { policies: ApiLeaveCarryForwardPolicyItem[] }).policies
    return { items: Array.isArray(policies) ? policies : [] }
  }
  return { items: [] }
}

export const leavePoliciesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /leave-policies/accrual — configured accrual rules (read-only). */
    getAccrualPolicies: build.query<LeaveAccrualPoliciesData, void>({
      query: () => ({ url: '/leave-policies/accrual' }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeAccrualPolicies(unwrapData(response)),
      providesTags: [{ type: 'Leave', id: 'ACCRUAL-POLICIES' }],
    }),
    /** GET /leave-policies/carry-forward — carry-forward rules (read-only). */
    getCarryForwardPolicies: build.query<LeaveCarryForwardPoliciesData, void>({
      query: () => ({ url: '/leave-policies/carry-forward' }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeCarryForwardPolicies(unwrapData(response)),
      providesTags: [{ type: 'Leave', id: 'CARRY-FORWARD-POLICIES' }],
    }),
  }),
})

export const { useGetAccrualPoliciesQuery, useGetCarryForwardPoliciesQuery } = leavePoliciesApi