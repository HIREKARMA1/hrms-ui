/**
 * HR "needs my action" queue rules shared with Overview and Requests tab.
 */

import type { LeaveSnapshot } from '../services/leaveService'
import type { LeaveRequest } from '../types/leaveRequest'
import { activeEmployees } from './employmentStatus'
import { daysBetweenInclusive } from './leaveDates'
import { leaveTodayIso } from './leaveToday'
import { calculateTeamCoverage } from './calculateTeamCoverage'

const activeIds = (snapshot: LeaveSnapshot) => new Set(activeEmployees(snapshot.employees).map((e) => e.id))

export function isHrActionRequest(snapshot: LeaveSnapshot, row: LeaveRequest): boolean {
  if (row.status !== 'Pending') return false
  if (!activeIds(snapshot).has(row.employeeId)) return false
  return row.currentLevel === 'HR' || row.escalated
}

export function waitingDaysForRequest(appliedOn: string, today = leaveTodayIso()): number {
  return Math.max(0, daysBetweenInclusive(appliedOn, today).length - 1)
}

export function isOverdueRequest(snapshot: LeaveSnapshot, row: LeaveRequest, today = leaveTodayIso()): boolean {
  return waitingDaysForRequest(row.appliedOn, today) >= snapshot.settings.escalation.daysPendingBeforeEscalation
}

export function requestHasCoverageWarning(snapshot: LeaveSnapshot, row: LeaveRequest): boolean {
  const emp = snapshot.employees.find((item) => item.id === row.employeeId)
  if (!emp) return false
  return (
    calculateTeamCoverage(
      snapshot.settings.teamCoverage,
      emp.department,
      emp.id,
      row.fromDate,
      row.toDate,
      snapshot.employees,
      snapshot.requests,
    ).length > 0
  )
}

export function sortHrActionRequests(rows: LeaveRequest[], snapshot: LeaveSnapshot): LeaveRequest[] {
  return [...rows].sort((a, b) => {
    const aOver = isOverdueRequest(snapshot, a) || a.escalated
    const bOver = isOverdueRequest(snapshot, b) || b.escalated
    if (aOver !== bOver) return aOver ? -1 : 1
    return a.appliedOn.localeCompare(b.appliedOn)
  })
}
