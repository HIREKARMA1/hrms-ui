/**
 * Schedule tab month grid + agenda column (extracted to keep tab shell small).
 */
import type { OfficeCalendarScheduleCategory } from '../constants/officeCalendarScheduleCategoryColors'
import type { OfficeCalendarEvent, OfficeHoliday } from '../types/officeCalendar'
import type { OfficeCalendarScheduleItem } from '../utils/officeCalendarScheduleItems'
import { OfficeCalendarScheduleAgendaCard } from './schedule/OfficeCalendarScheduleAgendaCard'
import { OfficeCalendarScheduleMonthCard } from './schedule/OfficeCalendarScheduleMonthCard'
import { OfficeCalendarScheduleUpcomingCard } from './schedule/OfficeCalendarScheduleUpcomingCard'

type OfficeCalendarScheduleTabPanelsProps = {
  holidays: OfficeHoliday[]
  gridEvents: OfficeCalendarEvent[]
  month: Date
  monthLabel: string
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
  agendaTitle: string
  dayItems: OfficeCalendarScheduleItem[]
  upcomingItems: OfficeCalendarScheduleItem[]
  canCreateEvents?: boolean
  onCreateEvent?: (defaultStartDate?: string) => void
  onOpenEvent?: (eventId: string) => void
}

export function OfficeCalendarScheduleTabPanels(props: OfficeCalendarScheduleTabPanelsProps) {
  return (
    <div className="flex flex-col gap-[18px] lg:flex-row lg:items-start">
      <OfficeCalendarScheduleMonthCard
        month={props.month}
        monthLabel={props.monthLabel}
        holidays={props.holidays}
        events={props.gridEvents}
        todayKey={props.todayKey}
        selectedDateKey={props.selectedDateKey}
        allItems={props.allItems}
        counts={props.counts}
        hidden={props.hidden}
        onToggleCategory={props.onToggleCategory}
        isVisible={props.isVisible}
        onMonthChange={props.onMonthChange}
        onSelectDate={props.onSelectDate}
        onToday={props.onToday}
      />
      <div className="flex w-full max-w-[400px] min-w-[280px] flex-col gap-[18px] max-lg:max-w-none">
        <OfficeCalendarScheduleAgendaCard
          selectedDateKey={props.selectedDateKey}
          agendaTitle={props.agendaTitle}
          dayItems={props.dayItems}
          canCreateEvents={props.canCreateEvents}
          onCreateEvent={
            props.canCreateEvents && props.onCreateEvent
              ? () => props.onCreateEvent?.(props.selectedDateKey)
              : undefined
          }
          onOpenEvent={props.onOpenEvent}
        />
        <OfficeCalendarScheduleUpcomingCard
          items={props.upcomingItems}
          onSelectDate={props.onSelectDate}
        />
      </div>
    </div>
  )
}