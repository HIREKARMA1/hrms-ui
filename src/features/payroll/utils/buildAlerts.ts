/**
 * Builds user-facing alert messages from current employee statuses.
 * Used by AlertList on PayrollPage.
 */

import type { EmployeeWithComputed, PayrollAlert } from '../types/payroll'

export function buildAlerts(employees: EmployeeWithComputed[]): PayrollAlert[] {
  const failed = employees.filter((item) => item.status === 'Failed').length
  const pending = employees.filter((item) => item.status === 'Pending').length
  const onHold = employees.filter((item) => item.status === 'On Hold').length

  if (failed === 0 && pending === 0 && onHold === 0) {
    return [
      {
        id: 'all-paid',
        message: 'Everyone has been paid for this cycle.',
        tone: 'success',
      },
    ]
  }

  const alerts: PayrollAlert[] = []
  if (failed > 0) {
    alerts.push({
      id: 'failed',
      message: `${failed} payment${failed > 1 ? 's' : ''} failed`,
      tone: 'danger',
    })
  }
  if (pending > 0) {
    alerts.push({
      id: 'pending',
      message: `${pending} employee${pending > 1 ? 's' : ''} not paid yet`,
      tone: 'warning',
    })
  }
  if (onHold > 0) {
    alerts.push({
      id: 'on-hold',
      message: `${onHold} salar${onHold > 1 ? 'ies' : 'y'} on hold`,
      tone: 'info',
    })
  }
  return alerts
}
