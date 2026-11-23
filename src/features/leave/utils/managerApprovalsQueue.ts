/**
 * Manager approval queues scoped to direct reports (leave, encashment, comp-off).
 */

import type { CompOffRequest } from '../types/compOff'
import type { EncashmentRequest } from '../types/encashment'
import type { LeaveRequest } from '../types/leaveRequest'
import type { LeaveSnapshot } from '../services/leaveService'
import { employeeManagedBy } from './managerTeam'

export function pendingManagerLeaveRequests(snapshot: LeaveSnapshot, managerId: string): LeaveRequest[] {
  return snapshot.requests.filter((item) => {
    if (item.status !== 'Pending' || item.currentLevel !== 'Manager') return false
    return employeeManagedBy(snapshot, item.employeeId, managerId) && item.employeeId !== managerId
  })
}

export function pendingManagerEncashments(snapshot: LeaveSnapshot, managerId: string): EncashmentRequest[] {
  return snapshot.encashments.filter(
    (item) => item.status === 'Pending approval' && employeeManagedBy(snapshot, item.employeeId, managerId),
  )
}

export function pendingManagerCompOffRequests(snapshot: LeaveSnapshot, managerId: string): CompOffRequest[] {
  return snapshot.compOffRequests.filter(
    (item) => item.status === 'Pending' && employeeManagedBy(snapshot, item.employeeId, managerId),
  )
}

export function teamEscalatedLeaveCount(snapshot: LeaveSnapshot, managerId: string): number {
  return snapshot.requests.filter(
    (item) => item.escalated && employeeManagedBy(snapshot, item.employeeId, managerId),
  ).length
}
