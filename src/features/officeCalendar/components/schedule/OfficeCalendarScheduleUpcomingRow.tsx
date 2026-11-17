/**
 * One upcoming row after the selected day on the schedule tab.
 */

import { cn } from '@/lib/utils'

import { OFFICE_CALENDAR_SCHEDULE_CATEGORY_STYLES } from '../../constants/officeCalendarScheduleCategoryColors'
import type { OfficeCalendarScheduleItem } from '../../utils/officeCalendarScheduleItems'
import { formatScheduleTime } from '../../utils/officeCalendarScheduleItems'
import { officeCalendarOverviewDayMonth } from '../../utils/officeCalendarOverviewDateParts'
import { SCHEDULE_MOTION } from './officeCalendarScheduleUi'

const CATEGORY_LABEL: Record<OfficeCalendarScheduleItem['category'], string> = {
  holiday: 'Holiday',
  event: 'Event',
  meeting: 'Meeting',
  training: 'Training',
}

type OfficeCalendarScheduleUpcomingRowProps = {
  item: OfficeCalendarScheduleItem
  onSelectDate: (dateKey: string) => void
}

export function OfficeCalendarScheduleUpcomingRow({ item, onSelectDate }: OfficeCalendarScheduleUpcomingRowProps) {
  const styles = OFFICE_CALENDAR_SCHEDULE_CATEGORY_STYLES[item.category]
  const { day, month } = officeCalendarOverviewDayMonth(item.dateKey)

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelectDate(item.dateKey)}
        className={cn(
          'flex min-h-[52px] w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left',
          SCHEDULE_MOTION,
          'hover:bg-hrms-row-hover',
        )}
      >
        <div
          className={cn(
            'flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-xl',
            styles.dateChip,
          )}
        >
          <span className="text-[17px] font-bold leading-none">{day}</span>
          <span className="text-[11px] font-semibold opacity-80">{month}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-hrms-navy">{item.title}</p>
          <p className="text-[12.5px] text-gray-500">
            {formatScheduleTime(item)} · {CATEGORY_LABEL[item.category]}
          </p>
        </div>
      </button>
    </li>
  )
}