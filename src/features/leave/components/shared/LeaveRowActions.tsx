/**
 * Row-level view, approve, and reject actions for leave tables.
 * Matches payroll row action styling without cross-feature imports.
 */

import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

import { LEAVE_MOTION } from './leaveUi'

type RowActionProps = {
  onClick: () => void
  children?: string
  disabled?: boolean
}

export function ApproveRowButton({ onClick, children = 'Approve', disabled }: RowActionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium',
        'bg-hrms-success/10 text-hrms-success hover:bg-hrms-success/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        LEAVE_MOTION,
      )}
    >
      {children}
    </button>
  )
}

export function RejectRowButton({ onClick, children = 'Reject', disabled }: RowActionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center rounded-lg border border-hrms-danger/20 px-3 text-sm font-medium',
        'text-hrms-danger hover:bg-hrms-danger/5',
        'disabled:cursor-not-allowed disabled:opacity-50',
        LEAVE_MOTION,
      )}
    >
      {children}
    </button>
  )
}

export function RowLinkButton({ onClick, children, disabled }: RowActionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-0.5 text-sm font-medium text-hrms-primary hover:text-hrms-primary-hover',
        'disabled:cursor-not-allowed disabled:opacity-50',
        LEAVE_MOTION,
      )}
    >
      {children}
      <ChevronRight className="h-4 w-4" aria-hidden />
    </button>
  )
}
