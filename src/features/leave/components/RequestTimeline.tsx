/**
 * Vertical step timeline with dots and connector for leave request sheets.
 * Shared by RequestDetailDialog and approval detail views.
 */

import { cn } from '@/lib/utils'

import type { LeaveRequest } from '../types/leaveRequest'
import { formatDate } from '../utils/formatDate'
import { leaveStepLabel, sortLeaveSteps } from '../utils/leaveStepLabels'

type RequestTimelineProps = {
  steps: LeaveRequest['steps']
}

const STEP_DOT: Partial<Record<LeaveRequest['steps'][0]['kind'], string>> = {
  applied: 'bg-hrms-primary',
  approval: 'bg-hrms-success',
  rejection: 'bg-hrms-danger',
  cancellation: 'bg-hrms-text-muted',
  escalation: 'bg-hrms-warning',
  delegation: 'bg-hrms-info',
}

export function RequestTimeline({ steps }: RequestTimelineProps) {
  const ordered = sortLeaveSteps(steps)

  return (
    <ul className="space-y-0">
      {ordered.map((step, index) => (
        <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
          {index < ordered.length - 1 ? (
            <span className="absolute left-[6px] top-3 h-[calc(100%-6px)] w-px bg-hrms-border" aria-hidden />
          ) : null}
          <span
            className={cn(
              'relative z-[1] mt-1.5 h-3 w-3 shrink-0 rounded-full ring-2 ring-white',
              STEP_DOT[step.kind] ?? 'bg-hrms-primary',
            )}
            aria-hidden
          />
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-hrms-navy">{leaveStepLabel(step.kind)}</p>
              <time className="text-xs tabular-nums text-hrms-text-muted" dateTime={step.at}>
                {formatDate(step.at)}
              </time>
            </div>
            <p className="mt-0.5 text-sm text-hrms-text-secondary">
              {step.actorName}
              {step.onBehalfOfName ? ` · on behalf of ${step.onBehalfOfName}` : ''}
              {step.level ? ` · ${step.level}` : ''}
            </p>
            {step.comment ? (
              <p className="mt-2 rounded-lg border border-hrms-border bg-white px-3 py-2 text-sm text-hrms-navy">
                {step.comment}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}
