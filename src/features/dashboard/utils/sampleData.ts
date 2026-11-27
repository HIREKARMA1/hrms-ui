import type {
  AttendancePoint,
  DashboardStat,
  DepartmentShare,
  LeaveRequest,
  PipelineStage,
  UpcomingEvent,
} from '../types/dashboard'

export const dashboardStats: DashboardStat[] = [
  {
    id: 'total',
    label: 'Total Employees',
    value: '248',
    icon: 'users',
    trend: { value: '+6.4% from last month', positive: true },
    iconClassName: 'bg-brand-50 text-brand-600',
  },
  {
    id: 'active',
    label: 'Active Employees',
    value: '220',
    icon: 'userCheck',
    trend: { value: '+5.8% from last month', positive: true },
    iconClassName: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'leave',
    label: 'On Leave',
    value: '12',
    icon: 'calendarDays',
    trend: { value: '+20% from last month', positive: true },
    iconClassName: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'probation',
    label: 'On probation',
    value: '8',
    icon: 'hourglass',
    trend: { value: '+2 this month', positive: true },
    iconClassName: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'terminated',
    label: 'Terminated',
    value: '8',
    icon: 'userX',
    trend: { value: '-3.2% from last month', positive: false },
    iconClassName: 'bg-rose-50 text-rose-600',
  },
]

export const attendanceData: AttendancePoint[] = [
  { month: 'Jan', present: 92, absent: 8 },
  { month: 'Feb', present: 94, absent: 6 },
  { month: 'Mar', present: 90, absent: 10 },
  { month: 'Apr', present: 95, absent: 5 },
  { month: 'May', present: 93, absent: 7 },
  { month: 'Jun', present: 96, absent: 4 },
]

export const departmentDistribution: DepartmentShare[] = [
  { name: 'Engineering', value: 86, color: '#0F766E' },
  { name: 'Product', value: 42, color: '#8b7cf8' },
  { name: 'HR', value: 28, color: '#34d399' },
  { name: 'Finance', value: 24, color: '#f59e0b' },
  { name: 'Sales & Marketing', value: 68, color: '#38bdf8' },
]

export const recentLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employee: 'Ananya Sharma',
    leaveType: 'Annual Leave',
    duration: '3 days',
    status: 'Approved',
  },
  {
    id: '2',
    employee: 'Rahul Mehta',
    leaveType: 'Sick Leave',
    duration: '1 day',
    status: 'Pending',
  },
  {
    id: '3',
    employee: 'Priya Nair',
    leaveType: 'Work From Home',
    duration: '2 days',
    status: 'Approved',
  },
  {
    id: '4',
    employee: 'Vikram Singh',
    leaveType: 'Casual Leave',
    duration: '1 day',
    status: 'Rejected',
  },
]

export const upcomingEvents: UpcomingEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    date: '12 Nov 2026',
    time: '10:30 AM',
  },
  {
    id: '2',
    title: 'HR Policy Update Session',
    date: '14 Nov 2026',
    time: '03:00 PM',
  },
  {
    id: '3',
    title: 'New Joiner Orientation',
    date: '18 Nov 2026',
    time: '11:00 AM',
  },
]

export const recruitmentPipeline: PipelineStage[] = [
  { id: 'applied', label: 'Applied', count: 48 },
  { id: 'screening', label: 'Screening', count: 22 },
  { id: 'interview', label: 'Interview', count: 14 },
  { id: 'selected', label: 'Selected', count: 7 },
  { id: 'offer', label: 'Offer Released', count: 4 },
]
