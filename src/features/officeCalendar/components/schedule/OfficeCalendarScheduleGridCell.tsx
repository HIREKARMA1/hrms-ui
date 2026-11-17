/**
 * Single day button in the schedule month grid.
 */

import { cn } from '@/lib/utils'

import type { OfficeCalendarScheduleCategory } from '../../constants/officeCalendarScheduleCategoryColors'
import { OFFICE_CALENDAR_SCHEDULE_CATEGORY_STYLES } from '../../constants/officeCalendarScheduleCategoryColors'
import type { OfficeCalendarScheduleItem } from '../../utils/officeCalendarScheduleItems'
import { itemsForDate } from '../../utils/officeCalendarScheduleItems'
import type { MonthGridCell } from '../../utils/monthGridUtils'
import { SCHEDULE_CELL_SELECTED, SCHEDULE_MOTION } from './officeCalendarScheduleUi'
import { OfficeCalendarScheduleGridPill } from './OfficeCalendarScheduleGridPill'

type OfficeCalendarScheduleGridCellProps = {
  cell: MonthGridCell
  todayKey: string
  selectedDateKey: string
  allItems: OfficeCalendarScheduleItem[]
  isVisible: (category: OfficeCalendarScheduleCategory) => boolean
  onSelectDate: (dateKey: string) => void
  tabIndex: number
}

export function OfficeCalendarScheduleGridCell({
  cell,
  todayKey,
  selectedDateKey,
  allItems,
  isVisible,
  onSelectDate,
  tabIndex,
}: OfficeCalendarScheduleGridCellProps) {
  const isSelected = selectedDateKey === cell.key
  const isToday = cell.key === todayKey
  const weekend = cell.date.getDay() === 0 || cell.date.getDay() === 6
  const dayItems = itemsForDate(allItems, cell.key, isVisible)
  const hasHoliday = dayItems.some((item) => item.category === 'holiday')
  const pills = dayItems.slice(0, 2)
  const more = dayItems.length - pills.length
  const ariaTitles = dayItems.map((item) => item.title).join(', ')

  return (
    <button
      type="button"
      id={`office-cal-day-${cell.key}`}
      disabled={!cell.inMonth}
      tabIndex={tabIndex}
      aria-label={`${cell.date.getDate()} ${cell.date.toLocaleString(undefined, { month: 'long' })}${ariaTitles ? `: ${ariaTitles}` : ''}`}
      onClick={() => onSelectDate(cell.key)}
      className={cn(
        SCHEDULE_MOTION,
        'min-h-16 border-b border-r border-gray-200 p-2 text-left max-md:flex max-md:min-h-16 max-md:flex-col max-md:items-center md:min-h-28',
        !cell.inMonth && 'cursor-not-allowed bg-gray-100 text-gray-500',
        cell.inMonth && 'bg-white hover:brightness-[0.96]',
        cell.inMonth && weekend && 'bg-gray-50',
        cell.inMonth && hasHoliday && 'bg-orange-50',
        isSelected && cell.inMonth && SCHEDULE_CELL_SELECTED,
      )}
    >
      <span
        className={cn(
          'flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-xs font-bold',
          !cell.inMonth && 'text-gray-500',
          cell.inMonth && !isToday && 'text-hrms-navy',
          isToday && cell.inMonth && 'bg-hrms-primary text-white',
        )}
      >
        {cell.date.getDate()}
      </span>
      <div className="mt-1 w-full space-y-1 max-md:hidden">
        {pills.map((item) => (
          <OfficeCalendarScheduleGridPill key={item.id} item={item} />
        ))}
        {more > 0 ? <span className="text-[11px] font-semibold text-hrms-primary">+{more} more</span> : null}
      </div>
      <div className="mt-1 hidden flex-wrap justify-center gap-0.5 max-md:flex">
        {pills.map((item) => (
          <span
            key={`dot-${item.id}`}
            className={cn('h-2 w-2 rounded-full', OFFICE_CALENDAR_SCHEDULE_CATEGORY_STYLES[item.category].dot)}
            aria-hidden
          />
        ))}
      </div>
    </button>
  )
}