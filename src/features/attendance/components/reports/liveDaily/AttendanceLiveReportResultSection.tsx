import type { AttendanceDayRecord, AttendanceReportResult } from '../../../types/api/attendanceReport.types'
import { AttendanceLiveDaysTable } from './AttendanceLiveDaysTable'

type AttendanceLiveReportResultSectionProps = {
  data: AttendanceReportResult
  days: AttendanceDayRecord[]
}

export function AttendanceLiveReportResultSection({
  days,
}: AttendanceLiveReportResultSectionProps) {
  return <AttendanceLiveDaysTable days={days} />
}