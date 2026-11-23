/**
 * Full month calendar card on the schedule tab.
 */

import type { OfficeCalendarScheduleCategory } from '../../constants/officeCalendarScheduleCategoryColors'
import type { OfficeCalendarEvent, OfficeHoliday } from '../../types/officeCalendar'
import type { OfficeCalendarScheduleItem } from '../../utils/officeCalendarScheduleItems'
import { OfficeCalendarScheduleGrid } from './OfficeCalendarScheduleGrid'
import { OfficeCalendarScheduleLegend } from './OfficeCalendarScheduleLegend'
import { OfficeCalendarScheduleMonthHeader } from './OfficeCalendarScheduleMonthHeader'
import { SCHEDULE_CARD } from './officeCalendarScheduleUi'

type OfficeCalendarScheduleMonthCardProps = {
  month: Date
  monthLabel: string
  holidays: OfficeHoliday[]
  events: OfficeCalendarEvent[]
  todayKey: string
  selectedDateKey: string
  allItems: OfficeCalendarScheduleItem[]
  counts: Record<OfficeCalendarScheduleCategory, number>
  hidden: Set<OfficeCalendarScheduleCategory>
  onToggleCategory: (category: OfficeCalendarScheduleCategory) => void
  isVisible: (category: OfficeCalendarScheduleCategory) => boolean
  onMonthChange: (next: Date) => void
  onSelectDate: (dateKey: string) => void
  onToday: () => void
}

export function OfficeCalendarScheduleMonthCard(props: OfficeCalendarScheduleMonthCardProps) {
  const {
    month,
    monthLabel,
    holidays,
    events,
    todayKey,
    selectedDateKey,
    allItems,
    counts,
    hidden,
    onToggleCategory,
    isVisible,
    onMonthChange,
    onSelectDate,
    onToday,
  } = props

  return (
    <section className={`${SCHEDULE_CARD} min-w-0 flex-1 md:min-w-[640px]`} aria-label="Calendar">
      <OfficeCalendarScheduleMonthHeader
        monthLabel={monthLabel}
        month={month}
        onMonthChange={onMonthChange}
        onToday={onToday}
      />
      <OfficeCalendarScheduleLegend counts={counts} hidden={hidden} onToggle={onToggleCategory} />
      <OfficeCalendarScheduleGrid
        month={month}
        holidays={holidays}
        events={events}
        todayKey={todayKey}
        selectedDateKey={selectedDateKey}
        allItems={allItems}
        isVisible={isVisible}
        onSelectDate={onSelectDate}
      />
    </section>
  )
}