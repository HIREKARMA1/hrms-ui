import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { ByDepartmentQueryArgs } from '../api/employeeDashboardApi.types'

const STATUS_OPTIONS: Array<{
  value: 'all' | ByDepartmentQueryArgs['employmentStatus']
  label: string
}> = [
  { value: 'all', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_LEAVE', label: 'On leave' },
  { value: 'PROBATION', label: 'On probation' },
  { value: 'TERMINATED', label: 'Terminated' },
]

type Props = {
  search: string
  onSearchChange: (value: string) => void
  employmentStatus: 'all' | ByDepartmentQueryArgs['employmentStatus']
  onEmploymentStatusChange: (value: 'all' | ByDepartmentQueryArgs['employmentStatus']) => void
}

export function DepartmentDistributionFilters({
  search,
  onSearchChange,
  employmentStatus,
  onEmploymentStatusChange,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <Input
        type="search"
        placeholder="Filter by dept name or code"
        className="h-9 w-full sm:flex-1 sm:min-w-[160px]"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        aria-label="Search departments"
      />
      <Select
        value={employmentStatus ?? 'all'}
        onValueChange={(value) =>
          onEmploymentStatusChange(
            value === 'all' ? 'all' : (value as ByDepartmentQueryArgs['employmentStatus']),
          )
        }
      >
        <SelectTrigger className="h-9 w-full sm:w-[170px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value ?? 'all'} value={option.value ?? 'all'}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}