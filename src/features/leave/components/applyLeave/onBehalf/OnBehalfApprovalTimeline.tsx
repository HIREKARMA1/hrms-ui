import type { ResolvedApprovalStep } from '../../../utils/getApprovalChain'

type OnBehalfApprovalTimelineProps = {
  applicantName: string
  submitterName?: string
  chain: ResolvedApprovalStep[]
}

export function OnBehalfApprovalTimeline({
  applicantName,
  submitterName,
  chain,
}: OnBehalfApprovalTimelineProps) {
  const steps = [
    { key: 'applicant', title: 'Applicant', detail: applicantName },
    { key: 'submitter', title: 'Submitted by', detail: submitterName ?? 'HR' },
    ...chain.map((step) => ({ key: step.level, title: step.label, detail: step.approverName })),
  ]

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => (
        <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
          {index < steps.length - 1 ? (
            <span
              className="absolute left-[4px] top-[14px] h-[calc(100%-4px)] w-0.5 bg-[#E2E6EF]"
              aria-hidden
            />
          ) : null}
          <span
            className="relative z-[1] mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full border-[3px] border-[#5938DB] bg-white"
            aria-hidden
          />
          <div className="min-w-0 flex-1 pt-0">
            <p className="text-[12.5px] text-[#667085]">{step.title}</p>
            <p className="text-sm font-semibold text-[#17213A]">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}