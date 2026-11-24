/**
 * Month calendar with grid, mobile agenda, legend, and day detail sheet.
 * Visible to all demo roles with scope filters on LeavePage. Server snapshots
 * read approved leave from the calendar endpoints.
 */

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { CalendarDayDetailDialog } from '../dialogs/CalendarDayDetailDialog'
import { cn } from '@/lib/utils'

import { useLeave } from '../../hooks/useLeave'
import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { useServerLeaveCalendar } from '../../hooks/useServerLeaveCalendar'
import type { LeaveViewer } from '../../types/viewer'
import { LeaveErrorState } from '../LeaveErrorState'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { buildCalendarLeaveByDay, type CalendarLeaveScope } from '../../utils/buildCalendarLeaveByDay'
import { teamCalendarMemberIds } from '../../utils/managerTeam'
import { leaveTodayIso } from '../../utils/leaveToday'
import { monthMatrix } from '../../utils/calendarMonthMatrix'
import { LeaveEmployeeLinkNotice } from '../shared/LeaveEmployeeLinkNotice'
import { LeaveInlineLoading, LeaveServerNotice } from '../shared/LeaveServerNotice'
import { LEAVE_SECONDARY_BUTTON } from '../shared/leaveUi'
import { CalendarAgendaList } from './CalendarAgendaList'
import { CalendarLegend } from './CalendarLegend'
import { CalendarMonthGrid } from './CalendarMonthGrid'
import { CalendarTabStats } from './CalendarTabStats'

type CalendarTabProps = {
  viewer: LeaveViewer
  initialDepartment?: string
  scope?: CalendarLeaveScope
}

export function CalendarTab({ viewer, initialDepartment, scope = 'org' }: CalendarTabProps) {
  const { snapshot } = useLeave()
  const permissions = useLeavePermissions()
  const base = leaveTodayIso()
  const [cursor, setCursor] = useState({ year: Number(base.slice(0, 4)), month: Number(base.slice(5, 7)) - 1 })
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const matrix = useMemo(() => monthMatrix(cursor.year, cursor.month), [cursor])
  const shown = new Date(cursor.year, cursor.month, 1)
  const shownYear = shown.getFullYear()
  const shownMonth = shown.getMonth() + 1

  const holidaysByDay = useMemo(() => {
    const map = new Map<string, string[]>()
    snapshot?.settings.holidays.forEach((item) => {
      map.set(item.date, [...(map.get(item.date) ?? []), item.name])
    })
    return map
  }, [snapshot?.settings.holidays])

  const linkedId = viewer.employeeId
  // "Your" / "your team" views need an employee record; never fall back to org-wide data.
  const personalUnavailable = scope !== 'org' && !linkedId
  const api = snapshot?.api

  const server = useServerLeaveCalendar({
    enabled: Boolean(api) && !personalUnavailable,
    scope,
    year: shownYear,
    month: shownMonth,
    linkedEmployeeId: linkedId,
    canViewOrgCalendar: permissions.canCreateOnBehalf,
    department: initialDepartment,
    employees: snapshot?.employees ?? [],
    leaveTypes: api?.leaveTypes ?? [],
  })

  const demoLeaveByDay = useMemo(() => {
    if (!snapshot || api || (scope !== 'org' && !linkedId)) return new Map<string, { code: string; label: string }[]>()
    return buildCalendarLeaveByDay(snapshot, {
      scope,
      // Org scope only uses this to label the viewer's own entries.
      employeeId: linkedId ?? '',
      viewerRole: viewer.role,
      department: initialDepartment,
    })
  }, [api, initialDepartment, scope, snapshot, linkedId, viewer.role])
  const leaveByDay = api ? server.leaveByDay : demoLeaveByDay

  const teamMemberIds = useMemo(
    () => (scope === 'team' && snapshot && linkedId ? teamCalendarMemberIds(snapshot, linkedId) : undefined),
    [scope, snapshot, linkedId],
  )

  if (!snapshot) return null

  const daysInMonth = matrix.flat().filter((day): day is string => Boolean(day))
  const monthPrefix = `${shownYear}-${String(shownMonth).padStart(2, '0')}`

  return (
    <div className="space-y-6">
      <LeaveTabHeader
        title="Calendar"
        subtitle={
          scope === 'self'
            ? 'Your approved and pending leave alongside company holidays and weekly offs.'
            : scope === 'team'
              ? 'Your team’s approved and pending leave with company holidays and weekly offs.'
              : initialDepartment
              ? `Filtered to ${initialDepartment}. Holidays, weekly offs, and team leave.`
              : 'Holidays, weekly offs, and team leave at a glance.'
        }
      />
      {personalUnavailable ? (
        <LeaveEmployeeLinkNotice />
      ) : server.unavailable === 'org-permission' ? (
        <LeaveServerNotice>
          The organisation-wide leave calendar needs the permission to apply leave on behalf of employees. Without it the server
          only returns leave for your own department, which needs a linked employee record.
        </LeaveServerNotice>
      ) : (
        <CalendarTabStats
          snapshot={snapshot}
          monthPrefix={monthPrefix}
          employeeId={scope === 'self' ? (linkedId ?? undefined) : undefined}
          teamMemberIds={teamMemberIds}
          approvedSpans={api ? server.items : undefined}
        />
      )}
      {api ? (
        <LeaveServerNotice>
          Only approved leave is shown. Company holidays are not available from the server yet.
          {initialDepartment && snapshot.employees.length === 0 ? ' The department filter needs access to the employee directory.' : ''}
        </LeaveServerNotice>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" className={cn(LEAVE_SECONDARY_BUTTON)} onClick={() => setCursor((value) => ({ ...value, month: value.month - 1 }))}>Previous</Button>
        <Button type="button" variant="outline" className={cn(LEAVE_SECONDARY_BUTTON)} onClick={() => setCursor({ year: Number(base.slice(0, 4)), month: Number(base.slice(5, 7)) - 1 })}>Today</Button>
        <Button type="button" variant="outline" className={cn(LEAVE_SECONDARY_BUTTON)} onClick={() => setCursor((value) => ({ ...value, month: value.month + 1 }))}>Next</Button>
      </div>
      {server.loading ? <LeaveInlineLoading label="Loading leave calendar…" /> : null}
      {server.error ? <LeaveErrorState message={server.error} onRetry={() => void server.refetch()} /> : null}
      <CalendarAgendaList days={daysInMonth} holidaysByDay={holidaysByDay} leaveByDay={leaveByDay} todayIso={base} onSelectDay={setSelectedDay} />
      <CalendarMonthGrid
        matrix={matrix}
        holidaysByDay={holidaysByDay}
        leaveByDay={leaveByDay}
        todayIso={base}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        weeklyOffDays={snapshot.settings.weeklyOffDays}
      />
      <CalendarLegend />
      <CalendarDayDetailDialog
        open={Boolean(selectedDay)}
        day={selectedDay}
        holidays={holidaysByDay.get(selectedDay ?? '') ?? []}
        onLeave={leaveByDay.get(selectedDay ?? '') ?? []}
        onOpenChange={(open) => !open && setSelectedDay(null)}
        variant={scope === 'self' ? 'self' : 'team'}
      />
    </div>
  )
}
