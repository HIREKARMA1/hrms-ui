/**
 * Category pill inside a month grid day cell (desktop).
 */

import { cn } from '@/lib/utils'

import { OFFICE_CALENDAR_SCHEDULE_CATEGORY_STYLES } from '../../constants/officeCalendarScheduleCategoryColors'
import type { OfficeCalendarScheduleItem } from '../../utils/officeCalendarScheduleItems'
import { formatScheduleTime, formatScheduleTooltip } from '../../utils/officeCalendarScheduleItems'

type OfficeCalendarScheduleGridPillProps = {
  item: OfficeCalendarScheduleItem
}

export function OfficeCalendarScheduleGridPill({ item }: OfficeCalendarScheduleGridPillProps) {
  const styles = OFFICE_CALENDAR_SCHEDULE_CATEGORY_STYLES[item.category]
  const time = formatScheduleTime(item)
  const showTime = time !== 'All day' && item.startTime

  return (
    <span title={formatScheduleTooltip(item)} className={cn('block rounded-md px-[7px] py-1 text-left', styles.bar, styles.pill)}>
      {showTime ? (
        <span className="block text-[10.5px] font-medium leading-tight opacity-90">{item.startTime}</span>
      ) : null}
      <span className="line-clamp-2 text-xs font-bold leading-snug">{item.title}</span>
    </span>
  )
}