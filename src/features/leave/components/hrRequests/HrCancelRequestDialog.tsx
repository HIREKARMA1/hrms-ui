/**
 * HR cancel request dialog with required reason (any status).
 */

import { useState } from 'react'

import type { LeaveRequest } from '../../types/leaveRequest'
import { LeaveDialogBody, LeaveDialogContent, LeaveDialogFooter, LeaveDialogFooterActions, LeaveDialogHeader, LeaveDialogRoot } from '../shared/LeaveDialog'
import { LEAVE_DIALOG_TEXTAREA } from '../shared/leaveUi'

type HrCancelRequestDialogProps = {
  request: LeaveRequest | null
  employeeName: string
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
}

export function HrCancelRequestDialog({ request, employeeName, onOpenChange, onConfirm }: HrCancelRequestDialogProps) {
  const [reason, setReason] = useState('')
  return (
    <LeaveDialogRoot open={request != null} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="sm">
        <LeaveDialogHeader title="Cancel request?" subtitle={`${employeeName} · ${request?.leaveTypeCode ?? ''}`} />
        <LeaveDialogBody>
          <label htmlFor="hr-cancel-reason" className="text-sm font-medium text-hrms-navy">
            Reason (required)
          </label>
          <textarea id="hr-cancel-reason" className={`mt-2 ${LEAVE_DIALOG_TEXTAREA}`} value={reason} onChange={(event) => setReason(event.target.value)} />
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <LeaveDialogFooterActions primaryLabel="Cancel request" primaryVariant="danger" primaryDisabled={!reason.trim()} onPrimary={() => onConfirm(reason.trim())} />
        </LeaveDialogFooter>
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}
