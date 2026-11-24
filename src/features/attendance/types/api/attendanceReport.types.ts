import type { AttendanceReportSource } from '../../constants/attendanceApiAccess'
import type {
  AttendanceReportLunchBreak,
  AttendanceReportTeaBreak,
} from './attendanceReportBreak.types'

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

export type AttendanceReportDayPunch = {
  punchTime: string
  punchType?: string | null
  rawPunchType?: string | null
  verifyMode?: string | null
  sourceRowId?: string | null
}

export type AttendanceDayRecord = {
  date: string
  weekday?: string
  rawStatus?: string
  status?: string
  displayState?: string
  isRegularised?: boolean
  flags?: string[]
  issues?: string[]
  checkIn?: string | null
  checkOut?: string | null
  lateMinutes?: number
  lateAfterGraceMinutes?: number
  lunchMinutes?: number
  teaMinutes?: number
  overtimeMinutes?: number
  workingMinutes?: number
  grossMinutes?: number
  earlyLeaveByMinutes?: number
  dayContext?: string | null
  lunchBreak?: AttendanceReportLunchBreak | null
  teaBreak?: AttendanceReportTeaBreak | null
  halfDaySession?: string | null
  otherBreakMinutes?: number
  punches?: AttendanceReportDayPunch[]
  source?: string
}

export type AttendanceReportSummary = {
  presentDays?: number
  lateDays?: number
  halfDays?: number
  earlyLeaveDays?: number
  absentDays?: number
  missedPunchDays?: number
  leaveDays?: number
  holidayDays?: number
  weeklyOffDays?: number
  totalWorkedMinutes?: number
  totalOvertimeMinutes?: number
  totalLateMinutes?: number
}

export type AttendanceReportEmployeeSnapshot = {
  id?: string
  employeeCode?: string
  fullName?: string
  designation?: string
  deviceId?: string
  deviceUserId?: string
}

export type AttendanceReportResult = {
  employeeId?: string
  employeeCode?: string
  fromDate?: string
  toDate?: string
  date?: string
  source?: AttendanceReportSource | string
  timezone?: string
  fallbackReason?: string
  truncated?: boolean
  employee?: AttendanceReportEmployeeSnapshot
  summary?: AttendanceReportSummary
  policy?: Record<string, string | number | boolean>
  days: AttendanceDayRecord[]
}