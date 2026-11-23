/**
 * Empty table or list state with muted icon and optional primary action.
 * Used when filters return no leave rows.
 */

import { FileSearch } from 'lucide-react'
import type { ReactNode } from 'react'

type LeaveEmptyStateProps = {
  message: string
  action?: ReactNode
}

export function LeaveEmptyState({ message, action }: LeaveEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-sm text-hrms-text-secondary">
      <FileSearch className="h-8 w-8 text-hrms-text-muted" aria-hidden />
      <p>{message}</p>
      {action}
    </div>
  )
}
