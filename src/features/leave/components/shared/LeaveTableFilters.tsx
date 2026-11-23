/**
 * Compact filter row above leave tables (search, selects, showing count).
 * Shared by My Leave, Approvals, and Balances tabs.
 */

import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { LEAVE_FILTER_INPUT, LEAVE_FILTER_SELECT } from './leaveUi'

type SelectOption = { value: string; label: string }

type LeaveTableFiltersProps = {
  searchId: string
  searchPlaceholder: string
  searchValue: string
  onSearchChange: (value: string) => void
  selectId?: string
  selectLabel?: string
  selectValue?: string
  selectOptions?: SelectOption[]
  onSelectChange?: (value: string) => void
  showing: number
  total: number
  className?: string
}

export function LeaveTableFilters({
  searchId,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  selectId,
  selectLabel = 'Filter',
  selectValue,
  selectOptions,
  onSelectChange,
  showing,
  total,
  className,
}: LeaveTableFiltersProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <label htmlFor={searchId} className="sr-only">
        Search
      </label>
      <div className="relative w-full max-w-[20rem]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hrms-text-muted" aria-hidden />
        <Input
          id={searchId}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className={LEAVE_FILTER_INPUT}
        />
      </div>
      {selectId && selectOptions && onSelectChange ? (
        <>
          <label htmlFor={selectId} className="sr-only">
            {selectLabel}
          </label>
          <select
            id={selectId}
            className={LEAVE_FILTER_SELECT}
            value={selectValue}
            onChange={(event) => onSelectChange(event.target.value)}
          >
            {selectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </>
      ) : null}
      <p className="ml-auto text-xs text-hrms-text-secondary tabular-nums">
        Showing {showing} of {total}
      </p>
    </div>
  )
}
