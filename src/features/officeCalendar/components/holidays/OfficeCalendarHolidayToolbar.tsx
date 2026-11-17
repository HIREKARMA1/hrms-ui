import { Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { OfficeHolidayType } from '../../types/officeCalendar'
import type { OfficeHolidayFilterState } from '../../utils/filterOfficeHolidays'
import { OFFICE_HOLIDAY_TYPES } from '../../utils/officeHolidayForm'
import { CALENDAR_FILTER_BAR } from '../shared/officeCalendarUi'

type OfficeCalendarHolidayToolbarProps = {
  filters: OfficeHolidayFilterState
  onFiltersChange: (next: OfficeHolidayFilterState) => void
  onAdd: () => void
  canManage: boolean
}

const selectClass =
  'h-10 min-w-[9rem] rounded-xl border border-hrms-border bg-white px-3 text-sm text-hrms-navy'

export function OfficeCalendarHolidayToolbar({
  filters,
  onFiltersChange,
  onAdd,
  canManage,
}: OfficeCalendarHolidayToolbarProps) {
  return (
    <div className={`${CALENDAR_FILTER_BAR} flex flex-wrap items-center gap-2`}>
      <HolidaySearchField filters={filters} onFiltersChange={onFiltersChange} />
      <label className="sr-only" htmlFor="holiday-type-filter">
        Holiday type
      </label>
      <select
        id="holiday-type-filter"
        className={selectClass}
        value={filters.type}
        onChange={(event) =>
          onFiltersChange({
            ...filters,
            type: event.target.value as OfficeHolidayType | 'all',
          })
        }
      >
        <option value="all">All types</option>
        {OFFICE_HOLIDAY_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      {canManage ? (
        <Button type="button" size="sm" className="ml-auto gap-1 bg-hrms-primary text-white" onClick={onAdd}>
          <Plus className="h-4 w-4" aria-hidden />
          Add holiday
        </Button>
      ) : null}
    </div>
  )
}

function HolidaySearchField({
  filters,
  onFiltersChange,
}: {
  filters: OfficeHolidayFilterState
  onFiltersChange: (next: OfficeHolidayFilterState) => void
}) {
  return (
    <div className="relative min-w-[12rem] flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hrms-text-muted" aria-hidden />
      <input
        type="search"
        placeholder="Search holidays…"
        className="h-10 w-full rounded-xl border border-hrms-border bg-white pl-9 pr-3 text-sm text-hrms-navy"
        value={filters.query}
        onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
      />
    </div>
  )
}