import type { OfficeCalendarEvent, OfficeHoliday } from '../types/officeCalendar'

import { useOfficeCalendarScheduleView } from '../hooks/useOfficeCalendarScheduleView'

import { OfficeCalendarScheduleAgendaCard } from './schedule/OfficeCalendarScheduleAgendaCard'

import { OfficeCalendarScheduleMonthCard } from './schedule/OfficeCalendarScheduleMonthCard'

import { OfficeCalendarScheduleUpcomingCard } from './schedule/OfficeCalendarScheduleUpcomingCard'



type OfficeCalendarScheduleTabProps = {

  holidays: OfficeHoliday[]

  events: OfficeCalendarEvent[]

  canManageEvents?: boolean

  onCreateEvent?: (defaultStartDate?: string) => void

  onOpenEvent?: (eventId: string) => void

}



/** Calendar schedule view at /hr/calendar/schedule (month grid + agenda + upcoming). */

export function OfficeCalendarScheduleTab({

  holidays,

  events,

  canManageEvents,

  onCreateEvent,

  onOpenEvent,

}: OfficeCalendarScheduleTabProps) {

  const view = useOfficeCalendarScheduleView(holidays, events)

  const monthLabel = view.month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })



  return (

    <div className="flex flex-col gap-5 font-[family-name:var(--font-inter)]">

      <div className="flex flex-col gap-[18px] lg:flex-row lg:items-start">

        <OfficeCalendarScheduleMonthCard

          month={view.month}

          monthLabel={monthLabel}

          holidays={holidays}

          events={events}

          todayKey={view.todayKey}

          selectedDateKey={view.selectedDateKey}

          allItems={view.allItems}

          counts={view.counts}

          hidden={view.hidden}

          onToggleCategory={view.toggleCategory}

          isVisible={view.isVisible}

          onMonthChange={view.setMonth}

          onSelectDate={view.handleSelectDate}

          onToday={view.goToday}

        />

        <div className="flex w-full max-w-[400px] min-w-[280px] flex-col gap-[18px] max-lg:max-w-none">

          <OfficeCalendarScheduleAgendaCard

            selectedDateKey={view.selectedDateKey}

            agendaTitle={view.agendaTitle}

            dayItems={view.dayItems}

            canManageEvents={canManageEvents}

            onCreateEvent={

              canManageEvents && onCreateEvent

                ? () => onCreateEvent(view.selectedDateKey)

                : undefined

            }

            onOpenEvent={onOpenEvent}

          />

          <OfficeCalendarScheduleUpcomingCard items={view.upcomingItems} onSelectDate={view.handleSelectDate} />

        </div>

      </div>

    </div>

  )

}
