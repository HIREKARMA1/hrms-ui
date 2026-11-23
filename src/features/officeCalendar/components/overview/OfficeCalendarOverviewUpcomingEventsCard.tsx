/**
 * Upcoming events card on Office Calendar Overview.
 */

import { CalendarClock } from 'lucide-react'

import { cn } from '@/lib/utils'

import { OFFICE_CALENDAR_OVERVIEW_TONE_STYLES } from '../../constants/officeCalendarOverviewTypeColors'
import type { OfficeCalendarEvent } from '../../types/officeCalendar'
import { OfficeCalendarOverviewEventRow } from './OfficeCalendarOverviewEventRow'
import { OVERVIEW_CARD, OVERVIEW_LAVENDER_BUTTON, OVERVIEW_MOTION } from './officeCalendarOverviewUi'

type OfficeCalendarOverviewUpcomingEventsCardProps = {
  subtitle: string
  todayKey: string
  items: OfficeCalendarEvent[]
  emptyLabel: string
  onViewAll?: () => void
  onOpenEvent?: (eventId: string) => void
}

export function OfficeCalendarOverviewUpcomingEventsCard({
  subtitle,
  todayKey,
  items,
  emptyLabel,
  onViewAll,
  onOpenEvent,
}: OfficeCalendarOverviewUpcomingEventsCardProps) {
  const headerIcon = OFFICE_CALENDAR_OVERVIEW_TONE_STYLES.primary

  return (
    <section className={OVERVIEW_CARD} aria-labelledby="overview-upcoming-events">
      <header className="flex items-start gap-3 border-b border-hrms-border px-4 py-3.5">
        <span
          className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', headerIcon.iconTile)}
        >
          <CalendarClock className={cn('h-5 w-5', headerIcon.icon)} aria-hidden />
        </span>
        <div>
          <h2 id="overview-upcoming-events" className="text-base font-semibold text-hrms-navy">
            Upcoming events
          </h2>
          <p className="text-sm text-hrms-text-secondary">{subtitle}</p>
        </div>
      </header>
      <div className="flex flex-col gap-2.5 p-4">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-hrms-border px-3 py-8 text-center text-sm text-hrms-text-muted">
            {emptyLabel}
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {items.map((item) => (
              <OfficeCalendarOverviewEventRow
                key={item.id}
                item={item}
                todayKey={todayKey}
                onOpenEvent={onOpenEvent}
              />
            ))}
          </ul>
        )}
        {onViewAll ? (
          <button type="button" className={`${OVERVIEW_LAVENDER_BUTTON} ${OVERVIEW_MOTION}`} onClick={onViewAll}>
            View calendar
          </button>
        ) : null}
      </div>
    </section>
  )
}