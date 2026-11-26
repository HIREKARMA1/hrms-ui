import type { AttendanceReportResult } from '../types/api/attendanceReport.types'
import { formatRegularizationTypeLabel } from './regularizationDisplay'

export type AttendanceRegularizationTypeOption = {
  value: string
  label: string
}

export function collectIssueCodesFromAttendanceReport(
  report: AttendanceReportResult | undefined,
  attendanceDate: string,
): string[] {
  if (!report) return []
  const codes = new Set<string>()
  const days = report.days ?? []
  for (const day of days) {
    if (attendanceDate && day.date && day.date !== attendanceDate) continue
    for (const code of [...(day.issues ?? []), ...(day.flags ?? [])]) {
      const trimmed = code.trim()
      if (trimmed) codes.add(trimmed)
    }
  }
  return [...codes].sort((a, b) => a.localeCompare(b))
}

export type AttendanceRegularizationTypeOptionsResult = {
  /** Issue codes from the attendance report for the selected date (matches Reports table Issues column). */
  submittable: AttendanceRegularizationTypeOption[]
}

export function buildAttendanceRegularizationTypeOptions(input: {
  report?: AttendanceReportResult
  attendanceDate: string
  /** False until employee (when required) and date are set and the report request has finished */
  reportLoaded: boolean
}): AttendanceRegularizationTypeOptionsResult {
  if (!input.reportLoaded) {
    return { submittable: [] }
  }

  const reportCodes = collectIssueCodesFromAttendanceReport(input.report, input.attendanceDate)

  const submittable = reportCodes.map((value) => ({
    value,
    label: formatRegularizationTypeLabel(value),
  }))

  return { submittable }
}
