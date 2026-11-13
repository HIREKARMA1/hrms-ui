/**
 * Table empty state with icon, short copy, and primary action.
 * Used inside payroll table cards when filters return no rows.
 */

import { FileSearch } from 'lucide-react'
import type { ReactNode } from 'react'

type PayrollEmptyStateProps = {
  message: string
  action?: ReactNode
}

export function PayrollEmptyState({ message, action }: PayrollEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-sm text-hrms-text-secondary">
      <FileSearch className="h-8 w-8 text-hrms-text-muted" aria-hidden />
      <p>{message}</p>
      {action}
    </div>
  )
}
