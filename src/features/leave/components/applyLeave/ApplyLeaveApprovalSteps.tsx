/**
 * Compact vertical step list for apply-leave preview approval chain.
 */

import type { ResolvedApprovalStep } from '../../utils/getApprovalChain'

type Props = {
  onBehalf?: boolean
  applicantName: string
  submitterName?: string
  chain: ResolvedApprovalStep[]
}

export function ApplyLeaveApprovalSteps({ onBehalf, applicantName, submitterName, chain }: Props) {
  const steps = onBehalf
    ? [
        { key: 'applicant', title: 'Applicant', detail: applicantName },
        { key: 'submitter', title: 'Submitted by', detail: submitterName ?? 'HR' },
        ...chain.map((step) => ({ key: step.level, title: step.label, detail: step.approverName })),
      ]
    : [
        { key: 'you', title: 'You', detail: applicantName },
        ...chain.map((step) => ({ key: step.level, title: step.label, detail: step.approverName })),
      ]

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => (
        <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
          {index < steps.length - 1 ? (
            <span className="absolute left-[5px] top-2.5 h-[calc(100%-6px)] w-px bg-hrms-border" aria-hidden />
          ) : null}
          <span className="relative z-[1] mt-1.5 h-2 w-2 shrink-0 rounded-full bg-hrms-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-hrms-text-secondary">{step.title}</p>
            <p className="text-sm text-hrms-navy">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
