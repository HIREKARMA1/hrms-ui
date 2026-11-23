/**
 * Meta badges + day table when an attendance report query succeeded.
 */
import type { AttendanceDayRecord, AttendanceReportResult } from '../../types/api/attendanceReport.types'

import { AttendanceReportDaysTable } from './AttendanceReportDaysTable'
import { AttendanceReportMetaBadges } from './AttendanceReportMetaBadges'

type AttendanceReportResultSectionProps = {
  data: AttendanceReportResult
  days: AttendanceDayRecord[]
  showEmployeeId?: boolean
}

export function AttendanceReportResultSection({
  data,
  days,
  showEmployeeId = false,
}: AttendanceReportResultSectionProps) {
  return (
    <div className="space-y-3">
      <AttendanceReportMetaBadges dayCount={days.length} data={data} showEmployeeId={showEmployeeId} />
      <AttendanceReportDaysTable days={days} />
    </div>
  )
}