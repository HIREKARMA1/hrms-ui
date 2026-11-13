/**
 * Small approval step diagram for the leave type edit dialog.
 */

import type { LeaveTypePolicy } from '../../../types/leaveSettings'
import { formatApprovalFlow } from '../../../utils/formatApprovalFlow'

export function ApprovalStepDiagram({ policy }: { policy: LeaveTypePolicy }) {
  const steps = formatApprovalFlow(policy)
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs text-hrms-navy" aria-label="Approval steps">
      {steps.map((step, index) => (
        <span key={`${step}-${index}`} className="inline-flex items-center gap-1">
          <span className="rounded-md bg-hrms-muted-bg px-2 py-1 font-medium">{step}</span>
          {index < steps.length - 1 ? <span className="text-hrms-text-muted" aria-hidden>{'→'}</span> : null}
        </span>
      ))}
    </div>
  )
}
