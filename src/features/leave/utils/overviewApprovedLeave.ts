/**
 * Approved leave rows for Overview charts (active employees only).
 */

import type { LeaveSnapshot } from '../services/leaveService'
import type { LeaveRequest } from '../types/leaveRequest'
import { activeEmployees } from './employmentStatus'
import { daysBetweenInclusive } from './leaveDates'

export function approvedLeaveRequests(snapshot: LeaveSnapshot): LeaveRequest[] {
  const activeIds = new Set(activeEmployees(snapshot.employees).map((item) => item.id))
  return snapshot.requests.filter((row) => row.status === 'Approved' && activeIds.has(row.employeeId))
}

export function weightPerCalendarDay(row: LeaveRequest): number {
  const span = daysBetweenInclusive(row.fromDate, row.toDate).length
  return span > 0 ? row.days / span : row.days
}

export function requestOverlapsRange(row: LeaveRequest, from: string, to: string): boolean {
  return row.fromDate <= to && row.toDate >= from
}
