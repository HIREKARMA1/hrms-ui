/**
 * Employee workflow approvals: GET /leave-approval/pending and POST approve/reject.
 */

import { useMemo, useState } from 'react'

import { useLeave } from '../../hooks/useLeave'
import { useEmployeeWorkflowApprovalsTab } from '../../hooks/useEmployeeWorkflowApprovalsTab'
import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import type { LeaveViewer } from '../../types/viewer'
import type { LeaveRequest } from '../../types/leaveRequest'
import { canUserActOnLeaveRequest, mergeLeaveRequestForWorkflowAction } from '../../utils/leaveWorkflowApproval'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { LeaveEmployeeLinkNotice } from '../shared/LeaveEmployeeLinkNotice'
import { WorkflowApproverQueueNotice } from '../shared/WorkflowApproverQueueNotice'
import { LeaveErrorState } from '../LeaveErrorState'
import { ApproveRejectDialog } from '../dialogs/ApproveRejectDialog'
import { RequestDetailDialog } from '../dialogs/RequestDetailDialog'
import { ApprovalsLeaveTable } from './ApprovalsLeaveTable'
import { ledgerBalanceForType } from '../../utils/calculateBalance'

type EmployeeApprovalsTabProps = { viewer: LeaveViewer }

export function EmployeeApprovalsTab({ viewer }: EmployeeApprovalsTabProps) {
  const { snapshot, reload } = useLeave()
  const { showToast } = useLeaveToast()
  const queues = useEmployeeWorkflowApprovalsTab(snapshot, reload, showToast)
  const permissions = useLeavePermissions()
  const [detail, setDetail] = useState<LeaveRequest | null>(null)
  const [action, setAction] = useState<{ mode: 'approve' | 'reject'; request: LeaveRequest } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const actionableLeaveIds = useMemo(() => new Set(queues.pendingLeave.map((row) => row.id)), [queues.pendingLeave])

  if (!snapshot) return null
  const { requests: snapshotRequests } = snapshot
  const nameFor = (id: string) => snapshot.employees.find((item) => item.id === id)?.name ?? id
  const detailCanAct = detail ? canUserActOnLeaveRequest(detail, actionableLeaveIds) : false

  function workflowRequest(row: LeaveRequest): LeaveRequest {
    return mergeLeaveRequestForWorkflowAction(row, snapshotRequests)
  }

  async function confirmLeave(comment: string) {
    if (!action) return
    setBusyId(action.request.id)
    await queues.runLeaveAction(action.request.id, action.mode, comment)
    setBusyId(null)
    setAction(null)
    setDetail(null)
  }

  const detailBalance =
    detail && !snapshot.api ? ledgerBalanceForType(snapshot.ledger, detail.employeeId, detail.leaveTypeCode) : null

  return (
    <div className="space-y-6">
      <LeaveTabHeader
        title="Approvals"
        subtitle="Leave requests assigned to you in a multi-level approval workflow (from GET /leave-approval/pending)."
      />
      {queues.skippedNoEmployeeLink ? <WorkflowApproverQueueNotice /> : null}
      {!snapshot.api && !viewer.employeeId ? <LeaveEmployeeLinkNotice /> : null}
      {queues.pendingLeaveError ? (
        <LeaveErrorState message={queues.pendingLeaveError} onRetry={queues.refetchPendingLeave} />
      ) : null}
      {queues.pendingLeaveLoading ? (
        <p className="text-xs text-hrms-text-muted">Loading your approval queue…</p>
      ) : null}
      <ApprovalsLeaveTable
        rows={queues.pendingLeave}
        employeeName={nameFor}
        onView={setDetail}
        onApprove={(id) => {
          const row = queues.pendingLeave.find((item) => item.id === id)
          if (row) setAction({ mode: 'approve', request: workflowRequest(row) })
        }}
        onReject={(id) => {
          const row = queues.pendingLeave.find((item) => item.id === id)
          if (row) setAction({ mode: 'reject', request: workflowRequest(row) })
        }}
        busyId={busyId}
      />
      <ApproveRejectDialog
        open={Boolean(action)}
        mode={action?.mode ?? 'approve'}
        request={action?.request ?? null}
        employeeName={action ? nameFor(action.request.employeeId) : ''}
        onOpenChange={(open) => !open && setAction(null)}
        onConfirm={(comment) => void confirmLeave(comment)}
        loading={Boolean(busyId)}
      />
      <RequestDetailDialog
        open={Boolean(detail)}
        request={detail}
        employeeName={detail ? detail.employeeName ?? nameFor(detail.employeeId) : undefined}
        balanceBefore={detailBalance}
        balanceAfter={detail && detailBalance !== null ? detailBalance - detail.days : null}
        onOpenChange={(open) => !open && setDetail(null)}
        canApprove={permissions.canApprove && detailCanAct}
        canReject={permissions.canApprove && detailCanAct}
        onApprove={() => detail && setAction({ mode: 'approve', request: workflowRequest(detail) })}
        onReject={() => detail && setAction({ mode: 'reject', request: workflowRequest(detail) })}
        useLiveApi={Boolean(snapshot.api)}
        useLiveApprovalHistory={Boolean(snapshot.api)}
      />
    </div>
  )
}