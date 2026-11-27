/**
 * Month stepper (‹ month ›) and optional Today on the schedule calendar card.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { addMonths } from '../../utils/formatOfficeCalendarDate'
import {
  SCHEDULE_MOTION,
  SCHEDULE_NAV_BTN,
  SCHEDULE_STEPPER,
  SCHEDULE_STEPPER_LABEL,
} from './officeCalendarScheduleUi'

type OfficeCalendarScheduleMonthHeaderProps = {
  monthLabel: string
  month: Date
  onMonthChange: (next: Date) => void
  onToday: () => void
}

function isCurrentMonth(view: Date, now = new Date()): boolean {
  return view.getFullYear() === now.getFullYear() && view.getMonth() === now.getMonth()
}

export function OfficeCalendarScheduleMonthHeader({
  monthLabel,
  month,
  onMonthChange,
  onToday,
}: OfficeCalendarScheduleMonthHeaderProps) {
  const showToday = !isCurrentMonth(month)

  return (
    <div className="flex flex-wrap items-center gap-2 px-[22px] pb-3.5 pt-5">
      <div className={SCHEDULE_STEPPER} role="group" aria-label="Calendar month">
        <button
          type="button"
          className={`${SCHEDULE_NAV_BTN} rounded-none border-0 border-r border-gray-300 ${SCHEDULE_MOTION}`}
          aria-label="Previous month"
          onClick={() => onMonthChange(addMonths(month, -1))}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <p className={SCHEDULE_STEPPER_LABEL} aria-live="polite">
          {monthLabel}
        </p>
        <button
          type="button"
          className={`${SCHEDULE_NAV_BTN} rounded-none border-0 border-l border-gray-300 ${SCHEDULE_MOTION}`}
          aria-label="Next month"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
      {showToday ? (
        <button
          type="button"
          className={`${SCHEDULE_NAV_BTN} px-4 text-sm font-semibold ${SCHEDULE_MOTION}`}
          onClick={onToday}
        >
          Today
        </button>
      ) : null}
    </div>
  )
}