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
  monthValue: string
  onMonthChange: (value: string) => void
  departmentId: string
  onDepartmentChange: (value: string) => void
  departments: DepartmentOption[]
  departmentsLoading: boolean
  search: string
  onSearchChange: (value: string) => void
}

export function NewJoinersFilters({
  monthValue,
  onMonthChange,
  departmentId,
  onDepartmentChange,
  departments,
  departmentsLoading,
  search,
  onSearchChange,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <Input
        type="month"
        className="h-9 w-full sm:w-[160px]"
        value={monthValue}
        onChange={(event) => onMonthChange(event.target.value)}
        aria-label="Joining month"
      />
      <Input
        type="search"
        placeholder="Search name or code"
        className="h-9 w-full sm:w-[180px]"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        aria-label="Search new joiners"
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