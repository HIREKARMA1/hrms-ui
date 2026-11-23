/**
 * Muted segmented control for approval sub-tabs (leave | encashment | comp-off).
 * Replaces filled button variants on ApprovalsTab.
 */

import { cn } from '@/lib/utils'

import { LEAVE_MOTION } from './leaveUi'

export type LeaveSegmentOption<T extends string> = { value: T; label: string }

type LeaveSegmentedControlProps<T extends string> = {
  options: LeaveSegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
}

export function LeaveSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: LeaveSegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex w-full max-w-full flex-wrap gap-1 rounded-xl bg-hrms-muted-bg p-1 sm:w-auto"
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-2 text-sm font-medium',
              LEAVE_MOTION,
              active
                ? 'bg-white text-hrms-primary shadow-sm'
                : 'text-hrms-text-secondary hover:text-hrms-navy',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
