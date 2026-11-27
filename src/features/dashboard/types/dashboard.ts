export type StatTrend = {
  value: string
  positive: boolean
}

export type DashboardStatIcon =
  | 'users'
  | 'userCheck'
  | 'calendarDays'
  | 'userX'
  | 'hourglass'

export type DashboardStat = {
  id: string
  label: string
  value: string
  icon: DashboardStatIcon
  /** Shown on mock/placeholder dashboards when analytics are not wired. */
  trend?: StatTrend
  /** Shown on live summary cards from GET /dashboard/summary. */
  footline?: string
  iconClassName: string
}

export type AttendancePoint = {
  month: string
  present: number
  absent: number
}

export type DepartmentShare = {
  name: string
  value: number
  color: string
}

export type LeaveRequest = {
  id: string
  employee: string
  leaveType: string
  duration: string
  status: 'Approved' | 'Pending' | 'Rejected'
}

export type UpcomingEvent = {
  id: string
  title: string
  date: string
  time: string
}

export type PipelineStage = {
  id: string
  label: string
  count: number
}
