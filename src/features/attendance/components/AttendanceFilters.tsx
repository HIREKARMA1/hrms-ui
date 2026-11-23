import { Download, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  attendanceStatuses,
  departments,
  shifts,
} from '../mocks/attendanceMocks'

export type AttendanceFilterState = {
  search: string
  department: string
  date: string
  status: string
  shift: string
}

type AttendanceFiltersProps = {
  value: AttendanceFilterState
  onChange: (next: AttendanceFilterState) => void
  onExport?: () => void
}

export function AttendanceFilters({
  value,
  onChange,
  onExport,
}: AttendanceFiltersProps) {
  const update = (patch: Partial<AttendanceFilterState>) => {
    onChange({ ...value, ...patch })
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-white p-4 shadow-sm lg:flex-row lg:items-end lg:flex-wrap">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <Input
          value={value.search}
          onChange={(event) => update({ search: event.target.value })}
          placeholder="Search by employee name or ID"
          className="h-10 pl-9"
        />
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-wrap">
        <Select
          value={value.department}
          onValueChange={(department) => update({ department })}
        >
          <SelectTrigger className="w-full lg:w-[170px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((department) => (
              <SelectItem key={department} value={department}>
                {department === 'All' ? 'All Departments' : department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={value.date}
          onChange={(event) => update({ date: event.target.value })}
          className="h-10 w-full lg:w-[160px]"
        />

        <Select value={value.status} onValueChange={(status) => update({ status })}>
          <SelectTrigger className="w-full lg:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {attendanceStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status === 'All' ? 'All Statuses' : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={value.shift} onValueChange={(shift) => update({ shift })}>
          <SelectTrigger className="w-full lg:w-[140px]">
            <SelectValue placeholder="Shift" />
          </SelectTrigger>
          <SelectContent>
            {shifts.map((shift) => (
              <SelectItem key={shift} value={shift}>
                {shift === 'All' ? 'All Shifts' : shift}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {onExport ? (
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-2"
          onClick={onExport}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      ) : null}
    </div>
  )
}
