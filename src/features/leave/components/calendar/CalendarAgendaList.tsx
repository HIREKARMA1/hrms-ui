/**
 * Mobile agenda list (below 640px) replacing the month grid on CalendarTab.
 */

import { Card, CardContent } from '@/components/ui/card'

import { formatDate } from '../../utils/formatDate'
import { LeaveTypeChip } from '../LeaveTypeChip'

type CalendarAgendaListProps = {
  days: string[]
  holidaysByDay: Map<string, string[]>
  leaveByDay: Map<string, { code: string; label: string }[]>
  todayIso: string
  onSelectDay: (day: string) => void
}

export function CalendarAgendaList({ days, holidaysByDay, leaveByDay, todayIso, onSelectDay }: CalendarAgendaListProps) {
  return (
    <Card className="max-sm:block sm:hidden">
      <CardContent className="space-y-2 p-4">
        {days.map((day) => (
          <button
            key={day}
            type="button"
            className={`w-full rounded-xl border border-hrms-border p-3 text-left text-sm transition-colors hover:bg-hrms-row-hover focus-visible:ring-2 focus-visible:ring-hrms-focus ${day === todayIso ? 'ring-2 ring-hrms-primary' : ''}`}
            onClick={() => onSelectDay(day)}
          >
            <span className="font-medium tabular-nums text-hrms-navy">{formatDate(day)}</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {(holidaysByDay.get(day) ?? []).map((name) => (
                <span key={name} className="rounded-md bg-hrms-info/10 px-1.5 py-0.5 text-xs text-hrms-navy">
                  {name}
                </span>
              ))}
              {(leaveByDay.get(day) ?? []).map((chip) => (
                <LeaveTypeChip key={`${day}-${chip.code}-${chip.label}`} code={chip.code} abbreviated />
              ))}
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
