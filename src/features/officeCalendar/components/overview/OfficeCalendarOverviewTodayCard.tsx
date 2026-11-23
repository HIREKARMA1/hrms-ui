/**
 * Today strip on Office Calendar Overview (date tile + event chips).
 */

import type { OfficeCalendarEvent, OfficeHoliday } from '../../types/officeCalendar'
import { formatOfficeDate } from '../../utils/formatOfficeCalendarDate'
import { officeCalendarOverviewDayMonth } from '../../utils/officeCalendarOverviewDateParts'
import { OVERVIEW_MOTION, OVERVIEW_TODAY_SHELL } from './officeCalendarOverviewUi'

type OfficeCalendarOverviewTodayCardProps = {
  todayKey: string
  todayHolidays: OfficeHoliday[]
  todayEvents: OfficeCalendarEvent[]
  onOpenEvent?: (eventId: string) => void
}

export function OfficeCalendarOverviewTodayCard({
  todayKey,
  todayHolidays,
  todayEvents,
  onOpenEvent,
}: OfficeCalendarOverviewTodayCardProps) {
  const { day, month } = officeCalendarOverviewDayMonth(todayKey)
  const hasItems = todayHolidays.length > 0 || todayEvents.length > 0

  return (
    <section className={OVERVIEW_TODAY_SHELL} aria-label="Today">
      <div className="flex h-[62px] w-[58px] shrink-0 flex-col items-center justify-center rounded-2xl bg-hrms-primary text-white">
        <span className="block text-2xl font-bold leading-none">{day}</span>
        <span className="mt-0.5 block text-xs font-semibold text-brand-100">{month}</span>
      </div>
      <div>
        <span className="inline-flex rounded-full bg-hrms-primary px-2.5 py-0.5 text-xs font-semibold text-white">
          Today
        </span>
        <p className="mt-1 text-lg font-bold text-hrms-navy">{formatOfficeDate(todayKey)}</p>
        {!hasItems ? (
          <p className="mt-1 text-xs text-hrms-text-secondary">No holidays or events scheduled today.</p>
        ) : null}
      </div>
      {hasItems ? (
        <ul className="ml-auto flex flex-wrap gap-2">
          {todayHolidays.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-hrms-border bg-white px-2.5 py-1 text-xs font-semibold text-hrms-navy"
            >
              {item.name}
            </li>
          ))}
          {todayEvents.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                disabled={!onOpenEvent}
                onClick={() => onOpenEvent?.(item.id)}
                className={`flex items-center gap-2 rounded-lg border border-hrms-border bg-white px-2.5 py-1 text-xs font-semibold text-hrms-navy ${OVERVIEW_MOTION} hover:bg-hrms-row-hover disabled:cursor-default`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-hrms-success/40 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-hrms-success ring-4 ring-hrms-success/25" />
                </span>
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}