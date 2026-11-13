/**
 * Flags when too many colleagues in a department are on leave the same day.
 * Shown as warning (or block when settings.teamCoverage.mode is block).
 */

import type { LeaveEmployee } from '../types/employee'
import type { LeaveRequest } from '../types/leaveRequest'
import type { TeamCoverageRules } from '../types/leaveSettings'
import { daysBetweenInclusive } from './leaveDates'

export type CoverageWarning = {
  date: string
  count: number
  department: string
}

export function calculateTeamCoverage(
  rules: TeamCoverageRules,
  department: string,
  employeeId: string,
  fromDate: string,
  toDate: string,
  employees: LeaveEmployee[],
  requests: LeaveRequest[],
): CoverageWarning[] {
  const warnings: CoverageWarning[] = []
  for (const date of daysBetweenInclusive(fromDate, toDate)) {
    const onLeave = requests.filter(
      (item) =>
        item.status !== 'Rejected' &&
        item.status !== 'Cancelled' &&
        item.employeeId !== employeeId &&
        item.fromDate <= date &&
        item.toDate >= date,
    )
    const deptIds = new Set(
      employees.filter((item) => item.department === department).map((item) => item.id),
    )
    const count = onLeave.filter((item) => deptIds.has(item.employeeId)).length
    if (count >= rules.maxSameDepartmentPerDay) {
      warnings.push({ date, count: count + 1, department })
    }
  }
  return warnings
}
