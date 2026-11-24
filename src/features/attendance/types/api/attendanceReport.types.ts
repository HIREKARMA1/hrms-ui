import type { AttendanceReportSource } from '../../constants/attendanceApiAccess'

export type AttendanceReportRangeQuery = {
  date?: string
  fromDate?: string
  toDate?: string
  source?: AttendanceReportSource
}

export type AttendanceMyReportQuery = AttendanceReportRangeQuery

export type AttendanceMyReportForDateQuery = {
  date: string
  source?: AttendanceReportSource
}

export type AttendanceReportByEmployeeIdQuery = AttendanceReportRangeQuery & {
  employeeId: string
}

export type AttendanceReportByEmployeeIdForDateQuery = {
  employeeId: string
  date: string
  source?: AttendanceReportSource
}

export type AttendanceReportByEmployeeCodeQuery = AttendanceReportRangeQuery & {
  employeeCode: string
}

export type AttendanceReportByEmployeeCodeForDateQuery = {
  employeeCode: string
  date: string
  source?: AttendanceReportSource
}

export type AttendanceDayRecord = {
  date: string
  status?: string
  displayState?: string
  checkIn?: string | null
  checkOut?: string | null
  lateMinutes?: number
  lunchMinutes?: number
  teaMinutes?: number
  overtimeMinutes?: number
  workingMinutes?: number
  source?: string
}

export type AttendanceReportResult = {
  employeeId?: string
  employeeCode?: string
  fromDate?: string
  toDate?: string
  date?: string
  source?: AttendanceReportSource | string
  days: AttendanceDayRecord[]
}