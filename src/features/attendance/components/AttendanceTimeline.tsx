import { Coffee, LogIn, LogOut } from 'lucide-react'

import { cn } from '@/lib/utils'

export type TimelineEvent = {
  id: string
  label: string
  time: string
  type: 'check-in' | 'break-start' | 'break-end' | 'check-out'
}

const iconMap = {
  'check-in': LogIn,
  'break-start': Coffee,
  'break-end': Coffee,
  'check-out': LogOut,
} as const

export function AttendanceTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="space-y-4">
      {events.map((event, index) => {
        const Icon = iconMap[event.type]
        return (
          <li key={event.id} className="relative flex gap-3">
            {index < events.length - 1 ? (
              <span className="absolute top-10 left-5 h-[calc(100%-1.25rem)] w-px bg-border-soft" />
            ) : null}
            <div
              className={cn(
                'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                event.type === 'check-in' && 'bg-emerald-50 text-[#16A34A]',
                event.type === 'check-out' && 'bg-rose-50 text-[#EF4444]',
                (event.type === 'break-start' || event.type === 'break-end') &&
                  'bg-amber-50 text-[#F59E0B]',
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="rounded-xl border border-border-soft bg-muted-bg/60 px-3 py-2">
              <p className="text-sm font-semibold text-navy">{event.label}</p>
              <p className="text-xs text-text-secondary">{event.time}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
