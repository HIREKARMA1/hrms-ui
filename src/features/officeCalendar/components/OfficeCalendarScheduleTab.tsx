/**
 * Calendar schedule tab: month grid, agenda, search, live monthly/daily views.
 */
import { useEffect, useMemo } from 'react'

import type { OfficeCalendarEventListSource } from '../context/officeCalendarContext'
import { useOfficeCalendarScheduleLiveViews } from '../hooks/useOfficeCalendarScheduleLiveViews'
import { useOfficeCalendarScheduleUpcoming } from '../hooks/useOfficeCalendarScheduleUpcoming'
import { useOfficeCalendarScheduleView } from '../hooks/useOfficeCalendarScheduleView'
import type { OfficeCalendarEvent, OfficeHoliday } from '../types/officeCalendar'
import { OfficeCalendarScheduleToolbars } from './OfficeCalendarScheduleToolbars'
import { OfficeCalendarScheduleTabPanels } from './OfficeCalendarScheduleTabPanels'
import { OfficeCalendarScheduleViewBanner } from './schedule/OfficeCalendarScheduleViewBanner'

type OfficeCalendarScheduleTabProps = {
  holidays: OfficeHoliday[]
  events: OfficeCalendarEvent[]
  canCreateEvents?: boolean
  onCreateEvent?: (defaultStartDate?: string) => void
  onOpenEvent?: (eventId: string) => void
  eventsSource?: OfficeCalendarEventListSource
  onVisibleYearChange?: (year: number) => void
  eventSearchQuery?: string
  onEventSearchQueryChange?: (query: string) => void
  eventSearchFetching?: boolean
}

export function OfficeCalendarScheduleTab({
  holidays,
  events,
  canCreateEvents,
  onCreateEvent,
  onOpenEvent,
  eventsSource = 'demo',
  onVisibleYearChange,
  eventSearchQuery = '',
  onEventSearchQueryChange,
  eventSearchFetching = false,
}: OfficeCalendarScheduleTabProps) {
  const view = useOfficeCalendarScheduleView(holidays, events)
  const liveViewsEnabled =
    eventsSource === 'api' && eventSearchQuery.trim().length === 0

  const live = useOfficeCalendarScheduleLiveViews({
    enabled: liveViewsEnabled,
    month: view.month,
    selectedDateKey: view.selectedDateKey,
    holidays,
    fallbackEvents: events,
    isVisible: view.isVisible,
  })

  const { upcomingItems: apiUpcomingItems } = useOfficeCalendarScheduleUpcoming(eventsSource)
  const upcomingItems = apiUpcomingItems ?? view.upcomingItems

  useEffect(() => {
    onVisibleYearChange?.(view.month.getFullYear())
  }, [onVisibleYearChange, view.month])

  const monthLabel = useMemo(
    () => view.month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    [view.month],
  )

  const counts = liveViewsEnabled ? live.counts : view.counts
  const allItems = liveViewsEnabled ? live.allItems : view.allItems
  const dayItems = liveViewsEnabled ? live.dayItems : view.dayItems
  const gridEvents = liveViewsEnabled ? live.gridEvents : events

  return (
    <div className="flex flex-col gap-5 font-[family-name:var(--font-inter)]">
      <OfficeCalendarScheduleToolbars
        month={view.month}
        eventsSource={eventsSource}
        eventSearchQuery={eventSearchQuery}
        onEventSearchQueryChange={onEventSearchQueryChange}
        eventSearchFetching={eventSearchFetching}
      />
      {liveViewsEnabled ? (
        <OfficeCalendarScheduleViewBanner
          truncated={live.truncated}
          viewsError={live.viewsError}
          viewsFetching={live.viewsFetching}
        />
      ) : null}
      <OfficeCalendarScheduleTabPanels
        holidays={holidays}
        gridEvents={gridEvents}
        month={view.month}
        monthLabel={monthLabel}
        todayKey={view.todayKey}
        selectedDateKey={view.selectedDateKey}
        allItems={allItems}
        counts={counts}
        hidden={view.hidden}
        onToggleCategory={view.toggleCategory}
        isVisible={view.isVisible}
        onMonthChange={view.setMonth}
        onSelectDate={view.handleSelectDate}
        onToday={view.goToday}
        agendaTitle={view.agendaTitle}
        dayItems={dayItems}
        upcomingItems={upcomingItems}
        canCreateEvents={canCreateEvents}
        onCreateEvent={onCreateEvent}
        onOpenEvent={onOpenEvent}
      />
    </div>
  )
}