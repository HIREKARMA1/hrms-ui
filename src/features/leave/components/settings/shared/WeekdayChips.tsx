/**
 * Weekday checkbox chips for weekly off configuration.
 */

import { cn } from '@/lib/utils'

import { LEAVE_MOTION } from '../../shared/leaveUi'

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
]

type WeekdayChipsProps = {
  value: number[]
  onChange: (next: number[]) => void
}

export function WeekdayChips({ value, onChange }: WeekdayChipsProps) {
  function toggle(day: number) {
    const on = new Set(value)
    if (on.has(day)) on.delete(day)
    else on.add(day)
    onChange([...on].sort((a, b) => a - b))
  }
  return (
    <div className="flex flex-wrap gap-2">
      {DAYS.map((day) => {
        const active = value.includes(day.value)
        return (
          <button
            key={day.value}
            type="button"
            onClick={() => toggle(day.value)}
            className={cn(
              'h-10 min-w-[2.75rem] rounded-xl border px-3 text-sm font-medium',
              LEAVE_MOTION,
              active ? 'border-hrms-primary bg-hrms-lavender text-hrms-primary' : 'border-hrms-border bg-white text-hrms-text-secondary',
            )}
          >
            {day.label}
          </button>
        )
      })}
    </div>
  )
}
