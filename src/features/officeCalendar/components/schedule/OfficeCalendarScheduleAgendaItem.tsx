/**
 * Single agenda row on the selected day (schedule tab).
 */

import { Clock, User } from 'lucide-react'

import { cn } from '@/lib/utils'

import { OFFICE_CALENDAR_SCHEDULE_CATEGORY_STYLES } from '../../constants/officeCalendarScheduleCategoryColors'
import type { OfficeCalendarScheduleItem } from '../../utils/officeCalendarScheduleItems'
import { formatScheduleTime } from '../../utils/officeCalendarScheduleItems'
import { SCHEDULE_MOTION } from './officeCalendarScheduleUi'

type OfficeCalendarScheduleAgendaItemProps = {
  item: OfficeCalendarScheduleItem
  onOpen?: (eventId: string) => void
}

export function OfficeCalendarScheduleAgendaItem({ item, onOpen }: OfficeCalendarScheduleAgendaItemProps) {
  const styles = OFFICE_CALENDAR_SCHEDULE_CATEGORY_STYLES[item.category]
  const eventId = item.isCompanyHoliday ? null : item.id.split('-')[0]
  if (onOpen && eventId) {
    return (
      <button
        type="button"
        onClick={() => onOpen(eventId)}
        className={cn(
          'w-full overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm',
          styles.bar,
          SCHEDULE_MOTION,
          'hover:bg-hrms-row-hover',
        )}
      >
        <AgendaItemBody item={item} styles={styles} />
      </button>
    )
  }

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm',
        styles.bar,
        SCHEDULE_MOTION,
      )}
    >
      <AgendaItemBody item={item} styles={styles} />
    </div>
  )
}

function AgendaItemBody({
  item,
  styles,
}: {
  item: OfficeCalendarScheduleItem
  styles: (typeof OFFICE_CALENDAR_SCHEDULE_CATEGORY_STYLES)[OfficeCalendarScheduleItem['category']]
}) {
  return (
    <>
      {item.isCompanyHoliday ? (
        <p className="bg-amber-50 px-3 py-1 text-center text-xs font-semibold text-amber-900">Company holiday</p>
      ) : null}
      <div className="space-y-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[15px] font-bold text-hrms-navy">{item.title}</p>
          <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize', styles.pill)}>
            {item.category}
          </span>
        </div>
        <p className="flex flex-wrap items-center gap-3 text-[12.5px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {formatScheduleTime(item)}
          </span>
          {item.organizerName ? (
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" aria-hidden />
              {item.organizerName}
            </span>
          ) : null}
        </p>
      </div>
    </>
  )
}