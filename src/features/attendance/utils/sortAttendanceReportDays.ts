/**
 * Sort attendance report day rows newest-first for table display.
 */
import type { AttendanceDayRecord } from '../types/api/attendanceReport.types'

export function sortAttendanceReportDays(days: AttendanceDayRecord[] | undefined) {
  return [...(days ?? [])].sort((a, b) => b.date.localeCompare(a.date))
}