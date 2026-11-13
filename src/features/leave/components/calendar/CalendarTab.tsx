/**
 * Month calendar with manual grid, agenda fallback, and day detail sheet.
 * Visible to all demo roles with scope filters on LeavePage.
 */

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

import { useLeave } from '../../hooks/useLeave'
import type { LeaveViewer } from '../../types/viewer'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { formatDate } from '../../utils/formatDate'
import { leaveTodayIso } from '../../utils/leaveToday'

type CalendarTabProps = {
  viewer: LeaveViewer
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
      const iso = cell.toISOString().slice(0, 10)
      row.push(cell.getMonth() === month ? iso : null)
    }
    weeks.push(row)
  }
  return weeks
}

export function CalendarTab({ viewer }: CalendarTabProps) {
  const { snapshot } = useLeave()
  const base = leaveTodayIso()
  const [cursor, setCursor] = useState({ year: Number(base.slice(0, 4)), month: Number(base.slice(5, 7)) - 1 })
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const matrix = useMemo(() => monthMatrix(cursor.year, cursor.month), [cursor])
  if (!snapshot) {
    return null
  }

  const holidays = snapshot.settings.holidays

  return (
    <div className="space-y-6">
      <LeaveTabHeader title="Calendar" subtitle="Holidays, weekly offs, and team leave at a glance." />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={() => setCursor((value) => ({ ...value, month: value.month - 1 }))}>
          Previous
        </Button>
        <Button type="button" variant="outline" onClick={() => setCursor({ year: Number(base.slice(0, 4)), month: Number(base.slice(5, 7)) - 1 })}>
          Today
        </Button>
        <Button type="button" variant="outline" onClick={() => setCursor((value) => ({ ...value, month: value.month + 1 }))}>
          Next
        </Button>
      </div>
      <Card className="sm:hidden">
        <CardContent className="space-y-2 p-4 text-sm">
          {matrix.flat().filter(Boolean).map((day) => (
            <button key={day} type="button" className="w-full rounded-lg border border-hrms-border p-2 text-left" onClick={() => setSelectedDay(day)}>
              {formatDate(day!)}
            </button>
          ))}
        </CardContent>
      </Card>
      <Card className="hidden sm:block">
        <CardContent className="overflow-x-auto p-4">
            <table className="w-full min-w-[560px] border-collapse text-xs">
              <thead>
                <tr>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                    <th key={label} className="pb-2 font-semibold text-hrms-text-secondary">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((week, index) => (
                  <tr key={index}>
                    {week.map((day, dayIndex) => (
                      <td key={dayIndex} className="h-20 border border-hrms-border p-1 align-top">
                        {day ? (
                          <button
                            type="button"
                            className="h-full w-full rounded text-left hover:bg-hrms-row-hover focus-visible:ring-2 focus-visible:ring-hrms-focus"
                            onClick={() => setSelectedDay(day)}
                          >
                            <span className="font-semibold">{day.slice(8)}</span>
                            {holidays.some((item) => item.date === day) ? (
                              <span className="mt-1 block rounded bg-hrms-info/10 px-1 text-hrms-info">Holiday</span>
                            ) : null}
                          </button>
                        ) : null}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
        </CardContent>
      </Card>
      <p className="text-xs text-hrms-text-muted">
        Legend: holiday chips (info), weekly off shading, leave chips by type. Employees see teammates as &quot;On leave&quot;.
      </p>
      <Sheet open={Boolean(selectedDay)} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedDay ? formatDate(selectedDay) : 'Day'}</SheetTitle>
          </SheetHeader>
          <div className="py-4 text-sm">
            <p className="font-semibold">Holidays</p>
            <ul>
              {holidays
                .filter((item) => item.date === selectedDay)
                .map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
            </ul>
            <p className="mt-4 font-semibold">On leave</p>
            <ul>
              {snapshot.requests
                .filter((item) => selectedDay && item.fromDate <= selectedDay && item.toDate >= selectedDay && item.status === 'Approved')
                .map((item) => (
                  <li key={item.id}>
                    {snapshot.employees.find((emp) => emp.id === item.employeeId)?.name ?? item.employeeId}
                    {viewer.role === 'Employee' ? ' — On leave' : ` — ${item.leaveTypeCode}`}
                  </li>
                ))}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
