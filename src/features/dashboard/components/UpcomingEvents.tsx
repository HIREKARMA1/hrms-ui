import { useMemo } from 'react'
import { CalendarClock } from 'lucide-react'

import { useGetCalendarWidgetUpcomingQuery } from '@/features/officeCalendar/api/calendarApi'
import { useShouldFetchCalendarEvents } from '@/features/officeCalendar/hooks/useShouldFetchCalendarEvents'
import { formatOfficeDate } from '@/features/officeCalendar/utils/formatOfficeCalendarDate'
import { mapApiCalendarEventsListToOfficeEvents } from '@/features/officeCalendar/utils/mapApiCalendarEventToOfficeEvent'
import { getApiErrorMessage } from '@/services/api/errors'

import {
  DashboardChartCard,
  DashboardEmptyState,
} from './shared'

function formatEventTime(startTime?: string, allDay?: boolean): string {
  if (allDay) return 'All day'
  if (!startTime) return ''
  return startTime.slice(0, 5)
}

/** Live calendar widget events only — no mock fallback metrics. */
export function UpcomingEvents() {
  const shouldFetch = useShouldFetchCalendarEvents()
  const { data, isFetching, isError, error, isLoading } =
    useGetCalendarWidgetUpcomingQuery({ days: 30, limit: 5 }, { skip: !shouldFetch })

  const rows = useMemo(() => {
    if (!shouldFetch || isError) return []
    const live = mapApiCalendarEventsListToOfficeEvents(data?.items ?? [])
    return live.map((event) => ({
      id: event.id,
      title: event.title,
      date: formatOfficeDate(event.startDate, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      time: formatEventTime(event.startTime, event.allDay),
    }))
  }, [data?.items, isError, shouldFetch])

  return (
    <DashboardChartCard
      title="Upcoming Events"
      description={
        shouldFetch
          ? 'From GET /calendar/widget/upcoming'
          : 'Calendar access is not available for this session.'
      }
    >
      {!shouldFetch ? (
        <DashboardEmptyState
          title="Calendar events unavailable"
          description="Your account cannot fetch the calendar widget for this workspace."
        />
      ) : isError ? (
        <DashboardEmptyState
          title="Could not load upcoming events"
          description={getApiErrorMessage(error, 'API error')}
        />
      ) : isLoading || (isFetching && rows.length === 0) ? (
        <p className="text-sm text-[#667085]">Loading events…</p>
      ) : rows.length === 0 ? (
        <DashboardEmptyState title="No upcoming events in the next 30 days." />
      ) : (
        <div className="space-y-3">
          {rows.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 rounded-xl border border-[#E2E6EF] bg-[#F7F8FC] p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#CCFBF1] text-[#0F766E]">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#17213A]">{event.title}</p>
                <p className="mt-0.5 text-sm text-[#667085]">
                  {event.date}
                  {event.time ? ` · ${event.time}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardChartCard>
  )
}
