/**
 * Manager My Leave overview stats (team snapshot while keeping personal balances).
 */

import type { LeaveSnapshot } from '../services/leaveService'
import { leaveTodayIso } from './leaveToday'
import {
  pendingManagerCompOffRequests,
  pendingManagerLeaveRequests,
} from './managerApprovalsQueue'
import { directReportIds } from './managerTeam'

export function teamOnLeaveTodayCount(snapshot: LeaveSnapshot, managerId: string): number {
  const teamIds = new Set([managerId, ...directReportIds(snapshot, managerId)])
  const today = leaveTodayIso()
  return snapshot.requests.filter(
    (item) =>
      teamIds.has(item.employeeId) &&
      item.status === 'Approved' &&
      item.fromDate <= today &&
      item.toDate >= today,
  ).length
}

export function managerOverviewStats(snapshot: LeaveSnapshot, managerId: string) {
  return {
    directReports: directReportIds(snapshot, managerId).length,
    pendingApprovals: pendingManagerLeaveRequests(snapshot, managerId).length,
    compOffPending: pendingManagerCompOffRequests(snapshot, managerId).length,
    onLeaveToday: teamOnLeaveTodayCount(snapshot, managerId),
  }
}
