/**
 * Leave request details dialog with facts grid, timeline, and role-based footer actions.
 */

import * as Dialog from '@radix-ui/react-dialog'
import { FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { LeaveRequest } from '../../types/leaveRequest'
import { formatDate } from '../../utils/formatDate'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { RequestTimeline } from '../RequestTimeline'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'
import { LEAVE_SECONDARY_BUTTON } from '../shared/leaveUi'
import { RequestDetailSummary } from './RequestDetailSummary'

type RequestDetailDialogProps = {
  open: boolean
  request: LeaveRequest | null
  employeeName?: string
  /** Null when no ledger balance is known; the summary then shows the paid / loss-of-pay split. */
  balanceBefore: number | null
  balanceAfter: number | null
  onOpenChange: (open: boolean) => void
  canApprove?: boolean
  canReject?: boolean
  onApprove?: () => void
  onReject?: () => void
}

export function RequestDetailDialog({
  open,
  request,
  employeeName,
  balanceBefore,
  balanceAfter,
  onOpenChange,
  canApprove,
  canReject,
  onApprove,
  onReject,
}: RequestDetailDialogProps) {
  if (!request) return null

  const title = employeeName ?? 'Request details'
  const subtitle = requestSubtitle(request, employeeName)
  const showActions = Boolean((canApprove && onApprove) || (canReject && onReject))

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="lg">
        <LeaveDialogHeader title={title} subtitle={subtitle} icon={FileText}>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <LeaveTypeChip code={request.leaveTypeCode} />
            <LeaveStatusPill status={request.currentStepLabel} />
            {request.escalated ? <LeaveStatusPill status="Escalated" /> : null}
          </div>
        </LeaveDialogHeader>
        <LeaveDialogBody className="space-y-5">
          <RequestDetailSummary request={request} balanceBefore={balanceBefore} balanceAfter={balanceAfter} />
          <section className="rounded-xl border border-hrms-border bg-white p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-hrms-text-muted">Activity</h3>
            <div className="mt-3">
              <RequestTimeline steps={request.steps} />
            </div>
          </section>
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <div className="flex w-full flex-wrap items-center justify-end gap-2">
            <Dialog.Close asChild>
              <Button type="button" variant="outline" className={LEAVE_SECONDARY_BUTTON}>
                Close
              </Button>
            </Dialog.Close>
            {showActions && canReject && onReject ? (
              <Button
                type="button"
                variant="outline"
                className="border-hrms-danger/25 text-hrms-danger hover:bg-hrms-danger/5"
                onClick={onReject}
              >
                Reject
              </Button>
            ) : null}
            {showActions && canApprove && onApprove ? (
              <Button type="button" onClick={onApprove}>
                Approve
              </Button>
            ) : null}
          </div>
        </LeaveDialogFooter>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}

function requestSubtitle(request: LeaveRequest, employeeName?: string) {
  const applied = `Applied ${formatDate(request.appliedOn)}`
  const duration = `${request.days} day${request.days === 1 ? '' : 's'}`
  const id = `Ref ${request.id}`
  if (employeeName) return `Leave request · ${applied} · ${duration} · ${id}`
  return `${applied} · ${duration} · ${id}`
}
