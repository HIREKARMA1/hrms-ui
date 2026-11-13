/**
 * Summary card inside request detail dialog (dates, balance, reason).
 */

import type { ReactNode } from 'react'

import type { LeaveRequest } from '../../types/leaveRequest'
import { formatDate } from '../../utils/formatDate'

type RequestDetailSummaryProps = {
  request: LeaveRequest
  balanceBefore: number
  balanceAfter: number
}

export function RequestDetailSummary({ request, balanceBefore, balanceAfter }: RequestDetailSummaryProps) {
  const balanceHint = request.status === 'Pending' ? 'If approved' : 'After booking'

  return (
    <section className="rounded-xl border border-hrms-border bg-hrms-muted-bg/50 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-hrms-text-muted">Summary</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <Fact label="Leave dates" value={`${formatDate(request.fromDate)} – ${formatDate(request.toDate)}`} />
        <Fact label="Duration" value={`${request.days} day${request.days === 1 ? '' : 's'}`} />
        <Fact label="Applied on" value={formatDate(request.appliedOn)} />
        <Fact label="Balance impact">
          <p className="text-sm text-hrms-navy">
            <span className="tabular-nums">{balanceBefore}</span>
            <span className="text-hrms-text-muted"> → </span>
            <span className="tabular-nums font-semibold">{balanceAfter}</span>
            <span className="text-hrms-text-muted"> days</span>
          </p>
          <p className="mt-0.5 text-xs text-hrms-text-secondary">{balanceHint}</p>
        </Fact>
        <Fact label="Reason" value={request.reason} className="sm:col-span-2" multiline />
        {request.attachmentName ? (
          <Fact label="Attachment" value={request.attachmentName} className="sm:col-span-2" />
        ) : null}
      </div>
    </section>
  )
}

function Fact({
  label,
  value,
  children,
  className,
  multiline,
}: {
  label: string
  value?: string
  children?: ReactNode
  className?: string
  multiline?: boolean
}) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-hrms-text-secondary">{label}</p>
      {children ?? (
        <p className={`mt-1 text-sm text-hrms-navy ${multiline ? 'whitespace-pre-wrap' : ''}`}>{value}</p>
      )}
    </div>
  )
}
