import type { AttendanceReportResult } from '../types/api/attendanceReport.types'

export type OvertimeEmployeeMeta = {
  employeeName: string
  employeeCode: string
  department: string
}

export type OvertimeDayRow = {
  id: string
  employeeName: string
  employeeCode: string
  department: string
  date: string
  workingMinutes?: number
  overtimeMinutes: number
}

export function flattenOvertimeFromAttendanceReport(
  report: AttendanceReportResult,
  meta: OvertimeEmployeeMeta,
): OvertimeDayRow[] {
  const code = meta.employeeCode.trim()
  return (report.days ?? [])
    .filter((day) => (day.overtimeMinutes ?? 0) > 0)
    .map((day, index) => ({
      id: `${code}-${day.date}-${index}`,
      employeeName: meta.employeeName,
      employeeCode: code,
      department: meta.department,
      date: day.date,
      workingMinutes: day.workingMinutes,
      overtimeMinutes: day.overtimeMinutes ?? 0,
    }))
}