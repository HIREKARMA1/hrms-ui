import type { AttendanceReportRangeQuery } from '../types/api/attendanceReport.types'

export function buildAttendanceReportParams(query: AttendanceReportRangeQuery): Record<string, string> {
  const params: Record<string, string> = {}
  if (query.date) params.date = query.date
  if (query.fromDate) params.fromDate = query.fromDate
  if (query.toDate) params.toDate = query.toDate
  if (query.source) params.source = query.source
  return params
}

export function buildAttendanceReportSourceParams(source?: string): Record<string, string> {
  return source ? { source } : {}
}