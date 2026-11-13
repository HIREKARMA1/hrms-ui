/**
 * Side sheet showing leave request details, balance impact, and step timeline.
 * Opened from My Leave and Approvals tables.
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

import { LEAVE_TYPE_LABELS, type LeaveTypeCode } from '../../constants/leaveTypeCodes'
import type { LeaveRequest } from '../../types/leaveRequest'
import { formatDate } from '../../utils/formatDate'
import { LeaveStatusPill } from '../LeaveStatusPill'

type RequestDetailSheetProps = {
  open: boolean
  request: LeaveRequest | null
  balanceBefore: number
  balanceAfter: number
  onOpenChange: (open: boolean) => void
}

export function RequestDetailSheet({
  open,
  request,
  balanceBefore,
  balanceAfter,
  onOpenChange,
}: RequestDetailSheetProps) {
  if (!request) {
    return null
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Request details</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto py-4 text-sm">
          <p>
            <span className="font-semibold">Type:</span>{' '}
            {LEAVE_TYPE_LABELS[request.leaveTypeCode as LeaveTypeCode] ?? request.leaveTypeCode}
          </p>
          <p>
            <span className="font-semibold">Dates:</span> {formatDate(request.fromDate)} – {formatDate(request.toDate)}
          </p>
          <p>
            <span className="font-semibold">Days:</span> {request.days}
            {request.lwpDays ? ` (incl. ${request.lwpDays} LWP)` : ''}
          </p>
          <p>
            <span className="font-semibold">Reason:</span> {request.reason}
          </p>
          {request.attachmentName ? (
            <p>
              <span className="font-semibold">Attachment:</span> {request.attachmentName}
            </p>
          ) : null}
          <p>
            <span className="font-semibold">Balance:</span> {balanceBefore} → {balanceAfter}
          </p>
          <div>
            <p className="mb-2 font-semibold text-hrms-navy">Timeline</p>
            <ul className="space-y-2">
              {request.steps.map((step) => (
                <li key={step.id} className="rounded-lg border border-hrms-border p-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <LeaveStatusPill status={step.kind} />
                    <span className="text-hrms-text-muted">{formatDate(step.at)}</span>
                  </div>
                  <p>
                    {step.actorName}
                    {step.onBehalfOfName ? ` on behalf of ${step.onBehalfOfName}` : ''}
                  </p>
                  {step.comment ? <p className="text-hrms-text-secondary">{step.comment}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
