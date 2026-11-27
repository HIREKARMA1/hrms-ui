import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  ApiApprovalWorkflowItem,
  ApprovalWorkflowDetailView,
  ApprovalWorkflowsListData,
  CreateApprovalWorkflowBody,
  UpdateApprovalWorkflowBody,
} from '../types/api/leaveApprovalWorkflows.types'
import type { ApiLeaveRequestItem } from '../types/api/leaveList.types'
import type { LeaveApprovalPendingData } from '../types/api/leaveApprovalPending.types'
import type { ApiApprovalHistoryItem, LeaveApprovalHistoryData } from '../types/api/leaveApprovalHistory.types'
import type { LeaveRequest, LeaveStep } from '../types/leaveRequest'
import { mapApiApprovalHistoryToSteps } from '../utils/mapApiApprovalHistory'
import { mapApiApprovalWorkflowItemToDetail } from '../utils/mapApiApprovalWorkflows'
import { mapLeaveRequest, optionalNote } from './leaveMappers'
import { mapPendingApprovalsToRequests } from '../utils/mapApiLeaveRequest'

function workflowNoteBody(note?: string): Record<string, string> {
  const trimmed = optionalNote(note)
  return trimmed ? { note: trimmed } : {}
}

function readWorkflowLeaveResponse(data: unknown): LeaveRequest {
  const mapped = mapLeaveRequest(data)
  if (!mapped) throw new Error('Invalid leave response after workflow action')
  return mapped
}

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
    /** GET /leave-approval/workflows — configured approval workflows. */
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
        return mapPendingApprovalsToRequests(pending.items)
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
    /** POST /leave-approval/workflows — create workflow. */
    createApprovalWorkflow: build.mutation<ApprovalWorkflowDetailView, CreateApprovalWorkflowBody>({
      query: (body) => ({ url: '/leave-approval/workflows', method: 'POST', body }),
      transformResponse: (response: ApiResponse<unknown>) =>
        mapApiApprovalWorkflowItemToDetail(normalizeApprovalWorkflowDetail(unwrapData(response))),
      invalidatesTags: [{ type: 'Leave', id: 'APPROVAL-WORKFLOWS' }],
    }),
    /** PATCH /leave-approval/workflows/:id — update workflow. */
    updateApprovalWorkflow: build.mutation<
      ApprovalWorkflowDetailView,
      { id: string; body: UpdateApprovalWorkflowBody }
    >({
      query: ({ id, body }) => ({
        url: `/leave-approval/workflows/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        mapApiApprovalWorkflowItemToDetail(normalizeApprovalWorkflowDetail(unwrapData(response))),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Leave', id: 'APPROVAL-WORKFLOWS' },
        { type: 'Leave', id: `APPROVAL-WORKFLOW-${id}` },
      ],
    }),
    /** DELETE /leave-approval/workflows/:id — deactivate workflow. */
    deactivateApprovalWorkflow: build.mutation<void, string>({
      query: (id) => ({
        url: `/leave-approval/workflows/${encodeURIComponent(id)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Leave', id: 'APPROVAL-WORKFLOWS' },
        { type: 'Leave', id: `APPROVAL-WORKFLOW-${id}` },
      ],
    }),
    /** POST /leave-approval/:leaveRequestId/approve — current workflow level. */
    approveWorkflowLeave: build.mutation<LeaveRequest, { leaveRequestId: string; note?: string }>({
      query: ({ leaveRequestId, note }) => ({
        url: `/leave-approval/${encodeURIComponent(leaveRequestId)}/approve`,
        method: 'POST',
        body: workflowNoteBody(note),
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        readWorkflowLeaveResponse(unwrapData(response)),
      invalidatesTags: (_result, _error, { leaveRequestId }) => [
        { type: 'Leave', id: 'APPROVAL-PENDING' },
        { type: 'Leave', id: 'LIST' },
        { type: 'Leave', id: 'CALENDAR' },
        { type: 'Leave', id: 'BALANCE' },
        { type: 'Leave', id: `APPROVAL-HISTORY-${leaveRequestId}` },
        { type: 'Leave', id: leaveRequestId },
      ],
    }),
    /** POST /leave-approval/:leaveRequestId/reject — current workflow level. */
    rejectWorkflowLeave: build.mutation<LeaveRequest, { leaveRequestId: string; note?: string }>({
      query: ({ leaveRequestId, note }) => ({
        url: `/leave-approval/${encodeURIComponent(leaveRequestId)}/reject`,
        method: 'POST',
        body: workflowNoteBody(note),
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        readWorkflowLeaveResponse(unwrapData(response)),
      invalidatesTags: (_result, _error, { leaveRequestId }) => [
        { type: 'Leave', id: 'APPROVAL-PENDING' },
        { type: 'Leave', id: 'LIST' },
        { type: 'Leave', id: 'CALENDAR' },
        { type: 'Leave', id: 'BALANCE' },
        { type: 'Leave', id: `APPROVAL-HISTORY-${leaveRequestId}` },
        { type: 'Leave', id: leaveRequestId },
      ],
    }),
  }),
})

export const {
  useGetApprovalWorkflowsQuery,
  useGetApprovalWorkflowByIdQuery,
  useGetPendingApprovalsQuery,
  useGetLeaveApprovalHistoryQuery,
  useApproveWorkflowLeaveMutation,
  useRejectWorkflowLeaveMutation,
  useCreateApprovalWorkflowMutation,
  useUpdateApprovalWorkflowMutation,
  useDeactivateApprovalWorkflowMutation,
} = leaveApprovalApi