/**
 * Row-level approve, reject, and link actions for payroll tables.
 * Keeps action button styling consistent across variable pay and settlement.
 */

import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

import { PAYROLL_MOTION } from './payrollUi'

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
        PAYROLL_MOTION,
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
        'inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium',
        'text-hrms-danger hover:bg-hrms-danger/5',
        'disabled:cursor-not-allowed disabled:opacity-50',
        PAYROLL_MOTION,
      )}
    >
      {children}
    </button>
  )
}

export function RowLinkButton({ onClick, children }: RowActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-0.5 text-sm font-medium text-hrms-primary hover:text-hrms-primary-hover',
        PAYROLL_MOTION,
      )}
    >
      {children}
      <ChevronRight className="h-4 w-4" aria-hidden />
    </button>
  )
}
