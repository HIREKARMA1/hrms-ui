/**
 * Preview monthly accrual credits per employee and leave type from policy rules.
 * Monthly quota/12; per_days_worked uses worked days / N after qualifying period.
 */

import type { LeaveEmployee } from '../types/employee'
import type { LeaveSettings, LeaveTypePolicy } from '../types/leaveSettings'
import { accruesLeaveBalance } from './leaveEarningModel'
import { leaveTodayIso } from './leaveToday'

export type AccrualPreviewRow = {
  employeeId: string
  leaveTypeCode: string
  days: number
}

const WORKED_DAYS_ASSUMED = 22

function accrualForType(
  policy: LeaveTypePolicy,
  employee: LeaveEmployee,
  yearMonth: string,
): number {
  if (!policy.enabled || !accruesLeaveBalance(policy) || policy.annualQuotaDays === null) {
    return 0
  }
  if (policy.accrualMethod === 'upfront') {
    const yearStart = yearMonth.slice(0, 4)
    return employee.joiningDate.startsWith(yearStart) && yearMonth.endsWith('-01') ? policy.annualQuotaDays : 0
  }
  if (policy.accrualMethod === 'monthly') {
    return Math.round((policy.annualQuotaDays / 12) * 100) / 100
  }
  const joined = new Date(`${employee.joiningDate}T12:00:00`)
  const asOf = new Date(`${leaveTodayIso()}T12:00:00`)
  const daysEmployed = Math.floor((asOf.getTime() - joined.getTime()) / 86400000)
  if (policy.qualifyingDays !== null && daysEmployed < policy.qualifyingDays) {
    return 0
  }
  const n = policy.daysWorkedPerAccrualDay ?? 20
  return Math.round((WORKED_DAYS_ASSUMED / n) * 100) / 100
}

export function calculateAccrualPreview(
  settings: LeaveSettings,
  employees: LeaveEmployee[],
  yearMonth: string,
): AccrualPreviewRow[] {
  const rows: AccrualPreviewRow[] = []
  for (const employee of employees) {
    for (const policy of settings.leaveTypes) {
      const days = accrualForType(policy, employee, yearMonth)
      if (days > 0) {
        rows.push({ employeeId: employee.id, leaveTypeCode: policy.code, days })
      }
    }
  }
  return rows
}
