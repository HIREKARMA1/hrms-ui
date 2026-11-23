import { cn } from '@/lib/utils'

import { ADMIN_REQUEST_ISSUE_LABELS } from '../constants/issueOptions'
import type { AdminRequestIssue } from '../types/adminSupportRequest'

const ISSUE_STYLES: Record<AdminRequestIssue, string> = {
  employee_id: 'border-slate-200 bg-slate-50 text-slate-700',
  password: 'border-brand-200 bg-brand-50 text-brand-800',
  other: 'border-amber-200 bg-amber-50 text-amber-900',
}

export function AdminRequestIssueBadges({
  issues,
  className,
}: {
  issues: AdminRequestIssue[]
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {issues.map((issue) => (
        <span
          key={issue}
          className={cn(
            'inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
            ISSUE_STYLES[issue],
          )}
        >
          {ADMIN_REQUEST_ISSUE_LABELS[issue]}
        </span>
      ))}
    </div>
  )
}