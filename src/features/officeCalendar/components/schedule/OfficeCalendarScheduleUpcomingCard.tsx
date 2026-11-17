/**
 * Upcoming items after the selected day on the schedule tab.
 */

import type { OfficeCalendarScheduleItem } from '../../utils/officeCalendarScheduleItems'
import { OfficeCalendarScheduleUpcomingRow } from './OfficeCalendarScheduleUpcomingRow'
import { SCHEDULE_CARD } from './officeCalendarScheduleUi'

type OfficeCalendarScheduleUpcomingCardProps = {
  items: OfficeCalendarScheduleItem[]
  onSelectDate: (dateKey: string) => void
}

export function OfficeCalendarScheduleUpcomingCard({ items, onSelectDate }: OfficeCalendarScheduleUpcomingCardProps) {
  if (items.length === 0) return null

  return (
    <section className={`${SCHEDULE_CARD} p-[18px]`} aria-labelledby="schedule-upcoming">
      <h2 id="schedule-upcoming" className="text-base font-bold text-hrms-navy">
        Upcoming
      </h2>
      <p className="mt-0.5 text-[12.5px] text-gray-500">After the selected day</p>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <OfficeCalendarScheduleUpcomingRow key={item.id} item={item} onSelectDate={onSelectDate} />
        ))}
      </ul>
    </section>
  )
}