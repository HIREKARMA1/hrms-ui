/**
 * Title row with subtitle and optional actions for each leave tab.
 * Mirrors payroll tab header spacing without importing payroll code.
 */

import type { ReactNode } from 'react'

type LeaveTabHeaderProps = {
  title: string
  subtitle: string
  actions?: ReactNode
}

export function LeaveTabHeader({ title, subtitle, actions }: LeaveTabHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-hrms-navy">{title}</h2>
        <p className="mt-1 text-sm text-hrms-text-secondary">{subtitle}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
