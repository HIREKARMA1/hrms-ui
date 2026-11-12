import { CalendarClock } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { upcomingEvents } from '../utils/sampleData'

export function UpcomingEvents() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>Scheduled HR and team activities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingEvents.map((event) => (
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
                {event.date} · {event.time}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
