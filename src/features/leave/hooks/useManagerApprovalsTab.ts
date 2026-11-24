/**
 * Queue data and actions for the manager Approvals tab. Server snapshots act
 * through the leave API; comp-off has no server endpoint.
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
import { useLeaveApiActions } from './useLeaveApiActions'

type ToastFn = (message: string) => void

export function useManagerApprovalsTab(
  snapshot: LeaveSnapshot | null,
  viewer: LeaveViewer,
  reload: () => Promise<void>,
  showToast: ToastFn,
) {
  const server = useLeaveApiActions()
  // The team is found through the manager's employee record; without one the queues are empty.
  const managerId = viewer.employeeId
  const fromServer = Boolean(snapshot?.api)

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
    if (fromServer) {
      const request = snapshot?.requests.find((item) => item.id === id)
      if (!request) return
      const result = mode === 'approve' ? await server.approve(request, comment) : await server.reject(request, comment)
      showToast(result.ok ? (mode === 'approve' ? 'Request approved.' : 'Request rejected.') : result.message)
      return
    }
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
    if (fromServer) {
      const result = mode === 'approve' ? await server.approveEncashment(id) : await server.rejectEncashment(id)
      showToast(result.ok ? (mode === 'approve' ? 'Encashment approved.' : 'Encashment rejected.') : result.message)
      return
    }
    resolveEncashmentRequest(id, mode)
    showToast(mode === 'approve' ? 'Encashment approved.' : 'Encashment rejected.')
    await reload()
  }

  async function runCompOffAction(id: string, mode: 'approve' | 'reject') {
    if (fromServer) {
      showToast('Comp-off requests are not available from the server yet.')
      return
    }
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
