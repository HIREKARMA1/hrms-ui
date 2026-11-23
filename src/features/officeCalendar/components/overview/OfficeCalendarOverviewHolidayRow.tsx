/**
 * Single holiday row on Office Calendar Overview.
 */

import { HolidayMandatoryBadge } from '@/components/shared/holidayList/HolidayMandatoryBadge'
import { cn } from '@/lib/utils'

import { OFFICE_CALENDAR_OVERVIEW_TONE_STYLES } from '../../constants/officeCalendarOverviewTypeColors'
import type { OfficeHoliday } from '../../types/officeCalendar'
import { formatOfficeDate } from '../../utils/formatOfficeCalendarDate'
import { officeCalendarOverviewDayMonth } from '../../utils/officeCalendarOverviewDateParts'
import { OVERVIEW_MOTION } from './officeCalendarOverviewUi'

type OfficeCalendarOverviewHolidayRowProps = {
  item: OfficeHoliday
}

export function OfficeCalendarOverviewHolidayRow({ item }: OfficeCalendarOverviewHolidayRowProps) {
  const styles = OFFICE_CALENDAR_OVERVIEW_TONE_STYLES.warning
  const { day, month } = officeCalendarOverviewDayMonth(item.date)

  return (
    <li
      className={cn(
        'flex flex-wrap items-center gap-3.5 rounded-xl border border-hrms-border bg-white p-3.5 sm:flex-nowrap',
        'border-l-4',
        styles.rowAccent,
        OVERVIEW_MOTION,
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
        <p className="text-sm font-semibold text-hrms-navy">{item.name}</p>
        <p className="mt-1 text-[12.5px] text-hrms-text-secondary">
          {formatOfficeDate(item.date)} · {item.type}
        </p>
      </div>
      <HolidayMandatoryBadge mandatory={item.mandatory} />
    </li>
  )
}