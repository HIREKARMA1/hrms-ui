import type { LucideIcon } from 'lucide-react'

import { CALENDAR_SECTION_ICON_WRAP } from '../shared/officeCalendarUi'

export function OfficeCalendarSectionIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className={CALENDAR_SECTION_ICON_WRAP} aria-hidden>
      <Icon className="h-4 w-4" strokeWidth={2} />
    </span>
  )
}