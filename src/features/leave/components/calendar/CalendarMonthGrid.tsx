/**
 * Equal-width month grid with today ring, weekly off shading, and leave chips.
 * Hidden below sm breakpoint in favor of CalendarAgendaList.
 */

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { isWeeklyOffDay } from '../../utils/weekday'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { LEAVE_MOTION } from '../shared/leaveUi'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

type CalendarMonthGridProps = {
  matrix: (string | null)[][]
  holidaysByDay: Map<string, string[]>
  leaveByDay: Map<string, { code: string }[]>
  todayIso: string
  selectedDay: string | null
  onSelectDay: (day: string) => void
  weeklyOffDays: number[]
}

export function CalendarMonthGrid({
  matrix,
  holidaysByDay,
  leaveByDay,
  todayIso,
  selectedDay,
  onSelectDay,
  weeklyOffDays,
}: CalendarMonthGridProps) {
  return (
    <Card className="hidden sm:block">
      <CardContent className="p-4">
        <table className="w-full table-fixed border-collapse text-xs">
          <thead>
            <tr>
              {WEEKDAYS.map((label) => (
                <th key={label} className="pb-2 text-center text-xs font-semibold text-hrms-text-secondary">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((week, weekIndex) => (
              <tr key={weekIndex}>
                {week.map((day, dayIndex) => (
                  <td key={dayIndex} className="border border-hrms-border/60 p-0 align-top">
                    {day ? (
                      <button
                        type="button"
                        onClick={() => onSelectDay(day)}
                        className={cn(
                          'flex h-24 w-full flex-col gap-1 p-1.5 text-left',
                          LEAVE_MOTION,
                          isWeeklyOffDay(day, weeklyOffDays) && 'bg-hrms-muted-bg/80',
                          day === todayIso && 'ring-2 ring-inset ring-hrms-primary',
                          selectedDay === day && 'bg-hrms-lavender/50',
                          'hover:bg-hrms-row-hover focus-visible:ring-2 focus-visible:ring-hrms-focus',
                        )}
                      >
                        <span className="text-sm font-semibold tabular-nums text-hrms-navy">{day.slice(8)}</span>
                        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
                          {(holidaysByDay.get(day) ?? []).slice(0, 1).map((name) => (
                            <span key={name} className="truncate rounded bg-hrms-info/10 px-1 py-0.5 text-[10px] text-hrms-navy" title={name}>
                              {name}
                            </span>
                          ))}
                          {(leaveByDay.get(day) ?? []).slice(0, 2).map((item) => (
                            <LeaveTypeChip key={item.code} code={item.code} abbreviated className="truncate text-[10px]" />
                          ))}
                        </div>
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
  )
}
