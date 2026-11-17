import { X } from 'lucide-react'

import { useDismissibleMockBanner } from '../hooks/useDismissibleMockBanner'
import { CALENDAR_INFO_BANNER, CALENDAR_MOTION } from './shared/officeCalendarUi'

export function OfficeCalendarMockBanner() {
  const { dismissed, dismiss } = useDismissibleMockBanner()
  if (dismissed) return null

  return (
    <div className={`${CALENDAR_INFO_BANNER} flex items-start justify-between gap-3`}>
      <p className="text-sm text-hrms-navy">
        Mock calendar data. Office holidays here are separate from Attendance until sync is defined.
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