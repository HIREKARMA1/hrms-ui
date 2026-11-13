/**
 * On-leave and upcoming leave rows for HR Overview lists.
 */

import type { LeaveSnapshot } from '../services/leaveService'
import { activeEmployees } from './employmentStatus'
import { addDays } from './leaveDates'
import { leaveTodayIso } from './leaveToday'

export type OverviewLeaveRow = {
  employeeId: string
  employeeName: string
  department: string
  leaveTypeCode: string
  fromDate: string
  toDate: string
}

export function listOnLeaveToday(snapshot: LeaveSnapshot): OverviewLeaveRow[] {
  const today = leaveTodayIso()
  const byId = Object.fromEntries(snapshot.employees.map((item) => [item.id, item]))
  const rows: OverviewLeaveRow[] = []
  for (const req of snapshot.requests) {
    if (req.status !== 'Approved' || req.fromDate > today || req.toDate < today) continue
    const emp = byId[req.employeeId]
    if (!emp || !activeEmployees(snapshot.employees).some((item) => item.id === emp.id)) continue
    rows.push({
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      leaveTypeCode: req.leaveTypeCode,
      fromDate: req.fromDate,
      toDate: req.toDate,
    })
  }
  return rows.sort((a, b) => a.employeeName.localeCompare(b.employeeName))
}

export function listUpcoming7Days(snapshot: LeaveSnapshot): OverviewLeaveRow[] {
  const today = leaveTodayIso()
  const end = addDays(today, 7)
  const byId = Object.fromEntries(snapshot.employees.map((item) => [item.id, item]))
  const rows: OverviewLeaveRow[] = []
  for (const req of snapshot.requests) {
    if (req.status !== 'Approved') continue
    if (req.fromDate <= today) continue
    if (req.fromDate > end) continue
    const emp = byId[req.employeeId]
    if (!emp || !activeEmployees(snapshot.employees).some((item) => item.id === emp.id)) continue
    rows.push({
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      leaveTypeCode: req.leaveTypeCode,
      fromDate: req.fromDate,
      toDate: req.toDate,
    })
  }
  return rows.sort((a, b) => a.fromDate.localeCompare(b.fromDate))
}
