/**
 * Workflow status pill using existing hrms token classes without new colors.
 * Used in leave tables and detail sheets across tabs.
 */

import { cn } from '@/lib/utils'

import { leaveStatusPillClasses } from '../constants/leaveStatuses'

type LeaveStatusPillProps = {
  status: string
  className?: string
}

export function LeaveStatusPill({ status, className }: LeaveStatusPillProps) {
  const tone = leaveStatusPillClasses[status] ?? leaveStatusPillClasses.Cancelled
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tone,
        className,
      )}
    >
      {status}
    </span>
  )
}
