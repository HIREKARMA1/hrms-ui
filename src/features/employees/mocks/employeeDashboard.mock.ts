import type {
  AnniversaryEmployee,
  AttendanceAnalyticsSummary,
  AttendanceTrendPoint,
  AttritionSummary,
  BirthdayEmployee,
  DepartmentDistributionItem,
  EmployeeStatSummary,
  LeaveStatusSummary,
  LeaveTypeDistribution,
  NamedCountItem,
  NewJoiner,
  NoticePeriodEmployee,
  PayrollSummary,
  RecentlyAddedEmployee,
  WorkforceExtendedSummary,
} from '../types/employeeDashboard.types'

export const employeeStatSummary: EmployeeStatSummary = {
  totalEmployees: 248,
  totalChangePercent: 6.4,
  activeEmployees: 220,
  inactiveEmployees: 28,
  presentToday: 198,
  presentPercent: 79.8,
  absentToday: 12,
  absentPercent: 4.8,
  onLeave: 10,
  onLeavePercent: 4.0,
  lateArrivals: 8,
  lateChangeVsYesterday: 3,
}

export const upcomingBirthdays: BirthdayEmployee[] = [
  {
    id: 'b1',
    name: 'Ananya Sharma',
    employeeId: 'EMP-1021',
    department: 'Engineering',
    initials: 'AS',
    birthdayDate: '15 Nov 2026',
  },
  {
    id: 'b2',
    name: 'Rahul Mehta',
    employeeId: 'EMP-1044',
    department: 'Product',
    initials: 'RM',
    birthdayDate: '18 Nov 2026',
  },
  {
    id: 'b3',
    name: 'Priya Nair',
    employeeId: 'EMP-1078',
    department: 'HR',
    initials: 'PN',
    birthdayDate: '22 Nov 2026',
  },
  {
    id: 'b4',
    name: 'Vikram Singh',
    employeeId: 'EMP-1090',
    department: 'Finance',
    initials: 'VS',
    birthdayDate: '28 Nov 2026',
  },
]

export const workAnniversaries: AnniversaryEmployee[] = [
  {
    id: 'w1',
    name: 'Sneha Reddy',
    employeeId: 'EMP-1102',
    department: 'Sales & Marketing',
    initials: 'SR',
    joiningDate: '12 Nov 2021',
    yearsOfService: 5,
  },
  {
    id: 'w2',
    name: 'Karan Patel',
    employeeId: 'EMP-1115',
    department: 'Engineering',
    initials: 'KP',
    joiningDate: '14 Nov 2019',
    yearsOfService: 7,
  },
  {
    id: 'w3',
    name: 'Meera Iyer',
    employeeId: 'EMP-1120',
    department: 'HR',
    initials: 'MI',
    joiningDate: '16 Nov 2023',
    yearsOfService: 3,
  },
]

export const newJoiners: NewJoiner[] = [
  {
    id: 'n1',
    name: 'Ishita Kapoor',
    employeeId: 'EMP-1201',
    department: 'Engineering',
    initials: 'IK',
    joiningDate: '03 Nov 2026',
  },
  {
    id: 'n2',
    name: 'Devansh Gupta',
    employeeId: 'EMP-1202',
    department: 'Product',
    initials: 'DG',
    joiningDate: '05 Nov 2026',
  },
  {
    id: 'n3',
    name: 'Neha Joshi',
    employeeId: 'EMP-1203',
    department: 'Operations',
    initials: 'NJ',
    joiningDate: '10 Nov 2026',
  },
]

export const noticePeriodEmployees: NoticePeriodEmployee[] = [
  {
    id: 'np1',
    name: 'Arjun Das',
    employeeId: 'EMP-1133',
    department: 'Product',
    initials: 'AD',
    noticeStartDate: '01 Nov 2026',
    lastWorkingDate: '30 Nov 2026',
  },
  {
    id: 'np2',
    name: 'Pooja Verma',
    employeeId: 'EMP-1088',
    department: 'Finance',
    initials: 'PV',
    noticeStartDate: '20 Oct 2026',
    lastWorkingDate: '19 Nov 2026',
  },
  {
    id: 'np3',
    name: 'Siddharth Rao',
    employeeId: 'EMP-1066',
    department: 'Operations',
    initials: 'SR',
    noticeStartDate: '05 Nov 2026',
    lastWorkingDate: '04 Dec 2026',
  },
]

export const departmentDistribution: DepartmentDistributionItem[] = [
  { department: 'Engineering', count: 86, percentage: 34.7, color: '#5938DB' },
  { department: 'HR', count: 22, percentage: 8.9, color: '#7055EB' },
  { department: 'Finance', count: 24, percentage: 9.7, color: '#16A34A' },
  { department: 'Product', count: 38, percentage: 15.3, color: '#3B82F6' },
  { department: 'Sales & Marketing', count: 52, percentage: 21.0, color: '#F59E0B' },
  { department: 'Operations', count: 26, percentage: 10.5, color: '#EF4444' },
]

export const attendanceSummary: AttendanceAnalyticsSummary = {
  present: 198,
  absent: 12,
  onLeave: 10,
  late: 8,
}

export const attendanceTrends: Record<
  'this-week' | 'this-month' | 'last-month',
  AttendanceTrendPoint[]
> = {
  'this-week': [
    { label: 'Mon', present: 205, absent: 8, onLeave: 9, late: 6 },
    { label: 'Tue', present: 210, absent: 6, onLeave: 8, late: 5 },
    { label: 'Wed', present: 198, absent: 12, onLeave: 10, late: 8 },
    { label: 'Thu', present: 202, absent: 10, onLeave: 11, late: 7 },
    { label: 'Fri', present: 196, absent: 14, onLeave: 10, late: 9 },
  ],
  'this-month': [
    { label: 'Week 1', present: 208, absent: 9, onLeave: 8, late: 6 },
    { label: 'Week 2', present: 202, absent: 11, onLeave: 10, late: 7 },
    { label: 'Week 3', present: 198, absent: 12, onLeave: 10, late: 8 },
    { label: 'Week 4', present: 204, absent: 10, onLeave: 9, late: 7 },
  ],
  'last-month': [
    { label: 'Week 1', present: 200, absent: 13, onLeave: 11, late: 9 },
    { label: 'Week 2', present: 195, absent: 15, onLeave: 12, late: 10 },
    { label: 'Week 3', present: 201, absent: 12, onLeave: 10, late: 8 },
    { label: 'Week 4', present: 197, absent: 14, onLeave: 11, late: 9 },
  ],
}

export const leaveStatusSummary: LeaveStatusSummary = {
  total: 64,
  approved: 42,
  pending: 14,
  rejected: 8,
}

export const leaveTypeDistribution: LeaveTypeDistribution[] = [
  { type: 'Casual Leave', count: 18, color: '#5938DB' },
  { type: 'Sick Leave', count: 14, color: '#EF4444' },
  { type: 'Earned Leave', count: 16, color: '#16A34A' },
  { type: 'Paid Leave', count: 10, color: '#3B82F6' },
  { type: 'Unpaid Leave', count: 6, color: '#F59E0B' },
]

export const attritionSummary: AttritionSummary = {
  currentRate: 3.6,
  exitedThisMonth: 4,
  exitedThisYear: 19,
  previousMonthRate: 4.1,
  trend: [
    { month: 'Jun', rate: 4.8 },
    { month: 'Jul', rate: 4.4 },
    { month: 'Aug', rate: 3.9 },
    { month: 'Sep', rate: 4.2 },
    { month: 'Oct', rate: 4.1 },
    { month: 'Nov', rate: 3.6 },
  ],
}

export const payrollSummary: PayrollSummary = {
  totalPayroll: 12850000,
  grossSalary: 14200000,
  netSalary: 11875000,
  totalDeductions: 2325000,
  employeesIncluded: 220,
  trend: [
    { month: 'Jun', amount: 12100000 },
    { month: 'Jul', amount: 12350000 },
    { month: 'Aug', amount: 12480000 },
    { month: 'Sep', amount: 12620000 },
    { month: 'Oct', amount: 12740000 },
    { month: 'Nov', amount: 12850000 },
  ],
}

export function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Additive mock metrics for newly requested dashboard widgets. */
export const workforceExtendedSummary: WorkforceExtendedSummary = {
  newJoinersThisMonth: 12,
  onProbation: 18,
  onNoticePeriod: 3,
  resigned: 6,
  terminated: 2,
}

export const branchDistribution: NamedCountItem[] = [
  { name: 'Hyderabad HQ', count: 110, percentage: 44.4, color: '#5938DB' },
  { name: 'Bengaluru', count: 72, percentage: 29.0, color: '#3B82F6' },
  { name: 'Pune', count: 40, percentage: 16.1, color: '#16A34A' },
  { name: 'Remote', count: 26, percentage: 10.5, color: '#F59E0B' },
]

export const genderDistribution: NamedCountItem[] = [
  { name: 'Female', count: 108, percentage: 43.5, color: '#5938DB' },
  { name: 'Male', count: 132, percentage: 53.2, color: '#3B82F6' },
  { name: 'Other / Prefer not to say', count: 8, percentage: 3.3, color: '#94A3B8' },
]

export const employmentTypeDistribution: NamedCountItem[] = [
  { name: 'Full-time', count: 198, percentage: 79.8, color: '#5938DB' },
  { name: 'Contract', count: 28, percentage: 11.3, color: '#F59E0B' },
  { name: 'Intern', count: 16, percentage: 6.5, color: '#3B82F6' },
  { name: 'Part-time', count: 6, percentage: 2.4, color: '#16A34A' },
]

export const recentlyAddedEmployees: RecentlyAddedEmployee[] = [
  {
    id: 'ra1',
    name: 'Ishita Kapoor',
    employeeId: 'EMP-1201',
    department: 'Engineering',
    initials: 'IK',
    joiningDate: '03 Nov 2026',
    employmentType: 'Full-time',
    status: 'Probation',
  },
  {
    id: 'ra2',
    name: 'Devansh Gupta',
    employeeId: 'EMP-1202',
    department: 'Product',
    initials: 'DG',
    joiningDate: '05 Nov 2026',
    employmentType: 'Full-time',
    status: 'Active',
  },
  {
    id: 'ra3',
    name: 'Neha Joshi',
    employeeId: 'EMP-1203',
    department: 'Operations',
    initials: 'NJ',
    joiningDate: '10 Nov 2026',
    employmentType: 'Contract',
    status: 'Probation',
  },
  {
    id: 'ra4',
    name: 'Ayaan Khan',
    employeeId: 'EMP-1204',
    department: 'Finance',
    initials: 'AK',
    joiningDate: '12 Nov 2026',
    employmentType: 'Intern',
    status: 'Active',
  },
]
