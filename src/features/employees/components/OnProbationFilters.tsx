import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type DepartmentOption = { id: string; name: string }

type Props = {
  departmentId: string
  onDepartmentChange: (value: string) => void
  departments: DepartmentOption[]
  departmentsLoading: boolean
  search: string
  onSearchChange: (value: string) => void
  searchAriaLabel?: string
}

export function OnProbationFilters({
  departmentId,
  onDepartmentChange,
  departments,
  departmentsLoading,
  search,
  onSearchChange,
  searchAriaLabel = 'Search employees on probation',
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