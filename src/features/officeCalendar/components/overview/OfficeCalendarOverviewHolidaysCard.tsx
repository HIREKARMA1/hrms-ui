/**
 * Next holidays card on Office Calendar Overview.
 */

import { ListOrdered } from 'lucide-react'

import { cn } from '@/lib/utils'

import { OFFICE_CALENDAR_OVERVIEW_TONE_STYLES } from '../../constants/officeCalendarOverviewTypeColors'
import type { OfficeHoliday } from '../../types/officeCalendar'
import { OfficeCalendarOverviewHolidayRow } from './OfficeCalendarOverviewHolidayRow'
import { OVERVIEW_CARD, OVERVIEW_LAVENDER_BUTTON, OVERVIEW_MOTION } from './officeCalendarOverviewUi'

type OfficeCalendarOverviewHolidaysCardProps = {
  subtitle: string
  items: OfficeHoliday[]
  emptyLabel: string
  onViewAll?: () => void
}

export function OfficeCalendarOverviewHolidaysCard({
  subtitle,
  items,
  emptyLabel,
  onViewAll,
}: OfficeCalendarOverviewHolidaysCardProps) {
  const headerIcon = OFFICE_CALENDAR_OVERVIEW_TONE_STYLES.warning

  return (
    <section className={OVERVIEW_CARD} aria-labelledby="overview-next-holidays">
      <header className="flex items-start gap-3 border-b border-hrms-border px-4 py-3.5">
        <span
          className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', headerIcon.iconTile)}
        >
          <ListOrdered className={cn('h-5 w-5', headerIcon.icon)} aria-hidden />
        </span>
        <div>
          <h2 id="overview-next-holidays" className="text-base font-semibold text-hrms-navy">
            Next holidays
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
              <OfficeCalendarOverviewHolidayRow key={item.id} item={item} />
            ))}
          </ul>
        )}
        {onViewAll ? (
          <button type="button" className={`${OVERVIEW_LAVENDER_BUTTON} ${OVERVIEW_MOTION}`} onClick={onViewAll}>
            View all holidays
          </button>
        ) : null}
      </div>
    </section>
  )
}