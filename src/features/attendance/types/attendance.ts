export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Late'
  | 'Half-Day'
  | 'On Leave'
  | 'Holiday'
  | 'Weekly Off'

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected'

export type AttendanceStat = {
  id: string
  label: string
  value: number
  trend: string
  positive: boolean
  icon:
    | 'users'
    | 'userCheck'
    | 'userX'
    | 'calendarDays'
    | 'clock'
    | 'logOut'
    | 'sunset'
    | 'timer'
  iconClassName: string
}

export type AttendanceTrendPoint = {
  month: string
  present: number
  absent: number
  percentage: number
}

export type DepartmentAttendance = {
  department: string
  present: number
  absent: number
  onLeave: number
  late: number
}

export type TodaySummaryItem = {
  label: string
  value: number
  color: string
}

export type RecentAttendanceActivity = {
  id: string
  employeeName: string
  employeeId: string
  checkIn: string
  checkOut: string
  workingHours: string
  status: AttendanceStatus
}

export type PendingCorrection = {
  id: string
  employeeName: string
  requestDate: string
  reason: string
  status: ApprovalStatus
}

export type DailyAttendanceRecord = {
  id: string
  employeeName: string
  employeeId: string
  department: string
  designation: string
  date: string
  checkIn: string
  checkOut: string
  breakDuration: string
  workingHours: string
  overtime: string
  status: AttendanceStatus
  shift: string
}

export type CorrectionRequest = {
  id: string
  employeeName: string
  employeeId: string
  date: string
  originalCheckIn: string
  requestedCheckIn: string
  originalCheckOut: string
  requestedCheckOut: string
  reason: string
  requestDate: string
  status: ApprovalStatus
  department: string
}

export type RegularizationRequest = {
  id: string
  employeeName: string
  employeeId: string
  requestDate: string
  attendanceDate: string
  correctionType: string
  checkIn: string
  checkOut: string
  reason: string
  status: ApprovalStatus
  approver: string
}

export type OvertimeRecord = {
  id: string
  employeeName: string
  employeeId: string
  department: string
  date: string
  regularHours: string
  overtimeHours: string
  status: ApprovalStatus
}

export type HolidayRecord = {
  id: string
  name: string
  date: string
  type: 'National' | 'Festival' | 'Optional' | 'Company'
  department: string
  mandatory: boolean
}

export type WeeklyOffConfig = {
  scope: 'Organization' | 'Department' | 'Employee'
  target: string
  days: string[]
  rotational: boolean
}
