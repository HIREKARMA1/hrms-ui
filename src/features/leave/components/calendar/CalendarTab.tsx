/**
 * Month calendar with grid, mobile agenda, legend, and day detail sheet.
 * Visible to all demo roles with scope filters on LeavePage.
 */

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/errors'
import { CalendarDayDetailDialog } from '../dialogs/CalendarDayDetailDialog'
import { cn } from '@/lib/utils'

import { useGetHolidaysQuery } from '../../api/holidaysApi'
import { useGetLeaveCalendarQuery, useGetTeamLeaveCalendarQuery } from '../../api/leaveApi'
import { useLeave } from '../../hooks/useLeave'
import { useLeaveEmployeeIdForApi } from '../../hooks/useLeaveEmployeeIdForApi'
import { useShouldFetchLeaveList } from '../../hooks/useShouldFetchLeaveList'
import type { LeaveViewer } from '../../types/viewer'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { calendarMonthBounds } from '../../utils/calendarMonthBounds'
import { buildCalendarLeaveByDay, type CalendarLeaveScope } from '../../utils/buildCalendarLeaveByDay'
import {
  mapApiSelfLeaveCalendarToLeaveByDay,
  mapApiTeamLeaveCalendarToLeaveByDay,
  mergePendingCalendarEntries,
} from '../../utils/mapApiTeamLeaveCalendar'
import { mapApiHolidaysToByDay } from '../../utils/mapApiHolidaysToByDay'
import { teamCalendarMemberIds } from '../../utils/managerTeam'
import { leaveTodayIso } from '../../utils/leaveToday'
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

function monthMatrix(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())
  const weeks: (string | null)[][] = []
  for (let week = 0; week < 6; week++) {
    const row: (string | null)[] = []
    for (let day = 0; day < 7; day++) {
      const cell = new Date(start)
      cell.setDate(start.getDate() + week * 7 + day)
      row.push(cell.getMonth() === month ? cell.toISOString().slice(0, 10) : null)
    }
    weeks.push(row)
  }
  return weeks
}

export function CalendarTab({ viewer, initialDepartment, scope = 'org' }: CalendarTabProps) {
  const { snapshot } = useLeave()
  const base = leaveTodayIso()
  const [cursor, setCursor] = useState({ year: Number(base.slice(0, 4)), month: Number(base.slice(5, 7)) - 1 })
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const matrix = useMemo(() => monthMatrix(cursor.year, cursor.month), [cursor])

  const mockHolidaysByDay = useMemo(() => {
    const map = new Map<string, string[]>()
    snapshot?.settings.holidays.forEach((item) => {
      map.set(item.date, [...(map.get(item.date) ?? []), item.name])
    })
    return map
  }, [snapshot?.settings.holidays])

  const monthBounds = useMemo(
    () => calendarMonthBounds(cursor.year, cursor.month),
    [cursor.month, cursor.year],
  )

  const canFetchLeaves = useShouldFetchLeaveList()
  const shouldFetchHolidays = canFetchLeaves

  const {
    data: holidaysData,
    isError: holidaysIsError,
    error: holidaysError,
    isFetching: holidaysFetching,
  } = useGetHolidaysQuery({ year: cursor.year }, { skip: !shouldFetchHolidays })

  const holidaysByDay = useMemo(() => {
    if (shouldFetchHolidays && holidaysData && !holidaysIsError) {
      return mapApiHolidaysToByDay(holidaysData)
    }
    return mockHolidaysByDay
  }, [holidaysData, holidaysIsError, mockHolidaysByDay, shouldFetchHolidays])

  const holidaysErrorMessage =
    shouldFetchHolidays && holidaysIsError
      ? getApiErrorMessage(holidaysError, 'Unable to load holidays. Showing demo calendar.')
      : null

  const shouldFetchSelfCalendar = scope === 'self' && canFetchLeaves
  const shouldFetchTeamCalendar = scope === 'team' && canFetchLeaves
  const viewerApiEmployeeId = useLeaveEmployeeIdForApi(snapshot, viewer.employeeId)

  const {
    data: selfCalendarData,
    isError: selfCalendarIsError,
    error: selfCalendarError,
    isFetching: selfCalendarFetching,
  } = useGetLeaveCalendarQuery(monthBounds, { skip: !shouldFetchSelfCalendar })

  const {
    data: teamCalendarData,
    isError: teamCalendarIsError,
    error: teamCalendarError,
    isFetching: teamCalendarFetching,
  } = useGetTeamLeaveCalendarQuery(monthBounds, { skip: !shouldFetchTeamCalendar })

  const mockLeaveByDay = useMemo(() => {
    if (!snapshot) return new Map<string, { code: string; label: string }[]>()
    return buildCalendarLeaveByDay(snapshot, {
      scope,
      employeeId: viewer.employeeId,
      viewerRole: viewer.role,
      department: initialDepartment,
    })
  }, [initialDepartment, scope, snapshot, viewer.employeeId, viewer.role])

  const leaveByDay = useMemo(() => {
    if (shouldFetchSelfCalendar && selfCalendarData && !selfCalendarIsError) {
      const apiMap = mapApiSelfLeaveCalendarToLeaveByDay(selfCalendarData)
      return mergePendingCalendarEntries(apiMap, mockLeaveByDay)
    }
    if (shouldFetchTeamCalendar && teamCalendarData && !teamCalendarIsError) {
      const apiMap = mapApiTeamLeaveCalendarToLeaveByDay(
        teamCalendarData,
        viewer.employeeId,
        viewerApiEmployeeId,
      )
      return mergePendingCalendarEntries(apiMap, mockLeaveByDay)
    }
    return mockLeaveByDay
  }, [
    mockLeaveByDay,
    selfCalendarData,
    selfCalendarIsError,
    shouldFetchSelfCalendar,
    shouldFetchTeamCalendar,
    teamCalendarData,
    teamCalendarIsError,
    viewer.employeeId,
    viewerApiEmployeeId,
  ])

  const selfCalendarErrorMessage =
    shouldFetchSelfCalendar && selfCalendarIsError
      ? getApiErrorMessage(
          selfCalendarError,
          'Unable to load your calendar. Showing demo data.',
        )
      : null

  const teamCalendarErrorMessage =
    shouldFetchTeamCalendar && teamCalendarIsError
      ? getApiErrorMessage(
          teamCalendarError,
          'Unable to load team calendar. Showing demo data.',
        )
      : null

  const teamMemberIds = useMemo(
    () => (scope === 'team' && snapshot ? teamCalendarMemberIds(snapshot, viewer.employeeId) : undefined),
    [scope, snapshot, viewer.employeeId],
  )

  if (!snapshot) return null

  const daysInMonth = matrix.flat().filter((day): day is string => Boolean(day))
  const monthPrefix = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`

  return (
    <div className="space-y-6">
      <LeaveTabHeader
        title="Calendar"
        subtitle={
          scope === 'self'
            ? shouldFetchSelfCalendar && selfCalendarData && !selfCalendarIsError
              ? 'Approved leave from the server; pending requests from demo data until approvals sync.'
              : 'Your approved and pending leave alongside company holidays and weekly offs.'
            : scope === 'team'
              ? shouldFetchTeamCalendar && teamCalendarData && !teamCalendarIsError
                ? 'Approved team leave from the server; pending requests from demo data until approvals sync.'
                : 'Your team’s approved and pending leave with company holidays and weekly offs.'
              : initialDepartment
              ? `Filtered to ${initialDepartment}. Holidays, weekly offs, and team leave.`
              : 'Holidays, weekly offs, and team leave at a glance.'
        }
      />
      {selfCalendarErrorMessage ? (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
          role="alert"
        >
          {selfCalendarErrorMessage}
        </p>
      ) : null}
      {teamCalendarErrorMessage ? (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
          role="alert"
        >
          {teamCalendarErrorMessage}
        </p>
      ) : null}
      {selfCalendarFetching && shouldFetchSelfCalendar ? (
        <p className="text-xs text-hrms-text-muted">Loading your calendar…</p>
      ) : null}
      {teamCalendarFetching && shouldFetchTeamCalendar ? (
        <p className="text-xs text-hrms-text-muted">Loading team calendar…</p>
      ) : null}
      {holidaysErrorMessage ? (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
          role="alert"
        >
          {holidaysErrorMessage}
        </p>
      ) : null}
      {holidaysFetching && shouldFetchHolidays ? (
        <p className="text-xs text-hrms-text-muted">Loading holidays…</p>
      ) : null}
      <CalendarTabStats
        snapshot={snapshot}
        monthPrefix={monthPrefix}
        employeeId={scope === 'self' ? viewer.employeeId : undefined}
        teamMemberIds={teamMemberIds}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" className={cn(LEAVE_SECONDARY_BUTTON)} onClick={() => setCursor((value) => ({ ...value, month: value.month - 1 }))}>Previous</Button>
        <Button type="button" variant="outline" className={cn(LEAVE_SECONDARY_BUTTON)} onClick={() => setCursor({ year: Number(base.slice(0, 4)), month: Number(base.slice(5, 7)) - 1 })}>Today</Button>
        <Button type="button" variant="outline" className={cn(LEAVE_SECONDARY_BUTTON)} onClick={() => setCursor((value) => ({ ...value, month: value.month + 1 }))}>Next</Button>
      </div>
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
