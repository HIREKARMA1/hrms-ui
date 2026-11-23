/**
 * Derives display employment status and filters terminated employees from HR lists.
 */

import type { EmploymentStatus } from '../constants/employmentStatuses'
import type { LeaveEmployee } from '../types/employee'
import type { LeaveRequest } from '../types/leaveRequest'
import { leaveTodayIso } from './leaveToday'

export function isOnApprovedLeaveToday(employeeId: string, requests: LeaveRequest[], today = leaveTodayIso()): boolean {
  return requests.some(
    (item) =>
      item.employeeId === employeeId &&
      item.status === 'Approved' &&
      item.fromDate <= today &&
      item.toDate >= today,
  )
}

export function resolveEmploymentStatus(employee: LeaveEmployee, requests: LeaveRequest[], today = leaveTodayIso()): EmploymentStatus {
  if (employee.employmentStatus === 'TERMINATED') return 'TERMINATED'
  if (isOnApprovedLeaveToday(employee.id, requests, today)) return 'ON_LEAVE'
  return employee.employmentStatus
}

export function isTerminated(employee: LeaveEmployee): boolean {
  return employee.employmentStatus === 'TERMINATED'
}

/** Employees included in dropdowns, accruals, balances table and reports. */
export function activeEmployees(employees: LeaveEmployee[]): LeaveEmployee[] {
  return employees.filter((item) => !isTerminated(item))
}
