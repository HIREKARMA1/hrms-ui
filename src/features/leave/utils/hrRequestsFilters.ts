/**
 * Row filters for the HR Requests tab queues.
 */

import type { LeaveSnapshot } from '../services/leaveService'
import type { HrRequestsSegment } from '../context/leavePageNavTypes'
import type { LeaveEmployee } from '../types/employee'
import type { LeaveRequest } from '../types/leaveRequest'
import { LEAVE_TYPE_LABELS, type LeaveTypeCode } from '../constants/leaveTypeCodes'
import { isHrActionRequest } from './attentionHrQueue'

export function filterLeaveRequestsBySearch(
  snapshot: LeaveSnapshot,
  rows: LeaveRequest[],
  search: string,
): LeaveRequest[] {
  if (!search.trim()) return rows
  const q = search.toLowerCase()
  return rows.filter((item) => {
    const name = snapshot.employees.find((emp) => emp.id === item.employeeId)?.name.toLowerCase() ?? ''
    const typeLabel = LEAVE_TYPE_LABELS[item.leaveTypeCode as LeaveTypeCode]?.toLowerCase() ?? ''
    return name.includes(q) || item.leaveTypeCode.toLowerCase().includes(q) || typeLabel.includes(q)
  })
}

/** Merge workflow pending API rows with single-level HR action rows (Needs my action). */
export function mergeHrActionLeaveQueue(
  snapshot: LeaveSnapshot,
  employees: LeaveEmployee[],
  pendingWorkflow: LeaveRequest[],
  search: string,
): LeaveRequest[] {
  const hrSingle = filterHrRequests(snapshot, employees, 'action', '').filter((row) => !row.multiLevelWorkflow)
  const pendingIds = new Set(pendingWorkflow.map((row) => row.id))
  const merged = [...pendingWorkflow, ...hrSingle.filter((row) => !pendingIds.has(row.id))]
  return filterLeaveRequestsBySearch(snapshot, merged, search)
}

export function filterHrRequests(snapshot: LeaveSnapshot, employees: LeaveEmployee[], segment: HrRequestsSegment, search: string): LeaveRequest[] {
  let rows = snapshot.requests.filter((item) => employees.some((emp) => emp.id === item.employeeId))
  if (segment === 'action') rows = rows.filter((item) => isHrActionRequest(snapshot, item))
  return filterLeaveRequestsBySearch(snapshot, rows, search)
}
