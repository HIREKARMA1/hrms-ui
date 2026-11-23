/**
 * Direct-report helpers for manager calendar, approvals, and My Leave snapshot.
 */

import type { LeaveEmployee } from '../types/employee'
import type { LeaveSnapshot } from '../services/leaveService'

export function directReports(snapshot: LeaveSnapshot, managerId: string): LeaveEmployee[] {
  return snapshot.employees.filter((item) => item.managerId === managerId)
}

export function directReportIds(snapshot: LeaveSnapshot, managerId: string): string[] {
  return directReports(snapshot, managerId).map((item) => item.id)
}

/** Calendar and stats include the manager plus direct reports. */
export function teamCalendarMemberIds(snapshot: LeaveSnapshot, managerId: string): string[] {
  return [managerId, ...directReportIds(snapshot, managerId)]
}

export function employeeManagedBy(snapshot: LeaveSnapshot, employeeId: string, managerId: string): boolean {
  if (employeeId === managerId) return true
  const employee = snapshot.employees.find((item) => item.id === employeeId)
  return employee?.managerId === managerId
}

export function managerDepartmentLabel(snapshot: LeaveSnapshot, managerId: string): string | null {
  return snapshot.employees.find((item) => item.id === managerId)?.department ?? null
}
