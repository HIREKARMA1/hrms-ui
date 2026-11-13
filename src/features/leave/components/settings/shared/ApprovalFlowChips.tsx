/**
 * Step chips for leave type approval flow in settings tables.
 */

import { formatApprovalFlow } from '../../../utils/formatApprovalFlow'
import type { LeaveTypePolicy } from '../../../types/leaveSettings'

export function ApprovalFlowChips({ policy }: { policy: LeaveTypePolicy }) {
  const steps = formatApprovalFlow(policy)
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      {steps.map((step, index) => (
        <span key={`${step}-${index}`} className="inline-flex items-center gap-1">
          <span className="rounded-md bg-hrms-muted-bg px-2 py-0.5 font-medium text-hrms-navy">{step}</span>
          {index < steps.length - 1 ? <span className="text-hrms-text-muted" aria-hidden>{'>'}</span> : null}
        </span>
      ))}
    </div>
  )
}
