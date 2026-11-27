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
}

export function EmploymentStatusDistributionFilters({
  departmentId,
  onDepartmentChange,
  departments,
  departmentsLoading,
}: Props) {
  return (
    <Select value={departmentId} onValueChange={onDepartmentChange}>
      <SelectTrigger className="h-9 w-full sm:w-[200px]">
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
  )
}