/**
 * Dialogs mounted by ApprovalsTab (detail, delegate, approve/reject).
 */

import type { LeaveSnapshot } from '../../services/leaveService'
import type { LeaveRequest } from '../../types/leaveRequest'
import { ledgerBalanceForType } from '../../utils/calculateBalance'
import { ApproveRejectDialog } from '../dialogs/ApproveRejectDialog'
import { RequestDetailDialog } from '../dialogs/RequestDetailDialog'
import { SetDelegateDialog } from '../dialogs/SetDelegateDialog'

type ApprovalsTabDialogsProps = {
  snapshot: LeaveSnapshot
  detail: LeaveRequest | null
  setDetail: (row: LeaveRequest | null) => void
  delegateOpen: boolean
  setDelegateOpen: (open: boolean) => void
  onDelegateSaved: () => void
  action: { mode: 'approve' | 'reject'; request: LeaveRequest } | null
  setAction: (value: { mode: 'approve' | 'reject'; request: LeaveRequest } | null) => void
  busy: boolean
  onConfirmAction: (comment: string) => void
  viewerCanAct: boolean
  onApproveFromDetail: () => void
  onRejectFromDetail: () => void
}

export function ApprovalsTabDialogs(props: ApprovalsTabDialogsProps) {
  const nameFor = (id: string) => props.snapshot.employees.find((e) => e.id === id)?.name ?? id
  const req = props.detail

  return (
    <>
      <SetDelegateDialog open={props.delegateOpen} onOpenChange={props.setDelegateOpen} onSubmit={props.onDelegateSaved} />
      <ApproveRejectDialog
        open={Boolean(props.action)}
        mode={props.action?.mode ?? 'approve'}
        request={props.action?.request ?? null}
        employeeName={props.action ? nameFor(props.action.request.employeeId) : ''}
        onOpenChange={(open) => !open && props.setAction(null)}
        onConfirm={props.onConfirmAction}
        loading={props.busy}
      />
      <RequestDetailDialog
        open={Boolean(req)}
        request={req}
        employeeName={req ? nameFor(req.employeeId) : undefined}
        balanceBefore={req ? ledgerBalanceForType(props.snapshot.ledger, req.employeeId, req.leaveTypeCode) : 0}
        balanceAfter={req ? ledgerBalanceForType(props.snapshot.ledger, req.employeeId, req.leaveTypeCode) - req.days : 0}
        onOpenChange={(open) => !open && props.setDetail(null)}
        canApprove={props.viewerCanAct}
        canReject={props.viewerCanAct}
        onApprove={props.onApproveFromDetail}
        onReject={props.onRejectFromDetail}
      />
    </>
  )
}
