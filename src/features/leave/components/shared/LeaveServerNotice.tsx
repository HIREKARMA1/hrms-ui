/**
 * Inline notices for server-backed leave screens: data the backend does not
 * provide yet, and in-panel loading.
 */

import type { ReactNode } from 'react'

export function LeaveServerNotice({ children }: { children: ReactNode }) {
  return (
    <div role="note" className="rounded-xl border border-hrms-border bg-hrms-muted-bg/60 px-4 py-3 text-sm text-hrms-text-secondary">
      {children}
    </div>
  )
}

export function LeaveInlineLoading({ label }: { label: string }) {
  return (
    <p role="status" aria-live="polite" className="px-1 py-6 text-sm text-hrms-text-secondary">
      {label}
    </p>
  )
}
