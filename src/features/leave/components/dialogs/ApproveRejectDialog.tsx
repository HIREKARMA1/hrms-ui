/**
 * Approve or reject a leave request with optional or required comment.
 */

import { CheckCircle2, XCircle } from 'lucide-react'
import { useState } from 'react'

import type { LeaveRequest } from '../../types/leaveRequest'
import { formatDate } from '../../utils/formatDate'
import { LeaveDialogField } from '../shared/LeaveDialogField'
import { LEAVE_DIALOG_TEXTAREA } from '../shared/leaveUi'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogFooterActions,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'

type ApproveRejectDialogProps = {
  open: boolean
  mode: 'approve' | 'reject'
  request: LeaveRequest | null
  employeeName: string
  onOpenChange: (open: boolean) => void
  onConfirm: (comment: string) => void
  loading?: boolean
}

export function ApproveRejectDialog({
  open,
  mode,
  request,
  employeeName,
  onOpenChange,
  onConfirm,
  loading,
}: ApproveRejectDialogProps) {
  const [comment, setComment] = useState('')
  if (!request) return null
  const summary = `${employeeName} · ${formatDate(request.fromDate)} – ${formatDate(request.toDate)} · ${request.days} days`

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="sm">
        <LeaveDialogHeader
          title={mode === 'approve' ? 'Approve request' : 'Reject request'}
          subtitle={summary}
          icon={mode === 'approve' ? CheckCircle2 : XCircle}
        />
        <LeaveDialogBody>
          <LeaveDialogField label={mode === 'reject' ? 'Comment (required)' : 'Comment (optional)'} htmlFor="ar-comment" required={mode === 'reject'}>
            <textarea id="ar-comment" rows={3} className={LEAVE_DIALOG_TEXTAREA} value={comment} onChange={(e) => setComment(e.target.value)} />
          </LeaveDialogField>
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <LeaveDialogFooterActions
            primaryLabel={mode === 'approve' ? 'Approve' : 'Reject'}
            primaryVariant={mode === 'reject' ? 'danger' : 'default'}
            loading={loading}
            primaryDisabled={mode === 'reject' && !comment.trim()}
            onPrimary={() => { onConfirm(comment); onOpenChange(false); setComment('') }}
          />
        </LeaveDialogFooter>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}
