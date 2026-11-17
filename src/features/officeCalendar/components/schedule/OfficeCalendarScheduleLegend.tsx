/**
 * Category filter chips with month counts on the schedule calendar card.
 */

import { cn } from '@/lib/utils'

import type { OfficeCalendarScheduleCategory } from '../../constants/officeCalendarScheduleCategoryColors'
import {
  OFFICE_CALENDAR_SCHEDULE_CATEGORY_STYLES,
  OFFICE_CALENDAR_SCHEDULE_CATEGORIES,
} from '../../constants/officeCalendarScheduleCategoryColors'
import { SCHEDULE_MOTION } from './officeCalendarScheduleUi'

const LABELS: Record<OfficeCalendarScheduleCategory, string> = {
  holiday: 'Holiday',
  event: 'Event',
  meeting: 'Meeting',
  training: 'Training',
}

type OfficeCalendarScheduleLegendProps = {
  counts: Record<OfficeCalendarScheduleCategory, number>
  hidden: Set<OfficeCalendarScheduleCategory>
  onToggle: (category: OfficeCalendarScheduleCategory) => void
}

export function OfficeCalendarScheduleLegend({ counts, hidden, onToggle }: OfficeCalendarScheduleLegendProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 px-[22px] py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {OFFICE_CALENDAR_SCHEDULE_CATEGORIES.map((category) => {
          const active = !hidden.has(category)
          const styles = OFFICE_CALENDAR_SCHEDULE_CATEGORY_STYLES[category]
          return (
            <button
              key={category}
              type="button"
              aria-pressed={active}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold',
                SCHEDULE_MOTION,
                active ? styles.chipActive : 'border-gray-200 bg-white text-gray-500',
              )}
              onClick={() => onToggle(category)}
            >
              <span
                className={cn('h-2 w-2 rounded-full', active ? styles.chipDot : 'bg-gray-300')}
                aria-hidden
              />
              {LABELS[category]} {counts[category]}
            </button>
          )
        })}
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-600">
          <span className="h-2 w-2 rounded-full bg-hrms-primary" aria-hidden />
          Today
        </span>
      </div>
      <p className="text-xs text-gray-500">Click a type to show or hide it</p>
    </div>
  )
}