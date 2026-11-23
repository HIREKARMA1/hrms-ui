/**
 * Month title and prev / Today / next controls on the schedule calendar card.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { addMonths } from '../../utils/formatOfficeCalendarDate'
import { SCHEDULE_MOTION, SCHEDULE_NAV_BTN } from './officeCalendarScheduleUi'

type OfficeCalendarScheduleMonthHeaderProps = {
  monthLabel: string
  month: Date
  onMonthChange: (next: Date) => void
  onToday: () => void
}

export function OfficeCalendarScheduleMonthHeader({
  monthLabel,
  month,
  onMonthChange,
  onToday,
}: OfficeCalendarScheduleMonthHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-[22px] pb-3.5 pt-5">
      <h2 className="text-xl font-bold text-hrms-navy">{monthLabel}</h2>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={`${SCHEDULE_NAV_BTN} ${SCHEDULE_MOTION}`}
          aria-label="Previous month"
          onClick={() => onMonthChange(addMonths(month, -1))}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button type="button" className={`${SCHEDULE_NAV_BTN} px-4 ${SCHEDULE_MOTION}`} onClick={onToday}>
          Today
        </button>
        <button
          type="button"
          className={`${SCHEDULE_NAV_BTN} ${SCHEDULE_MOTION}`}
          aria-label="Next month"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  )
}