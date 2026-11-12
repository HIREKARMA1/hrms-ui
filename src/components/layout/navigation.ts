import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Target,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type NavChild = {
  title: string
  path: string
}

export type NavItem = {
  title: string
  path: string
  icon: LucideIcon
  children?: NavChild[]
}

export const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Employee Management',
    path: '/employees',
    icon: Users,
    children: [
      { title: 'Employees', path: '/employees' },
      { title: 'Add Employee', path: '/employees/add' },
      { title: 'Bulk Import', path: '/employees/bulk-import' },
      { title: 'Departments', path: '/employees/departments' },
      { title: 'Designations', path: '/employees/designations' },
      { title: 'Job Roles', path: '/employees/job-roles' },
      { title: 'Teams', path: '/employees/teams' },
    ],
  },
  {
    title: 'Attendance Management',
    path: '/attendance',
    icon: ClipboardList,
  },
  {
    title: 'Leave Management',
    path: '/leave',
    icon: CalendarDays,
  },
  {
    title: 'Payroll Management',
    path: '/payroll',
    icon: FolderKanban,
  },
  {
    title: 'Recruitment',
    path: '/recruitment',
    icon: UserPlus,
  },
  {
    title: 'Performance',
    path: '/performance',
    icon: Target,
  },
  {
    title: 'Leads Management',
    path: '/leads',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Organization',
    path: '/organization',
    icon: Building2,
    children: [
      { title: 'Departments', path: '/organization/departments' },
      { title: 'Designations', path: '/organization/designations' },
      { title: 'Teams', path: '/organization/teams' },
      { title: 'Job Roles', path: '/organization/job-roles' },
    ],
  },
  {
    title: 'Documents',
    path: '/documents',
    icon: FileText,
  },
  {
    title: 'Office Calendar',
    path: '/calendar',
    icon: CalendarRange,
  },
  {
    title: 'Reports & Analytics',
    path: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: Settings,
  },
]
