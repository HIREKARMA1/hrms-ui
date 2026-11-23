export type DateRangePreset = 'this-week' | 'this-month' | 'last-month' | 'custom'

export type EmployeeStatSummary = {
  totalEmployees: number
  totalChangePercent: number
  activeEmployees: number
  inactiveEmployees: number
  presentToday: number
  presentPercent: number
  absentToday: number
  absentPercent: number
  onLeave: number
  onLeavePercent: number
  lateArrivals: number
  lateChangeVsYesterday: number
}

export type EmployeeListItem = {
  id: string
  name: string
  employeeId: string
  department: string
  initials: string
}

export type BirthdayEmployee = EmployeeListItem & {
  birthdayDate: string
}

export type AnniversaryEmployee = EmployeeListItem & {
  joiningDate: string
  yearsOfService: number
}

export type NewJoiner = EmployeeListItem & {
  joiningDate: string
}

export type NoticePeriodEmployee = EmployeeListItem & {
  noticeStartDate: string
  lastWorkingDate: string
}

export type DepartmentDistributionItem = {
  department: string
  count: number
  percentage: number
  color: string
}

export type AttendanceTrendPoint = {
  label: string
  present: number
  absent: number
  onLeave: number
  late: number
}

export type AttendanceAnalyticsSummary = {
  present: number
  absent: number
  onLeave: number
  late: number
}

export type LeaveStatusSummary = {
  total: number
  approved: number
  pending: number
  rejected: number
}

export type LeaveTypeDistribution = {
  type: string
  count: number
  color: string
}

export type AttritionPoint = {
  month: string
  rate: number
}

export type AttritionSummary = {
  currentRate: number
  exitedThisMonth: number
  exitedThisYear: number
  previousMonthRate: number
  trend: AttritionPoint[]
}

export type PayrollPoint = {
  month: string
  amount: number
}

export type PayrollSummary = {
  totalPayroll: number
  grossSalary: number
  netSalary: number
  totalDeductions: number
  employeesIncluded: number
  trend: PayrollPoint[]
}

/** Extended workforce metrics — additive to existing EmployeeStatSummary. */
export type WorkforceExtendedSummary = {
  newJoinersThisMonth: number
  onProbation: number
  onNoticePeriod: number
  resigned: number
  terminated: number
}

export type NamedCountItem = {
  name: string
  count: number
  percentage: number
  color: string
}

export type RecentlyAddedEmployee = EmployeeListItem & {
  joiningDate: string
  employmentType: string
  status: string
}
