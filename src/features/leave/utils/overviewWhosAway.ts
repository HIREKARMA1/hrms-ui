/**
 * Employees away in Today / 7 / 30 day windows for Overview.
 */

import type { LeaveSnapshot } from '../services/leaveService'
import { activeEmployees } from './employmentStatus'
import { addDays } from './leaveDates'
import { leaveTodayIso } from './leaveToday'

export type WhosAwayRow = {
  requestId: string
  employeeId: string
  employeeName: string
  department: string
  leaveTypeCode: string
  fromDate: string
  toDate: string
  backOn: string
}

export type WhosAwayWindow = 'today' | 'next_7' | 'next_30'

export function listWhosAway(snapshot: LeaveSnapshot, window: WhosAwayWindow): WhosAwayRow[] {
  const today = leaveTodayIso()
  const end = window === 'today' ? today : addDays(today, window === 'next_7' ? 7 : 30)
  const byId = Object.fromEntries(snapshot.employees.map((item) => [item.id, item]))
  const rows: WhosAwayRow[] = []
  for (const req of snapshot.requests) {
    if (req.status !== 'Approved') continue
    const emp = byId[req.employeeId]
    if (!emp || !activeEmployees(snapshot.employees).some((item) => item.id === emp.id)) continue
    if (window === 'today') {
      if (req.fromDate > today || req.toDate < today) continue
    } else if (req.fromDate <= today || req.fromDate > end) continue
    rows.push({
      requestId: req.id,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      leaveTypeCode: req.leaveTypeCode,
      fromDate: req.fromDate,
      toDate: req.toDate,
      backOn: addDays(req.toDate, 1),
    })
  }
  return rows.sort((a, b) => a.fromDate.localeCompare(b.fromDate) || a.employeeName.localeCompare(b.employeeName))
}
