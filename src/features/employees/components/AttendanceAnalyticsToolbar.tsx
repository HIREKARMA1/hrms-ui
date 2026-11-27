/**
 * Period (standalone) and department filters for attendance analytics.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { DateRangePreset } from '../types/employeeDashboard.types'

const periodOptions: { value: Exclude<DateRangePreset, 'custom'>; label: string }[] = [
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
]

type DepartmentOption = { id: string; name: string }

type Props = {
  showPeriodPresets: boolean
  period: Exclude<DateRangePreset, 'custom'>
  onPeriodChange: (value: Exclude<DateRangePreset, 'custom'>) => void
  departmentId: string
  onDepartmentChange: (value: string) => void
  departments: DepartmentOption[]
  departmentsLoading: boolean
}

export function AttendanceAnalyticsToolbar({
  showPeriodPresets,
  period,
  onPeriodChange,
  departmentId,
  onDepartmentChange,
  departments,
  departmentsLoading,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <Select value={departmentId} onValueChange={onDepartmentChange}>
        <SelectTrigger className="w-full sm:w-[190px]">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All departments</SelectItem>
          {departmentsLoading ? (
            <SelectItem value="_loading" disabled>
              Loading departments…
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

      {showPeriodPresets ? (
        <Select value={period} onValueChange={(value) => onPeriodChange(value as Props['period'])}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            <SelectItem value="custom" disabled>
              Custom range
            </SelectItem>
          </SelectContent>
        </Select>
      ) : null}
    </div>
  )
}