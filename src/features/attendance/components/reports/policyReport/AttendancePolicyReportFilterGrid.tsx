/**
 * Filter grid for Attendance Reports (policy) — presentational layout only.
 */
import { Calendar, ChevronDown, RefreshCw, Search } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import { ATTENDANCE_REPORT_SOURCE_OPTIONS } from '../../../constants/attendanceReportSourceOptions'
import type { AttendanceReportSource } from '../../../constants/attendanceApiAccess'
import type { AttendanceReportRangeState } from '../../../hooks/useAttendanceReportRangeState'
import type { HrLookupMode } from '../../../hooks/useHrAttendanceReportActive'
import {
  policyControlClass,
  policyFilterGridClass,
  policyLabelClass,
  policyPrimaryButtonClass,
  policySecondaryButtonClass,
} from './attendancePolicyReportUi'

type AttendancePolicyReportFilterGridProps = {
  mode: HrLookupMode
  onModeChange: (mode: HrLookupMode) => void
  employeeCode: string
  onEmployeeCodeChange: (value: string) => void
  employeeId: string
  onEmployeeIdChange: (value: string) => void
  onSubmit: () => void
  employeePicker?: ReactNode
  idPrefix: string
  range: AttendanceReportRangeState
  onRangeChange: (next: AttendanceReportRangeState) => void
  source: AttendanceReportSource
  onSourceChange: (source: AttendanceReportSource) => void
  onRefresh: () => void
  refreshDisabled?: boolean
  isFetching?: boolean
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className={policyLabelClass}>
      {children}
    </label>
  )
}

function DateField({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type="date"
        value={value}
        className={cn(policyControlClass, 'pr-10')}
        onChange={(event) => onChange(event.target.value)}
      />
      <Calendar
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
        aria-hidden
      />
    </div>
  )
}

export function AttendancePolicyReportFilterGrid({
  mode,
  onModeChange,
  employeeCode,
  onEmployeeCodeChange,
  employeeId,
  onEmployeeIdChange,
  onSubmit,
  employeePicker,
  idPrefix,
  range,
  onRangeChange,
  source,
  onSourceChange,
  onRefresh,
  refreshDisabled = false,
  isFetching = false,
}: AttendancePolicyReportFilterGridProps) {
  return (
    <div className={policyFilterGridClass}>
      <div>
        <FieldLabel>Lookup by</FieldLabel>
        <Select value={mode} onValueChange={(value) => onModeChange(value as HrLookupMode)}>
          <SelectTrigger className={cn(policyControlClass, '[&>svg]:hidden')}>
            <SelectValue />
            <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-[#98A2B3]" aria-hidden />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="code">Employee code</SelectItem>
            <SelectItem value="id">Employee ID (UUID)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mode === 'code' ? (
        <>
          <div>
            <FieldLabel htmlFor="hr-att-emp-code">Employee code</FieldLabel>
            <Input
              id="hr-att-emp-code"
              value={employeeCode}
              placeholder="e.g. HK0030"
              className={policyControlClass}
              onChange={(event) => onEmployeeCodeChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onSubmit()
              }}
            />
          </div>
          <div className="min-[1100px]:[&_label]:mb-1.5">{employeePicker}</div>
        </>
      ) : (
        <div className="min-[1100px]:col-span-2">
          <FieldLabel htmlFor="hr-att-emp-id">Employee ID</FieldLabel>
          <Input
            id="hr-att-emp-id"
            value={employeeId}
            placeholder="Server employee UUID"
            className={policyControlClass}
            onChange={(event) => onEmployeeIdChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSubmit()
            }}
          />
        </div>
      )}

      <div>
        <Button type="button" className={policyPrimaryButtonClass} onClick={onSubmit}>
          <Search className="h-4 w-4" aria-hidden />
          Load report
        </Button>
      </div>

      <div>
        <FieldLabel htmlFor={`${idPrefix}-from`}>From</FieldLabel>
        <DateField
          id={`${idPrefix}-from`}
          value={range.fromDate}
          onChange={(fromDate) => onRangeChange({ ...range, fromDate })}
        />
      </div>
      <div>
        <FieldLabel htmlFor={`${idPrefix}-to`}>To</FieldLabel>
        <DateField
          id={`${idPrefix}-to`}
          value={range.toDate}
          onChange={(toDate) => onRangeChange({ ...range, toDate })}
        />
      </div>
      <div>
        <FieldLabel>Source</FieldLabel>
        <Select value={source} onValueChange={(value) => onSourceChange(value as AttendanceReportSource)}>
          <SelectTrigger className={cn(policyControlClass, '[&>svg]:hidden')}>
            <SelectValue />
            <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-[#98A2B3]" aria-hidden />
          </SelectTrigger>
          <SelectContent>
            {ATTENDANCE_REPORT_SOURCE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Button
          type="button"
          className={policySecondaryButtonClass}
          disabled={refreshDisabled}
          onClick={onRefresh}
        >
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} aria-hidden />
          Refresh
        </Button>
      </div>
    </div>
  )
}