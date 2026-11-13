/**
 * Compact filter row above payroll data tables (search, status, counts).
 * Used on Overview employee table and variable pay / settlement cards.
 */

import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { PAYROLL_FILTER_INPUT, PAYROLL_FILTER_SELECT } from './payrollUi'

type SelectOption = { value: string; label: string }

type PayrollTableFiltersProps = {
  searchId: string
  searchLabel: string
  searchPlaceholder: string
  searchValue: string
  onSearchChange: (value: string) => void
  statusId?: string
  statusLabel?: string
  statusValue?: string
  statusOptions?: SelectOption[]
  onStatusChange?: (value: string) => void
  extraSelectId?: string
  extraSelectLabel?: string
  extraSelectValue?: string
  extraSelectOptions?: SelectOption[]
  onExtraSelectChange?: (value: string) => void
  showing: number
  total: number
  className?: string
}

export function PayrollTableFilters({
  searchId,
  searchLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  statusId,
  statusLabel = 'Status',
  statusValue,
  statusOptions,
  onStatusChange,
  extraSelectId,
  extraSelectLabel,
  extraSelectValue,
  extraSelectOptions,
  onExtraSelectChange,
  showing,
  total,
  className,
}: PayrollTableFiltersProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <label htmlFor={searchId} className="sr-only">
        {searchLabel}
      </label>
      <div className="relative w-full max-w-[20rem]">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hrms-text-muted"
          aria-hidden
        />
        <Input
          id={searchId}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className={PAYROLL_FILTER_INPUT}
        />
      </div>
      {statusId && statusOptions && onStatusChange ? (
        <>
          <label htmlFor={statusId} className="sr-only">
            {statusLabel}
          </label>
          <select
            id={statusId}
            className={PAYROLL_FILTER_SELECT}
            value={statusValue}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </>
      ) : null}
      {extraSelectId && extraSelectOptions && onExtraSelectChange ? (
        <>
          <label htmlFor={extraSelectId} className="sr-only">
            {extraSelectLabel ?? 'Filter'}
          </label>
          <select
            id={extraSelectId}
            className={PAYROLL_FILTER_SELECT}
            value={extraSelectValue}
            onChange={(event) => onExtraSelectChange(event.target.value)}
          >
            {extraSelectOptions.map((option) => (
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
