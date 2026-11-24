/** Shared pagination block on many dashboard list endpoints. */
export type DashboardPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type DashboardDepartmentRef = {
  id: string
  code: string
  name: string
} | null

export type PresentTodayData = {
  date: string
  timezone: string
  empty: boolean
  items: Array<{
    employeeId: string
    employeeCode: string
    employeeName: string
    department: DashboardDepartmentRef
    attendanceDate: string
    checkInTime: string | null
    checkOutTime: string | null
    status: 'PRESENT'
    punchCount: number
  }>
  pagination: DashboardPagination
  skippedEmployees: number
}

export type AbsentTodayData = {
  date: string
  timezone: string
  workingDay: boolean
  nonWorkingDay: unknown
  empty: boolean
  items: Array<{
    employeeId: string
    employeeCode: string
    employeeName: string
    department: DashboardDepartmentRef
  }>
  pagination: DashboardPagination
}

export type OnLeaveTodayData = {
  date: string
  timezone: string
  empty: boolean
  items: Array<{
    employeeId: string
    employeeCode: string
    employeeName: string
    department: DashboardDepartmentRef
  }>
  pagination: DashboardPagination
}

export type LateArrivalsData = {
  date: string
  timezone: string
  empty: boolean
  items: Array<{
    employeeId: string
    employeeCode: string
    employeeName: string
    department: DashboardDepartmentRef
  }>
  pagination: DashboardPagination
  skippedEmployees?: number
}

export type UpcomingBirthdayItem = {
  employeeId: string
  employeeCode: string
  employeeName: string
  department: DashboardDepartmentRef
  dateOfBirth: string
  upcomingBirthday: string
  daysUntil: number
}

export type UpcomingBirthdaysData = {
  date: string
  timezone: string
  days: number
  windowEnd: string
  empty: boolean
  items: UpcomingBirthdayItem[]
  pagination: DashboardPagination
}

export type UpcomingAnniversaryItem = {
  employeeId: string
  employeeCode: string
  employeeName: string
  department: DashboardDepartmentRef
  joiningDate: string
  upcomingAnniversary: string
  daysUntil: number
  yearsOfService: number
}

export type UpcomingAnniversariesData = {
  date: string
  timezone: string
  days: number
  windowEnd: string
  empty: boolean
  items: UpcomingAnniversaryItem[]
  pagination: DashboardPagination
}

export type NewJoinerItem = {
  employeeId: string
  employeeCode: string
  employeeName: string
  department: DashboardDepartmentRef
  designation: string
  dateOfJoining: string
  employmentStatus: string
}

export type NewJoinersData = {
  date: string
  timezone: string
  year: number
  month: number
  periodStart: string
  periodEnd: string
  empty: boolean
  items: NewJoinerItem[]
  pagination: DashboardPagination
}

export type ByDepartmentItem = {
  departmentId: string | null
  departmentCode: string | null
  departmentName: string
  employeeCount: number
}

export type ByDepartmentData = {
  employmentStatus: string | null
  totalEmployees: number
  empty: boolean
  items: ByDepartmentItem[]
}

export type AttendanceAnalyticsSummary = {
  totalAttendanceRecords: number
  present: number
  onTime: number
  late: number
  absent: number
  onLeave: number
  halfDay: number
  missedPunch: number
  holiday: number
  weeklyOff: number
  attendancePercentage: number | null
}

export type AttendanceAnalyticsSeriesPoint = {
  date: string
  present: number
  onTime: number
  late: number
  absent: number
  onLeave: number
  halfDay: number
  missedPunch: number
  totalAttendanceRecords: number
}

export type AttendanceAnalyticsData = {
  startDate: string
  endDate: string
  timezone: string
  source: 'stored'
  departmentId: string | null
  empty: boolean
  eligibleEmployees: number
  skippedEmployees: number
  summary: AttendanceAnalyticsSummary
  series: AttendanceAnalyticsSeriesPoint[]
}

export type LeaveAnalyticsSummary = {
  totalLeaveRequests: number
  approved: number
  pending: number
  rejected: number
  cancelled: number
  totalApprovedLeaveDays: number
}

export type LeaveAnalyticsByTypeItem = {
  leaveTypeId: string
  leaveTypeCode: string
  leaveTypeName: string
  isPaid: boolean
  requestCount: number
  approved: number
  pending: number
  rejected: number
  cancelled: number
  approvedLeaveDays: number
}

export type LeaveAnalyticsData = {
  startDate: string
  endDate: string
  timezone: string
  departmentId: string | null
  empty: boolean
  summary: LeaveAnalyticsSummary
  series: Array<{
    date: string
    totalLeaveRequests: number
    approved: number
    pending: number
    rejected: number
    cancelled: number
    approvedLeaveDays: number
  }>
  byLeaveType: LeaveAnalyticsByTypeItem[]
}

export type TerminatedData = {
  empty: boolean
  items: Array<{
    employeeId: string
    employeeCode: string
    employeeName: string
    department: DashboardDepartmentRef
    designation: string
    dateOfJoining: string
    employmentStatus: 'TERMINATED'
  }>
  pagination: DashboardPagination
}

export type OnProbationData = {
  empty: boolean
  items: unknown[]
  pagination: DashboardPagination
}

export type DashboardDateRangeArgs = {
  startDate?: string
  endDate?: string
  departmentId?: string
}

export type DashboardListArgs = {
  page?: number
  limit?: number
  days?: number
  year?: number
  month?: number
  search?: string
  departmentId?: string
}
