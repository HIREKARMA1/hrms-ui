/**
 * Colored status label pill for payroll payment states.
 * Used in EmployeeTable and EmployeeDetailPanel header.
 */

import { cn } from '@/lib/utils'

import { statusPillClasses, statusPillDotClasses } from '../constants/paymentStatuses'
import type { PaymentStatus } from '../types/payroll'

type StatusPillProps = {
  status: PaymentStatus
  className?: string
}

export function StatusPill({ status, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusPillClasses[status],
        className,
      )}
    >
      <span
        className={cn('h-1.5 w-1.5 shrink-0 rounded-full', statusPillDotClasses[status])}
        aria-hidden
      />
      {status}
    </span>
  )
}
