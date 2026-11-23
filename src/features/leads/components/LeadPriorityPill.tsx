import { cn } from '@/lib/utils'

import type { LeadPriority } from '../types/lead'

const tone: Record<LeadPriority, string> = {
  High: 'bg-red-50 text-red-700',
  Medium: 'bg-amber-50 text-amber-800',
  Low: 'bg-slate-100 text-slate-700',
}

export function LeadPriorityPill({ priority }: { priority: LeadPriority }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tone[priority],
      )}
    >
      {priority}
    </span>
  )
}