/**
 * Queue data and actions for the manager Approvals tab.
 */

import { useMemo } from 'react'

import type { LeaveViewer } from '../types/viewer'
import type { LeaveSnapshot } from '../services/leaveService'
import { approveRequest, rejectRequest } from '../services/leaveService'
import { resolveCompOffRequest, resolveEncashmentRequest } from '../services/managerQueueActions'
import {
  pendingManagerCompOffRequests,
  pendingManagerEncashments,
  pendingManagerLeaveRequests,
} from '../utils/managerApprovalsQueue'

type ToastFn = (message: string) => void

export function useManagerApprovalsTab(
  snapshot: LeaveSnapshot | null,
  viewer: LeaveViewer,
  reload: () => Promise<void>,
  showToast: ToastFn,
) {
  // The team is found through the manager's employee record; without one the queues are empty.
  const managerId = viewer.employeeId

  const pendingLeave = useMemo(
    () => (snapshot && managerId ? pendingManagerLeaveRequests(snapshot, managerId) : []),
    [managerId, snapshot],
  )
  const pendingEncashment = useMemo(
    () => (snapshot && managerId ? pendingManagerEncashments(snapshot, managerId) : []),
    [managerId, snapshot],
  )
  const pendingCompOff = useMemo(
    () => (snapshot && managerId ? pendingManagerCompOffRequests(snapshot, managerId) : []),
    [managerId, snapshot],
  )

  async function runLeaveAction(id: string, mode: 'approve' | 'reject', comment: string) {
    if (mode === 'approve') {
      approveRequest(id, viewer.actorId, viewer.displayName, 'Manager')
      showToast('Request approved.')
    } else {
      rejectRequest(id, viewer.actorId, viewer.displayName, comment.trim() || 'Not approved')
      showToast('Request rejected.')
    }
    await reload()
  }

  async function runEncashmentAction(id: string, mode: 'approve' | 'reject') {
    resolveEncashmentRequest(id, mode)
    showToast(mode === 'approve' ? 'Encashment approved.' : 'Encashment rejected.')
    await reload()
  }

  async function runCompOffAction(id: string, mode: 'approve' | 'reject') {
    resolveCompOffRequest(id, mode)
    showToast(mode === 'approve' ? 'Comp-off credit approved.' : 'Comp-off request rejected.')
    await reload()
  }

  return {
    pendingLeave,
    pendingEncashment,
    pendingCompOff,
    runLeaveAction,
    runEncashmentAction,
    runCompOffAction,
  }
}
