import type { AttendanceReportSource } from './attendanceApiAccess'

/** Processed report `source` query (`AttendanceReportController`; Swagger default `auto`). */
export const DEFAULT_ATTENDANCE_REPORT_SOURCE: AttendanceReportSource = 'auto'

export const ATTENDANCE_REPORT_SOURCE_OPTIONS: {
  value: AttendanceReportSource
  label: string
}[] = [
  { value: 'auto', label: 'Auto (live, else stored)' },
  { value: 'stored', label: 'Stored punches only' },
  { value: 'live', label: 'Live TimeWatch only' },
]