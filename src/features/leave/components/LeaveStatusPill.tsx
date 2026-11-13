/**
 * Workflow status pill with leading dot and readable contrast on tints.
 * Used in leave tables and detail sheets across tabs.
 */

import { cn } from '@/lib/utils'

import { leaveStatusPillClasses, leaveStatusPillDotClasses } from '../constants/leaveStatuses'

type LeaveStatusPillProps = {
  status: string
  className?: string
}

export function LeaveStatusPill({ status, className }: LeaveStatusPillProps) {
  const tone = leaveStatusPillClasses[status] ?? leaveStatusPillClasses.Cancelled
  const dot = leaveStatusPillDotClasses[status] ?? 'bg-hrms-text-muted'
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 truncate rounded-full px-2.5 py-0.5 text-xs font-medium',
        tone,
        className,
      )}
      title={status}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dot)} aria-hidden />
      {status}
    </span>
  )
}
