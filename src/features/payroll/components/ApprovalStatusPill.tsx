/**
 * Workflow status pill reusing StatusPill token classes without new colors.
 * Used in Variable Pay and Final Settlement tables.
 */

import { cn } from '@/lib/utils'

import { approvalPillClasses, approvalPillDotClasses } from '../constants/approvalStatuses'

type ApprovalStatusPillProps = {
  status: string
  className?: string
}

export function ApprovalStatusPill({ status, className }: ApprovalStatusPillProps) {
  const tone = approvalPillClasses[status] ?? approvalPillClasses.Draft
  const dot = approvalPillDotClasses[status] ?? approvalPillDotClasses.Draft
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
        tone,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dot)} aria-hidden />
      {status}
    </span>
  )
}
