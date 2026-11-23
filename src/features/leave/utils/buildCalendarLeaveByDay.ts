/**
 * Builds per-day leave chips for the calendar grid from snapshot requests.
 * Self scope shows only the viewer's approved and pending leave.
 */

import type { UserRole } from '../constants/userRoles'
import type { LeaveSnapshot } from '../services/leaveService'
import { employeeManagedBy } from './managerTeam'

export type CalendarLeaveScope = 'org' | 'self' | 'team'

export type CalendarLeaveDayEntry = {
  code: string
  label: string
  pending?: boolean
}

type BuildOptions = {
  scope: CalendarLeaveScope
  employeeId: string
  viewerRole: UserRole
  department?: string
}

export function buildCalendarLeaveByDay(snapshot: LeaveSnapshot, options: BuildOptions): Map<string, CalendarLeaveDayEntry[]> {
  const map = new Map<string, CalendarLeaveDayEntry[]>()
  const { scope, employeeId, viewerRole, department } = options

  for (const item of snapshot.requests) {
    if (scope === 'self' && item.employeeId !== employeeId) continue
    if (scope === 'team' && !employeeManagedBy(snapshot, item.employeeId, employeeId)) continue
    if (scope === 'org' && department) {
      const deptEmp = snapshot.employees.find((row) => row.id === item.employeeId)
      if (deptEmp?.department !== department) continue
    }

    const approved = item.status === 'Approved'
    const pendingSelf = scope === 'self' && item.status === 'Pending'
    const pendingTeam = scope === 'team' && item.status === 'Pending'
    if (!approved && !pendingSelf && !pendingTeam) continue

    const emp = snapshot.employees.find((row) => row.id === item.employeeId)
    const name = emp?.name ?? item.employeeId
    const isSelf = item.employeeId === employeeId
    const label =
      scope === 'self'
        ? pendingSelf
          ? `${item.leaveTypeCode} · Pending`
          : 'Your leave'
        : scope === 'team'
          ? pendingTeam
            ? isSelf
              ? `${item.leaveTypeCode} · Pending (you)`
              : `${name} · Pending`
            : isSelf
              ? 'You'
              : name
          : viewerRole === 'EMPLOYEE'
            ? 'On leave'
            : name

    let cursorDate = item.fromDate
    while (cursorDate <= item.toDate) {
      const entry: CalendarLeaveDayEntry = {
        code: item.leaveTypeCode,
        label,
        ...(pendingSelf || pendingTeam ? { pending: true } : {}),
      }
      map.set(cursorDate, [...(map.get(cursorDate) ?? []), entry])
      const next = new Date(`${cursorDate}T12:00:00`)
      next.setDate(next.getDate() + 1)
      cursorDate = next.toISOString().slice(0, 10)
    }
  }

  return map
}
