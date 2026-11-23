/**
 * Weekday headers and day grid for the schedule calendar card.
 */

import { useMemo } from 'react'

import type { OfficeCalendarScheduleCategory } from '../../constants/officeCalendarScheduleCategoryColors'
import { buildEventsByDay } from '../../utils/buildEventsByDay'
import type { OfficeCalendarEvent, OfficeHoliday } from '../../types/officeCalendar'
import type { OfficeCalendarScheduleItem } from '../../utils/officeCalendarScheduleItems'
import { buildMonthGridCells, MONTH_GRID_WEEKDAYS } from '../../utils/monthGridUtils'
import { OfficeCalendarScheduleGridCell } from './OfficeCalendarScheduleGridCell'

type OfficeCalendarScheduleGridProps = {
  month: Date
  holidays: OfficeHoliday[]
  events: OfficeCalendarEvent[]
  todayKey: string
  selectedDateKey: string
  allItems: OfficeCalendarScheduleItem[]
  isVisible: (category: OfficeCalendarScheduleCategory) => boolean
  onSelectDate: (dateKey: string) => void
}

export function OfficeCalendarScheduleGrid({
  month,
  holidays,
  events,
  todayKey,
  selectedDateKey,
  allItems,
  isVisible,
  onSelectDate,
}: OfficeCalendarScheduleGridProps) {
  const byDay = useMemo(() => buildEventsByDay(holidays, events), [holidays, events])
  const cells = useMemo(() => buildMonthGridCells(month, byDay), [byDay, month])

  return (
  <>
      <div className="grid grid-cols-7 border-y border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-500">
        {MONTH_GRID_WEEKDAYS.map((label) => (
          <div key={label} className="px-[11px] py-2.5">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7" role="grid" aria-label="Month calendar">
        {cells.map((cell) => (
          <OfficeCalendarScheduleGridCell
            key={cell.key}
            cell={cell}
            todayKey={todayKey}
            selectedDateKey={selectedDateKey}
            allItems={allItems}
            isVisible={isVisible}
            onSelectDate={onSelectDate}
            tabIndex={selectedDateKey === cell.key ? 0 : -1}
          />
        ))}
      </div>
    </>
  )
}