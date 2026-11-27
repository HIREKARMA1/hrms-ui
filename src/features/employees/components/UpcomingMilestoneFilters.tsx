import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DAY_OPTIONS = [
  { value: 7, label: 'Next 7 days' },
  { value: 30, label: 'Next 30 days' },
  { value: 90, label: 'Next 90 days' },
] as const

type DepartmentOption = { id: string; name: string }

type Props = {
  days: number
  onDaysChange: (days: number) => void
  departmentId: string
  onDepartmentChange: (value: string) => void
  departments: DepartmentOption[]
  departmentsLoading: boolean
  search: string
  onSearchChange: (value: string) => void
  searchAriaLabel?: string
}

export function UpcomingMilestoneFilters({
  days,
  onDaysChange,
  departmentId,
  onDepartmentChange,
  departments,
  departmentsLoading,
  search,
  onSearchChange,
  searchAriaLabel = 'Search employees',
}: Props) {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <Input
        type="search"
        placeholder="Search name or code"
        className="h-9 w-full sm:w-[180px]"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        aria-label={searchAriaLabel}
      />
      <Select value={String(days)} onValueChange={(v) => onDaysChange(Number(v))}>
        <SelectTrigger className="h-9 w-full sm:w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DAY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={departmentId} onValueChange={onDepartmentChange}>
        <SelectTrigger className="h-9 w-full sm:w-[170px]">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All departments</SelectItem>
          {departmentsLoading ? (
            <SelectItem value="_loading" disabled>
              Loading…
            </SelectItem>
          ) : (
            departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}