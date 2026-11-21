import { useMemo } from 'react'
import { CalendarClock } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useGetCalendarWidgetUpcomingQuery } from '@/features/officeCalendar/api/calendarApi'
import { useShouldFetchCalendarEvents } from '@/features/officeCalendar/hooks/useShouldFetchCalendarEvents'
import { formatOfficeDate } from '@/features/officeCalendar/utils/formatOfficeCalendarDate'
import { mapApiCalendarEventsListToOfficeEvents } from '@/features/officeCalendar/utils/mapApiCalendarEventToOfficeEvent'

import { upcomingEvents as mockUpcomingEvents } from '../utils/sampleData'

function formatEventTime(startTime?: string, allDay?: boolean): string {
  if (allDay) return 'All day'
  if (!startTime) return ''
  return startTime.slice(0, 5)
}

export function UpcomingEvents() {
  const shouldFetch = useShouldFetchCalendarEvents()
  const { data, isFetching, isError } = useGetCalendarWidgetUpcomingQuery(
    { days: 30, limit: 5 },
    { skip: !shouldFetch },
  )

  const rows = useMemo(() => {
    if (!shouldFetch || isError) {
      return mockUpcomingEvents.map((event) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
      }))
    }

    const live = mapApiCalendarEventsListToOfficeEvents(data?.items ?? [])
    if (live.length === 0 && isFetching) {
      return mockUpcomingEvents.map((event) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
      }))
    }

    return live.map((event) => ({
      id: event.id,
      title: event.title,
      date: formatOfficeDate(event.startDate, { day: 'numeric', month: 'short', year: 'numeric' }),
      time: formatEventTime(event.startTime, event.allDay),
    }))
  }, [data?.items, isError, isFetching, shouldFetch])

  const description =
    shouldFetch && !isError
      ? 'From GET /calendar/widget/upcoming'
      : 'Scheduled HR and team activities'

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming events in the next 30 days.</p>
        ) : (
          rows.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{event.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {event.date}
                  {event.time ? ` · ${event.time}` : ''}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}