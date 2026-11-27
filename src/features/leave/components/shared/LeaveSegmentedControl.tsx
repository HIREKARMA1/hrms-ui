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
  appearance?: 'default' | 'overview'
}

export function LeaveSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  appearance = 'default',
}: LeaveSegmentedControlProps<T>) {
  const overview = appearance === 'overview'
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex w-full max-w-full flex-wrap gap-1 sm:w-auto',
        overview ? 'rounded-[10px] bg-[#EEF0F6] p-[3px]' : 'rounded-xl bg-hrms-muted-bg p-1',
      )}
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
              'shrink-0 font-medium',
              overview ? 'rounded-lg px-3 py-1.5 text-[13px]' : 'rounded-lg px-3 py-2 text-sm',
              overview ? '' : LEAVE_MOTION,
              active
                ? overview
                  ? 'bg-white font-semibold text-[#5938DB] shadow-sm'
                  : 'bg-white text-hrms-primary shadow-sm'
                : overview
                  ? 'text-[#667085] hover:text-[#17213A]'
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
