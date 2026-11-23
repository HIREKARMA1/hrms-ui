import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  ApiApprovalWorkflowItem,
  ApprovalWorkflowDetailView,
  ApprovalWorkflowsListData,
} from '../types/api/leaveApprovalWorkflows.types'
import type { ApiLeaveRequestItem } from '../types/api/leaveList.types'
import type { LeaveApprovalPendingData } from '../types/api/leaveApprovalPending.types'
import type { ApiApprovalHistoryItem, LeaveApprovalHistoryData } from '../types/api/leaveApprovalHistory.types'
import type { LeaveRequest, LeaveStep } from '../types/leaveRequest'
import { mapApiApprovalHistoryToSteps } from '../utils/mapApiApprovalHistory'
import { mapApiApprovalWorkflowItemToDetail } from '../utils/mapApiApprovalWorkflows'
import { mapApiLeaveListToRequests } from '../utils/mapApiLeaveRequest'

function normalizeApprovalWorkflows(raw: unknown): ApprovalWorkflowsListData {
  if (Array.isArray(raw)) {
    return { items: raw as ApiApprovalWorkflowItem[] }
  }
  if (raw && typeof raw === 'object' && 'items' in raw) {
    return raw as ApprovalWorkflowsListData
  }
  if (raw && typeof raw === 'object' && 'workflows' in raw) {
    const workflows = (raw as { workflows: ApiApprovalWorkflowItem[] }).workflows
    return { items: Array.isArray(workflows) ? workflows : [] }
  }
  return { items: [] }
}

function normalizePendingApprovals(raw: unknown): LeaveApprovalPendingData {
  if (Array.isArray(raw)) {
    return { items: raw as ApiLeaveRequestItem[] }
  }
  if (raw && typeof raw === 'object' && 'items' in raw) {
    return raw as LeaveApprovalPendingData
  }
  if (raw && typeof raw === 'object' && 'requests' in raw) {
    const requests = (raw as { requests: ApiLeaveRequestItem[] }).requests
    return { items: Array.isArray(requests) ? requests : [] }
  }
  if (raw && typeof raw === 'object' && 'pending' in raw) {
    const pending = (raw as { pending: ApiLeaveRequestItem[] }).pending
    return { items: Array.isArray(pending) ? pending : [] }
  }
  return { items: [] }
}

function normalizeApprovalHistory(raw: unknown): LeaveApprovalHistoryData {
  if (Array.isArray(raw)) {
    return { items: raw as ApiApprovalHistoryItem[] }
  }
  if (raw && typeof raw === 'object' && 'items' in raw) {
    return raw as LeaveApprovalHistoryData
  }
  if (raw && typeof raw === 'object' && 'history' in raw) {
    const history = (raw as { history: ApiApprovalHistoryItem[] }).history
    return { items: Array.isArray(history) ? history : [] }
  }
  if (raw && typeof raw === 'object' && 'steps' in raw) {
    const steps = (raw as { steps: ApiApprovalHistoryItem[] }).steps
    return { items: Array.isArray(steps) ? steps : [] }
  }
  return { items: [] }
}

function normalizeApprovalWorkflowDetail(raw: unknown): ApiApprovalWorkflowItem {
  if (raw && typeof raw === 'object' && 'workflow' in raw) {
    return (raw as { workflow: ApiApprovalWorkflowItem }).workflow
  }
  if (raw && typeof raw === 'object' && 'item' in raw) {
    return (raw as { item: ApiApprovalWorkflowItem }).item
  }
  return raw as ApiApprovalWorkflowItem
}

export const leaveApprovalApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /leave-approval/workflows — configured approval workflows (read-only). */
    getApprovalWorkflows: build.query<ApprovalWorkflowsListData, void>({
      query: () => ({ url: '/leave-approval/workflows' }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeApprovalWorkflows(unwrapData(response)),
      providesTags: [{ type: 'Leave', id: 'APPROVAL-WORKFLOWS' }],
    }),
    /** GET /leave-approval/pending — approver queue (Admin Approvals). */
    getPendingApprovals: build.query<LeaveRequest[], void>({
      query: () => ({ url: '/leave-approval/pending' }),
      transformResponse: (response: ApiResponse<unknown>) => {
        const pending = normalizePendingApprovals(unwrapData(response))
        return mapApiLeaveListToRequests({
          items: pending.items,
          total: pending.items.length,
          page: 1,
          limit: pending.items.length || 1,
        })
      },
      providesTags: (result) =>
        result
          ? [
              { type: 'Leave', id: 'APPROVAL-PENDING' },
              ...result.map((item) => ({ type: 'Leave' as const, id: item.id })),
            ]
          : [{ type: 'Leave', id: 'APPROVAL-PENDING' }],
    }),
    /** GET /leave-approval/history/{leaveRequestId} — approval activity trail. */
    getLeaveApprovalHistory: build.query<LeaveStep[], string>({
      query: (leaveRequestId) => ({
        url: `/leave-approval/history/${encodeURIComponent(leaveRequestId)}`,
      }),
      transformResponse: (response: ApiResponse<unknown>, _meta, leaveRequestId) =>
        mapApiApprovalHistoryToSteps(
          normalizeApprovalHistory(unwrapData(response)),
          leaveRequestId,
        ),
      providesTags: (_result, _error, leaveRequestId) => [
        { type: 'Leave', id: `APPROVAL-HISTORY-${leaveRequestId}` },
      ],
    }),
    getApprovalWorkflowById: build.query<ApprovalWorkflowDetailView, string>({
      query: (id) => ({
        url: `/leave-approval/workflows/${encodeURIComponent(id)}`,
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        mapApiApprovalWorkflowItemToDetail(normalizeApprovalWorkflowDetail(unwrapData(response))),
      providesTags: (_result, _error, id) => [{ type: 'Leave', id: `APPROVAL-WORKFLOW-${id}` }],
    }),
  }),
})

export const {
  useGetApprovalWorkflowsQuery,
  useGetApprovalWorkflowByIdQuery,
  useGetPendingApprovalsQuery,
  useGetLeaveApprovalHistoryQuery,
} = leaveApprovalApi