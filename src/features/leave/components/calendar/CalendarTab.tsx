/**
 * Month calendar with grid, mobile agenda, legend, and day detail sheet.
 * Visible to all demo roles with scope filters on LeavePage.
 */

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { CalendarDayDetailDialog } from '../dialogs/CalendarDayDetailDialog'
import { cn } from '@/lib/utils'

import { useLeave } from '../../hooks/useLeave'
import type { LeaveViewer } from '../../types/viewer'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { buildCalendarLeaveByDay, type CalendarLeaveScope } from '../../utils/buildCalendarLeaveByDay'
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

  const holidaysByDay = useMemo(() => {
    const map = new Map<string, string[]>()
    snapshot?.settings.holidays.forEach((item) => {
      map.set(item.date, [...(map.get(item.date) ?? []), item.name])
    })
    return map
  }, [snapshot?.settings.holidays])

  const leaveByDay = useMemo(() => {
    if (!snapshot) return new Map<string, { code: string; label: string }[]>()
    return buildCalendarLeaveByDay(snapshot, {
      scope,
      employeeId: viewer.employeeId,
      viewerRole: viewer.role,
      department: initialDepartment,
    })
  }, [initialDepartment, scope, snapshot, viewer.employeeId, viewer.role])

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
            ? 'Your approved and pending leave alongside company holidays and weekly offs.'
            : scope === 'team'
              ? 'Your team’s approved and pending leave with company holidays and weekly offs.'
              : initialDepartment
              ? `Filtered to ${initialDepartment}. Holidays, weekly offs, and team leave.`
              : 'Holidays, weekly offs, and team leave at a glance.'
        }
      />
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
