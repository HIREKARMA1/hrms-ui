/**
 * Row filters for the HR Requests tab queues.
 */

import type { LeaveSnapshot } from '../services/leaveService'
import type { HrRequestsSegment } from '../context/leavePageNavTypes'
import type { LeaveEmployee } from '../types/employee'
import type { LeaveRequest } from '../types/leaveRequest'
import { LEAVE_TYPE_LABELS, type LeaveTypeCode } from '../constants/leaveTypeCodes'
import { isHrActionRequest } from './attentionHrQueue'

export function filterHrRequests(snapshot: LeaveSnapshot, employees: LeaveEmployee[], segment: HrRequestsSegment, search: string): LeaveRequest[] {
  let rows = snapshot.requests.filter((item) => employees.some((emp) => emp.id === item.employeeId))
  if (segment === 'action') rows = rows.filter((item) => isHrActionRequest(snapshot, item))
  if (search.trim()) {
    const q = search.toLowerCase()
    rows = rows.filter((item) => {
      const name = snapshot.employees.find((emp) => emp.id === item.employeeId)?.name.toLowerCase() ?? ''
      const typeLabel = LEAVE_TYPE_LABELS[item.leaveTypeCode as LeaveTypeCode]?.toLowerCase() ?? ''
      return name.includes(q) || item.leaveTypeCode.toLowerCase().includes(q) || typeLabel.includes(q)
    })
  }
  return rows
}
