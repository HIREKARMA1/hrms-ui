/**
 * Summary chips for a loaded attendance report payload.
 */
import { Badge } from '@/components/ui/badge'

import type { AttendanceReportResult } from '../../types/api/attendanceReport.types'

type AttendanceReportMetaBadgesProps = {
  dayCount: number
  data: AttendanceReportResult
  showEmployeeId?: boolean
}

export function AttendanceReportMetaBadges({
  dayCount,
  data,
  showEmployeeId = false,
}: AttendanceReportMetaBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <Badge variant="secondary">{dayCount} day(s)</Badge>
      {data.employeeCode ? <Badge variant="secondary">Code: {data.employeeCode}</Badge> : null}
      {showEmployeeId && data.employeeId ? (
        <Badge variant="secondary" className="font-mono">
          ID: {data.employeeId}
        </Badge>
      ) : null}
      {data.source ? <Badge variant="secondary">Source: {data.source}</Badge> : null}
    </div>
  )
}