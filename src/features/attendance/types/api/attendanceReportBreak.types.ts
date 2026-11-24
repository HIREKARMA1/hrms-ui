export type AttendanceReportLunchBreak = {
  outTime?: string
  inTime?: string
  durationMinutes?: number
  earlyOutMinutes?: number
  lateInMinutes?: number
  exceededMinutes?: number
  isExceeded?: boolean
}

export type AttendanceReportTeaBreak = {
  outTime?: string
  inTime?: string
  durationMinutes?: number
  exceededMinutes?: number
  isExceeded?: boolean
}