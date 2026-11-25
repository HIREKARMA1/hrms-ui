/**
 * From / to / source filters and refresh for live attendance report cards.
 */
import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ATTENDANCE_REPORT_SOURCE_OPTIONS } from '../../constants/attendanceReportSourceOptions'
import type { AttendanceReportSource } from '../../constants/attendanceApiAccess'
import type { AttendanceReportRangeState } from '../../hooks/useAttendanceReportRangeState'

type AttendanceReportRangeControlsProps = {
  idPrefix: string
  range: AttendanceReportRangeState
  onRangeChange: (next: AttendanceReportRangeState) => void
  source: AttendanceReportSource
  onSourceChange: (source: AttendanceReportSource) => void
  onRefresh: () => void
  refreshDisabled?: boolean
  isFetching?: boolean
}

export function AttendanceReportRangeControls({
  idPrefix,
  range,
  onRangeChange,
  source,
  onSourceChange,
  onRefresh,
  refreshDisabled = false,
  isFetching = false,
}: AttendanceReportRangeControlsProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-from`}>From</Label>
        <Input
          id={`${idPrefix}-from`}
          type="date"
          value={range.fromDate}
          onChange={(event) => onRangeChange({ ...range, fromDate: event.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-to`}>To</Label>
        <Input
          id={`${idPrefix}-to`}
          type="date"
          value={range.toDate}
          onChange={(event) => onRangeChange({ ...range, toDate: event.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label>Source</Label>
        <Select value={source} onValueChange={(value) => onSourceChange(value as AttendanceReportSource)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
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
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1"
        disabled={refreshDisabled}
        onClick={onRefresh}
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  )
}