import { X } from 'lucide-react'

import type {
  OfficeCalendarEventListSource,
  OfficeHolidayListSource,
} from '../context/officeCalendarContext'
import { useDismissibleMockBanner } from '../hooks/useDismissibleMockBanner'
import { CALENDAR_INFO_BANNER, CALENDAR_MOTION } from './shared/officeCalendarUi'

type OfficeCalendarMockBannerProps = {
  eventsSource?: OfficeCalendarEventListSource
  holidaysSource?: OfficeHolidayListSource
}

export function OfficeCalendarMockBanner({
  eventsSource = 'demo',
  holidaysSource = 'demo',
}: OfficeCalendarMockBannerProps) {
  const { dismissed, dismiss } = useDismissibleMockBanner()
  if (dismissed) return null
  if (eventsSource === 'api' && holidaysSource === 'api') return null

  return (
    <div className={`${CALENDAR_INFO_BANNER} flex items-start justify-between gap-3`}>
      <p className="text-sm text-hrms-navy">
        {eventsSource === 'demo' && holidaysSource === 'demo'
          ? 'Mock calendar data. Events and holidays use the local demo store.'
          : eventsSource === 'demo'
            ? 'Events use the local demo until you have calendar:read.'
            : 'Some holiday data still uses the local demo until you have holidays:read.'}{' '}
        Office holidays on this module are separate from Attendance until sync is defined.
      </p>
      <button
        type="button"
        onClick={dismiss}
        className={`shrink-0 rounded-md p-1 text-hrms-text-muted hover:text-hrms-navy ${CALENDAR_MOTION}`}
        aria-label="Dismiss notice"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}