/**
 * Single upcoming event row on Office Calendar Overview.
 */

import { CalendarClock } from 'lucide-react'

import { cn } from '@/lib/utils'

import {
  OFFICE_CALENDAR_OVERVIEW_EVENT_TYPE_TONE,
  OFFICE_CALENDAR_OVERVIEW_TONE_STYLES,
} from '../../constants/officeCalendarOverviewTypeColors'
import type { OfficeCalendarEvent } from '../../types/officeCalendar'
import { formatOfficeDate } from '../../utils/formatOfficeCalendarDate'
import { officeCalendarOverviewDayMonth } from '../../utils/officeCalendarOverviewDateParts'
import { OVERVIEW_MOTION } from './officeCalendarOverviewUi'

type OfficeCalendarOverviewEventRowProps = {
  item: OfficeCalendarEvent
  todayKey: string
  onOpenEvent?: (eventId: string) => void
}

export function OfficeCalendarOverviewEventRow({
  item,
  todayKey,
  onOpenEvent,
}: OfficeCalendarOverviewEventRowProps) {
  const tone = OFFICE_CALENDAR_OVERVIEW_EVENT_TYPE_TONE[item.type]
  const styles = OFFICE_CALENDAR_OVERVIEW_TONE_STYLES[tone]
  const { day, month } = officeCalendarOverviewDayMonth(item.startDate)
  const isToday = item.startDate === todayKey
  const timeLabel = item.startTime ? item.startTime : null

  return (
    <li>
      <button
        type="button"
        disabled={!onOpenEvent}
        onClick={() => onOpenEvent?.(item.id)}
        className={cn(
          'flex w-full flex-wrap items-center gap-3.5 rounded-xl border border-hrms-border bg-white p-3.5 text-left sm:flex-nowrap',
          'border-l-4',
          styles.rowAccent,
          OVERVIEW_MOTION,
          'hover:bg-hrms-row-hover disabled:cursor-default',
          isToday && 'border-hrms-lavender-border bg-hrms-lavender',
        )}
      >
        <div
          className={cn(
            'flex h-[46px] w-[46px] shrink-0 flex-col items-center justify-center rounded-xl',
            styles.dateTile,
          )}
        >
          <span className={cn('text-lg font-bold leading-none', styles.dateDay)}>{day}</span>
          <span className={cn('text-[11px] font-semibold', styles.dateMonth)}>{month}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-hrms-navy">{item.title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[12.5px] text-hrms-text-secondary">
            <CalendarClock className="h-3 w-3 shrink-0" aria-hidden />
            <span>
              {formatOfficeDate(item.startDate)}
              {timeLabel ? ` · ${timeLabel}` : ''} · {item.organizerName}
            </span>
          </p>
        </div>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', styles.typePill)}>
          {item.type}
        </span>
      </button>
    </li>
  )
}