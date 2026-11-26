/**
 * Approver queue membership and workflow copy for request detail / tables.
 */

import type { LeaveSnapshot } from '../services/leaveService'
import type { LeaveEmployee } from '../types/employee'
import type { LeaveRequest } from '../types/leaveRequest'

import { isHrActionRequest } from './attentionHrQueue'
import { filterHrRequests, mergeHrActionLeaveQueue } from './hrRequestsFilters'
import { pendingManagerLeaveRequests } from './managerApprovalsQueue'

/**
 * Prefer the full leave list row when the queue row omits workflow flags
 * (so approve/reject call POST /leave-approval, not POST /leaves/:id/approve).
 */
export function mergeLeaveRequestForWorkflowAction(
  row: LeaveRequest,
  catalog: readonly LeaveRequest[],
): LeaveRequest {
  const full = catalog.find((item) => item.id === row.id)
  if (!full) return row
  if (full.multiLevelWorkflow) {
    return { ...row, ...full, multiLevelWorkflow: true, currentStepLabel: full.currentStepLabel }
  }
  if (row.multiLevelWorkflow) return row
  return full
}

/** True when the viewer may approve/reject this pending request (queue is authoritative in API mode). */
export function canUserActOnLeaveRequest(request: LeaveRequest, actionableRequestIds: ReadonlySet<string>): boolean {
  if (request.status !== 'Pending') return false
  return actionableRequestIds.has(request.id)
}

/** HR "Needs my action" ids: workflow pending API ∪ single-level HR queue. */
export function hrActionableLeaveRequestIds(
  snapshot: LeaveSnapshot,
  employees: LeaveEmployee[],
  pendingWorkflowRows: LeaveRequest[],
  useLivePendingQueue: boolean,
): Set<string> {
  if (useLivePendingQueue) {
    const merged = mergeHrActionLeaveQueue(snapshot, employees, pendingWorkflowRows, '')
    return new Set(merged.map((row) => row.id))
  }
  return new Set(filterHrRequests(snapshot, employees, 'action', '').map((row) => row.id))
}

export function managerActionableLeaveRequestIds(snapshot: LeaveSnapshot, managerId: string | null): Set<string> {
  if (!managerId) return new Set()
  return new Set(pendingManagerLeaveRequests(snapshot, managerId).map((row) => row.id))
}

export type WorkflowApprovalNotice = { tone: 'info' | 'muted' | 'warning'; message: string }

/** Short callout for multi-level vs single-level pending requests in detail. */
export function leaveWorkflowApprovalNotice(request: LeaveRequest, canAct: boolean): WorkflowApprovalNotice | null {
  if (request.status !== 'Pending') return null

  if (request.multiLevelWorkflow) {
    if (canAct) {
      return {
        tone: 'info',
        message: 'This request uses a multi-level approval workflow. You can approve or reject at the current step.',
      }
    }
    return {
      tone: 'muted',
      message: `${request.currentStepLabel}. This workflow step is not assigned to you.`,
    }
  }

  if (canAct) {
    return { tone: 'info', message: 'This request is in your approval queue.' }
  }

  if (request.currentStepLabel.startsWith('Pending')) {
    return {
      tone: 'muted',
      message: `${request.currentStepLabel}. You are not in the approver queue for this request.`,
    }
  }

  return null
}

/** Mock-only HR check retained for dashboards that do not pass explicit queue ids. */
export function canHrActOnLeaveRequestMock(snapshot: LeaveSnapshot, request: LeaveRequest): boolean {
  return isHrActionRequest(snapshot, request)
}