/**
 * Server calendar data for the Calendar tab. Org scope uses /leaves/calendar,
 * which is only org-wide with leaves:create_on_behalf; team scope uses
 * /leaves/calendar/team; self scope keeps the caller's own entries.
 */

import { useMemo } from 'react'

import { useGetLeaveCalendarQuery, useGetTeamLeaveCalendarQuery, getLeaveErrorMessage } from '../api/leaveApi'
import { buildServerCalendarDays, type LeaveTypeOption } from '../api/leaveMappers'
import type { BackendLeaveCalendarItem } from '../api/leaveApi.types'
import type { LeaveEmployee } from '../types/employee'
import type { CalendarLeaveScope } from '../utils/buildCalendarLeaveByDay'

export type ServerCalendarUnavailable = 'org-permission' | null

type ServerCalendarOptions = {
  enabled: boolean
  scope: CalendarLeaveScope
  year: number
  /** 1-12 */
  month: number
  linkedEmployeeId: string | null
  canViewOrgCalendar: boolean
  department?: string
  employees: LeaveEmployee[]
  leaveTypes: LeaveTypeOption[]
}

export function filterCalendarItems(
  items: BackendLeaveCalendarItem[],
  options: { scope: CalendarLeaveScope; linkedEmployeeId: string | null; department?: string; employees: LeaveEmployee[] },
): BackendLeaveCalendarItem[] {
  let rows = items
  if (options.scope === 'self') rows = rows.filter((item) => item.employeeId === options.linkedEmployeeId)
  if (options.department) {
    const departmentOf = new Map(options.employees.map((employee) => [employee.id, employee.department]))
    rows = rows.filter((item) => departmentOf.get(item.employeeId) === options.department)
  }
  return rows
}

export function useServerLeaveCalendar(options: ServerCalendarOptions) {
  const { enabled, scope, year, month, linkedEmployeeId, canViewOrgCalendar, department, employees, leaveTypes } = options
  const linked = linkedEmployeeId !== null
  const unavailable: ServerCalendarUnavailable = enabled && scope === 'org' && !canViewOrgCalendar ? 'org-permission' : null
  const args = { year, month }

  const own = useGetLeaveCalendarQuery(args, {
    skip: !enabled || unavailable !== null || scope === 'team' || (scope === 'self' && !linked),
  })
  const team = useGetTeamLeaveCalendarQuery(args, { skip: !enabled || scope !== 'team' || !linked })
  const active = scope === 'team' ? team : own

  const items = useMemo(
    () => filterCalendarItems(active.data?.items ?? [], { scope, linkedEmployeeId, department, employees }),
    [active.data, department, employees, linkedEmployeeId, scope],
  )
  const leaveByDay = useMemo(
    () => buildServerCalendarDays(items, { types: leaveTypes, viewerEmployeeId: linkedEmployeeId }),
    [items, leaveTypes, linkedEmployeeId],
  )

  const loading = enabled && !active.isUninitialized && active.isFetching && !active.data
  const error = enabled && active.isError && !active.data ? getLeaveErrorMessage(active.error, 'Could not load the leave calendar.') : null

  return { items, leaveByDay, loading, error, unavailable, refetch: active.refetch }
}
