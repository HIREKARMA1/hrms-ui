/**
 * Title row with subtitle, month label, and primary action for payroll sub-tabs.
 * Used by Variable Pay segments and Final Settlement tab.
 */

import type { ReactNode } from 'react'

import { formatMonth } from '../../utils/formatMonth'

type PayrollTabHeaderProps = {
  title: string
  subtitle: string
  payrollMonth: string
  action?: ReactNode
}

export function PayrollTabHeader({
  title,
  subtitle,
  payrollMonth,
  action,
}: PayrollTabHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-bold text-hrms-navy">{title}</h2>
          <span className="rounded-md bg-hrms-muted-bg px-2 py-0.5 text-xs font-medium text-hrms-text-secondary">
            {formatMonth(payrollMonth)}
          </span>
        </div>
        <p className="mt-1 text-sm text-hrms-text-secondary">{subtitle}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
