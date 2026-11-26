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
import { mergeLeaveRequestForWorkflowAction } from '../utils/leaveWorkflowApproval'
import { useApprovalsPendingLeave } from './useApprovalsPendingLeave'
import { useLeaveApiActions } from './useLeaveApiActions'

type ToastFn = (message: string) => void

export function useManagerApprovalsTab(
  snapshot: LeaveSnapshot | null,
  viewer: LeaveViewer,
  reload: () => Promise<void>,
  showToast: ToastFn,
) {
  const server = useLeaveApiActions()
  const managerId = viewer.employeeId
  const fromServer = Boolean(snapshot?.api)

  const mockLeave = useMemo(
    () => (snapshot && managerId ? pendingManagerLeaveRequests(snapshot, managerId) : []),
    [managerId, snapshot],
  )
  const pendingLeaveApi = useApprovalsPendingLeave(mockLeave)

  const pendingLeave = useMemo(() => {
    if (fromServer && (pendingLeaveApi.blockingError || pendingLeaveApi.skippedNoEmployeeLink)) return []
    if (fromServer && pendingLeaveApi.useLiveApi) return pendingLeaveApi.rows
    return mockLeave
  }, [
    fromServer,
    mockLeave,
    pendingLeaveApi.blockingError,
    pendingLeaveApi.rows,
    pendingLeaveApi.skippedNoEmployeeLink,
    pendingLeaveApi.useLiveApi,
  ])

  const pendingEncashment = useMemo(
    () => (snapshot && managerId ? pendingManagerEncashments(snapshot, managerId) : []),
    [managerId, snapshot],
  )
  const pendingCompOff = useMemo(
    () => (snapshot && managerId ? pendingManagerCompOffRequests(snapshot, managerId) : []),
    [managerId, snapshot],
  )

  async function runLeaveAction(id: string, mode: 'approve' | 'reject', comment: string) {
    const queued =
      pendingLeave.find((item) => item.id === id) ?? snapshot?.requests.find((item) => item.id === id)
    if (!queued || !snapshot) return
    const request = mergeLeaveRequestForWorkflowAction(queued, snapshot.requests)

    if (fromServer) {
      const result = mode === 'approve' ? await server.approve(request, comment) : await server.reject(request, comment)
      showToast(result.ok ? (mode === 'approve' ? 'Request approved.' : 'Request rejected.') : result.message)
      if (result.ok) await reload()
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
      if (result.ok) await reload()
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
    pendingLeaveLoading: fromServer && pendingLeaveApi.isFetching,
    pendingLeaveError: fromServer ? pendingLeaveApi.errorMessage : null,
    pendingEmployeeLinkRequired: fromServer ? pendingLeaveApi.employeeLinkRequired : false,
    skippedNoEmployeeLink: fromServer ? pendingLeaveApi.skippedNoEmployeeLink : false,
    refetchPendingLeave: fromServer ? pendingLeaveApi.refetch : undefined,
    pendingEncashment,
    pendingCompOff,
    runLeaveAction,
    runEncashmentAction,
    runCompOffAction,
  }
}