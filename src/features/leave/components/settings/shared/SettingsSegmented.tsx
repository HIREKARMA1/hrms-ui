/**
 * Muted segmented control for settings two- or three-option fields.
 */

import { cn } from '@/lib/utils'

import { LEAVE_MOTION } from '../../shared/leaveUi'

type Option = { value: string; label: string }

type SettingsSegmentedProps = {
  options: Option[]
  value: string
  onChange: (value: string) => void
  ariaLabel: string
}

export function SettingsSegmented({ options, value, onChange, ariaLabel }: SettingsSegmentedProps) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="inline-flex flex-wrap gap-1 rounded-xl bg-hrms-muted-bg p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium',
            LEAVE_MOTION,
            option.value === value ? 'bg-white text-hrms-primary shadow-sm' : 'text-hrms-text-secondary hover:text-hrms-navy',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
