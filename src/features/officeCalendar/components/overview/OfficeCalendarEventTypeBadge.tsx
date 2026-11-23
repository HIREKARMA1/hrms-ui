import { cn } from '@/lib/utils'

import type { OfficeEventType } from '../../types/officeCalendar'

const TYPE_BADGE: Record<OfficeEventType, string> = {
  meeting: 'bg-slate-100 text-slate-700',
  event: 'bg-sky-50 text-sky-800',
  training: 'bg-emerald-50 text-emerald-800',
  holiday: 'bg-amber-50 text-amber-800',
}

export function OfficeCalendarEventTypeBadge({ type }: { type: OfficeEventType }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
        TYPE_BADGE[type],
      )}
    >
      {type}
    </span>
  )
}