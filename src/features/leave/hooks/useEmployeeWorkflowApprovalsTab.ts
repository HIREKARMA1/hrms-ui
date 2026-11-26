/**
 * Workflow approver queue for employees (GET /leave-approval/pending only — no manager mock queue).
 */

import { useMemo } from 'react'

import type { LeaveSnapshot } from '../services/leaveService'
import { mergeLeaveRequestForWorkflowAction } from '../utils/leaveWorkflowApproval'
import { useApprovalsPendingLeave } from './useApprovalsPendingLeave'
import { useLeaveApiActions } from './useLeaveApiActions'

type ToastFn = (message: string) => void

export function useEmployeeWorkflowApprovalsTab(
  snapshot: LeaveSnapshot | null,
  reload: () => Promise<void>,
  showToast: ToastFn,
) {
  const server = useLeaveApiActions()
  const fromServer = Boolean(snapshot?.api)
  const pendingLeaveApi = useApprovalsPendingLeave([])

  const pendingLeave = useMemo(() => {
    if (fromServer && (pendingLeaveApi.blockingError || pendingLeaveApi.skippedNoEmployeeLink)) return []
    if (fromServer && pendingLeaveApi.useLiveApi) return pendingLeaveApi.rows
    return []
  }, [
    fromServer,
    pendingLeaveApi.blockingError,
    pendingLeaveApi.rows,
    pendingLeaveApi.skippedNoEmployeeLink,
    pendingLeaveApi.useLiveApi,
  ])

  async function runLeaveAction(requestId: string, mode: 'approve' | 'reject', comment: string) {
    const queued = pendingLeave.find((item) => item.id === requestId)
    const request = queued
      ? mergeLeaveRequestForWorkflowAction(queued, snapshot?.requests ?? [])
      : snapshot?.requests.find((item) => item.id === requestId)
    if (!request) return

    if (fromServer) {
      const result = mode === 'approve' ? await server.approve(request, comment) : await server.reject(request, comment)
      showToast(result.ok ? (mode === 'approve' ? 'Request approved.' : 'Request rejected.') : result.message)
      if (result.ok) await reload()
      return
    }
    showToast('Workflow approvals require a signed-in account with server data.')
  }

  return {
    pendingLeave,
    pendingLeaveLoading: fromServer && pendingLeaveApi.isFetching,
    pendingLeaveError: fromServer ? pendingLeaveApi.errorMessage : null,
    pendingEmployeeLinkRequired: fromServer ? pendingLeaveApi.employeeLinkRequired : false,
    skippedNoEmployeeLink: fromServer ? pendingLeaveApi.skippedNoEmployeeLink : false,
    blockingError: fromServer ? pendingLeaveApi.blockingError : false,
    refetchPendingLeave: fromServer ? pendingLeaveApi.refetch : undefined,
    runLeaveAction,
  }
}