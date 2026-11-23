import type { BackendRoleCode, RoleNavItem, RoleUiConfig } from '../types/roles'
import { ROLE_ROUTE_MAP } from '../utils/roleRouteMap'

import {
  employeeLeaveNavChildren,
  employeePayrollNavChildren,
  leaveNavChildrenForRbac,
  payrollNavChildrenForRbac,
} from './leavePayrollNavChildren'
import { calendarNavChildrenForRbac, employeeCalendarNavChildren } from './calendarNavChildren'
import { employeeLeadsNavChildren, leadsNavChildrenForRbac } from './leadsNavChildren'

function recruitmentChildren(prefix: string): RoleNavItem['children'] {
  return [
    { title: 'Setup', path: `${prefix}/recruitment`, isSectionLabel: true },
    {
      title: 'Overview',
      path: `${prefix}/recruitment`,
      feature: 'recruitment.overview',
    },
    {
      title: 'Job Postings',
      path: `${prefix}/recruitment/jobs`,
      feature: 'recruitment.jobs',
    },
  // Job Descriptions UI hidden — page kept in codebase for later phases
  // {
  //   title: 'Job Descriptions',
  //   path: `${prefix}/recruitment/job-descriptions`,
  //   feature: 'recruitment.jobDescriptions',
  // },
    { title: 'Candidates & applications', path: `${prefix}/recruitment`, isSectionLabel: true },
    {
      title: 'Candidates',
      path: `${prefix}/recruitment/candidates`,
      feature: 'recruitment.candidates',
    },
    {
      title: 'Application Pipeline',
      path: `${prefix}/recruitment/pipeline`,
      feature: 'recruitment.pipeline',
    },
    { title: 'Interviews & offers', path: `${prefix}/recruitment`, isSectionLabel: true },
    {
      title: 'Interview Scheduling',
      path: `${prefix}/recruitment/interviews`,
      feature: 'recruitment.interviews',
    },
    {
      title: 'Interview Feedback',
      path: `${prefix}/recruitment/feedback`,
      feature: 'recruitment.feedback',
    },
    {
      title: 'Offers & offer letters',
      path: `${prefix}/recruitment/offers`,
      feature: 'recruitment.offers',
    },
    { title: 'Insights', path: `${prefix}/recruitment`, isSectionLabel: true },
    {
      title: 'Recruitment Analytics',
      path: `${prefix}/recruitment/analytics`,
      feature: 'recruitment.analytics',
    },
  ]
}

function attendanceChildren(prefix: string): RoleNavItem['children'] {
  return [
    {
      title: 'Attendance Overview',
      path: `${prefix}/attendance`,
      feature: 'attendance.overview',
    },
    {
      title: 'Daily Attendance',
      path: `${prefix}/attendance/daily`,
      feature: 'attendance.daily',
    },
    {
      title: 'Check-in / Check-out',
      path: `${prefix}/attendance/check-in`,
      feature: 'attendance.checkIn',
    },
    {
      title: 'Attendance Corrections',
      path: `${prefix}/attendance/corrections`,
      feature: 'attendance.corrections',
    },
    {
      title: 'Attendance Regularization',
      path: `${prefix}/attendance/regularization`,
      feature: 'attendance.regularization',
    },
    {
      title: 'Overtime Management',
      path: `${prefix}/attendance/overtime`,
      feature: 'attendance.overtime',
    },
    {
      title: 'Weekly Off Management',
      path: `${prefix}/attendance/weekly-off`,
      feature: 'attendance.weeklyOff',
    },
    {
      title: 'Holiday Management',
      path: `${prefix}/attendance/holidays`,
      feature: 'attendance.holidays',
    },
    {
      title: 'Attendance Reports',
      path: `${prefix}/attendance/reports`,
      feature: 'attendance.reports',
    },
    {
      title: 'Attendance Settings',
      path: `${prefix}/attendance/settings`,
      feature: 'attendance.settings',
    },
  ]
}

const superAdminNav: RoleNavItem[] = [
  {
    title: 'Dashboard',
    path: '/superadmin/dashboard',
    iconName: 'LayoutDashboard',
  },
  {
    title: 'User Management',
    path: '/superadmin/users',
    iconName: 'Users',
    feature: 'module.users',
  },
  {
    title: 'Employee Management',
    path: '/superadmin/employees',
    iconName: 'UserCog',
    feature: 'employee.overview',
    children: [
      {
        title: 'Employee Overview',
        path: '/superadmin/employees',
        feature: 'employee.overview',
      },
      {
        title: 'Employee Directory',
        path: '/superadmin/employees/directory',
        feature: 'employee.directory',
      },
      {
        title: 'Add Employee',
        path: '/superadmin/employees/add',
        feature: 'employee.registration.edit',
      },
    ],
  },
  {
    title: 'Role Management',
    path: '/superadmin/roles',
    iconName: 'Shield',
    feature: 'module.roles',
  },
  {
    title: 'Permission Management',
    path: '/superadmin/permissions',
    iconName: 'KeyRound',
    feature: 'module.permissions',
  },
  {
    title: 'Department Management',
    path: '/superadmin/departments',
    iconName: 'Building2',
    feature: 'employee.organization.view',
  },
  {
    title: 'Designations',
    path: '/superadmin/designations',
    iconName: 'BadgeCheck',
    feature: 'employee.organization.view',
  },
  {
    title: 'Employee Documents',
    path: '/superadmin/documents',
    iconName: 'FileText',
    feature: 'employee.documents.view',
  },
  {
    title: 'Attendance Management',
    path: '/superadmin/attendance',
    iconName: 'ClipboardList',
    feature: 'attendance.overview',
    children: attendanceChildren('/superadmin'),
  },
  {
    title: 'Leave Management',
    path: '/superadmin/leave',
    iconName: 'CalendarDays',
    children: leaveNavChildrenForRbac('SUPER_ADMIN', '/superadmin'),
  },
  {
    title: 'Payroll Management',
    path: '/superadmin/payroll',
    iconName: 'Wallet',
    children: payrollNavChildrenForRbac('SUPER_ADMIN', '/superadmin'),
  },
  {
    title: 'Recruitment & ATS',
    path: '/superadmin/recruitment',
    iconName: 'Briefcase',
    feature: 'recruitment.overview',
    children: recruitmentChildren('/superadmin'),
  },
  {
    title: 'Leads Management',
    path: '/superadmin/leads',
    iconName: 'Megaphone',
    feature: 'leads.overview',
    children: leadsNavChildrenForRbac('SUPER_ADMIN', '/superadmin'),
  },
  {
    title: 'Office Calendar',
    path: '/superadmin/calendar',
    iconName: 'CalendarRange',
    feature: 'calendar.view',
    children: calendarNavChildrenForRbac('SUPER_ADMIN', '/superadmin'),
  },
  {
    title: 'Performance Management',
    path: '/superadmin/performance',
    iconName: 'Target',
  },
  {
    title: 'Reports & Analytics',
    path: '/superadmin/reports',
    iconName: 'BarChart3',
  },
  {
    title: 'Audit Logs',
    path: '/superadmin/audit-logs',
    iconName: 'ScrollText',
    feature: 'module.audit',
  },
  {
    title: 'Organization Settings',
    path: '/superadmin/organization-settings',
    iconName: 'Building',
  },
  {
    title: 'System Settings',
    path: '/superadmin/system-settings',
    iconName: 'Settings',
    feature: 'module.systemSettings',
  },
]

const adminNav: RoleNavItem[] = [
  { title: 'Dashboard', path: '/admin/dashboard', iconName: 'LayoutDashboard' },
  {
    title: 'User Management',
    path: '/admin/users',
    iconName: 'Users',
    feature: 'module.users',
  },
  {
    title: 'Employee Management',
    path: '/admin/employees',
    iconName: 'UserCog',
    feature: 'employee.overview',
    children: [
      {
        title: 'Employee Overview',
        path: '/admin/employees',
        feature: 'employee.overview',
      },
      {
        title: 'Employee Directory',
        path: '/admin/employees/directory',
        feature: 'employee.directory',
      },
    ],
  },
  {
    title: 'Departments',
    path: '/admin/departments',
    iconName: 'Building2',
    feature: 'employee.organization.view',
  },
  {
    title: 'Designations',
    path: '/admin/designations',
    iconName: 'BadgeCheck',
    feature: 'employee.organization.view',
  },
  {
    title: 'Employee Documents',
    path: '/admin/documents',
    iconName: 'FileText',
    feature: 'employee.documents.view',
  },
  {
    title: 'Attendance Management',
    path: '/admin/attendance',
    iconName: 'ClipboardList',
    feature: 'attendance.overview',
    children: attendanceChildren('/admin'),
  },
  {
    title: 'Leave Management',
    path: '/admin/leave',
    iconName: 'CalendarDays',
    children: leaveNavChildrenForRbac('HR_ADMIN', '/admin'),
  },
  {
    title: 'Payroll Management',
    path: '/admin/payroll',
    iconName: 'Wallet',
    children: payrollNavChildrenForRbac('HR_ADMIN', '/admin'),
  },
  {
    title: 'Leads Management',
    path: '/admin/leads',
    iconName: 'Megaphone',
    feature: 'leads.overview',
    children: leadsNavChildrenForRbac('HR_ADMIN', '/admin'),
  },
  {
    title: 'Office Calendar',
    path: '/admin/calendar',
    iconName: 'CalendarRange',
    feature: 'calendar.view',
    children: calendarNavChildrenForRbac('HR_ADMIN', '/admin'),
  },
  {
    title: 'Performance Management',
    path: '/admin/performance',
    iconName: 'Target',
  },
  {
    title: 'Reports & Analytics',
    path: '/admin/reports',
    iconName: 'BarChart3',
  },
  {
    title: 'Organization Settings',
    path: '/admin/organization-settings',
    iconName: 'Building',
  },
]

const hrNav: RoleNavItem[] = [
  {
    title: 'Dashboard',
    path: '/hr/dashboard',
    iconName: 'LayoutDashboard',
    feature: 'dashboard.hr',
  },
  {
    title: 'Employees',
    path: '/hr/employees',
    iconName: 'Users',
    feature: 'employee.overview',
    children: [
      {
        title: 'Employee Overview',
        path: '/hr/employees',
        feature: 'employee.overview',
      },
      {
        title: 'Employee Directory',
        path: '/hr/employees/directory',
        feature: 'employee.directory',
      },
    ],
  },
  {
    title: 'Add Employee',
    path: '/hr/employees/add',
    iconName: 'UserPlus',
    feature: 'employee.registration.edit',
  },
  {
    title: 'Employee Documents',
    path: '/hr/documents',
    iconName: 'FileText',
    feature: 'employee.documents.view',
  },
  {
    title: 'Departments',
    path: '/hr/departments',
    iconName: 'Building2',
    feature: 'employee.organization.view',
  },
  {
    title: 'Attendance',
    path: '/hr/attendance',
    iconName: 'ClipboardList',
    feature: 'attendance.overview',
    children: attendanceChildren('/hr'),
  },
  {
    title: 'Leave Management',
    path: '/hr/leave',
    iconName: 'CalendarDays',
    children: leaveNavChildrenForRbac('MANAGER', '/hr'),
  },
  {
    title: 'Payroll Management',
    path: '/hr/payroll',
    iconName: 'Wallet',
    children: payrollNavChildrenForRbac('MANAGER', '/hr'),
  },
  { title: 'Onboarding', path: '/hr/onboarding', iconName: 'UserRoundPlus' },
  { title: 'Offboarding', path: '/hr/offboarding', iconName: 'UserRoundMinus' },
  {
    title: 'Request',
    path: '/hr/support/admin-requests',
    iconName: 'Headphones',
    feature: 'support.adminRequests',
  },
  {
    title: 'Recruitment & ATS',
    path: '/hr/recruitment',
    iconName: 'Briefcase',
    feature: 'recruitment.overview',
    children: recruitmentChildren('/hr'),
  },
  {
    title: 'Leads Management',
    path: '/hr/leads',
    iconName: 'Megaphone',
    feature: 'leads.my',
    children: leadsNavChildrenForRbac('MANAGER', '/hr'),
  },
  {
    title: 'Employee Reports',
    path: '/hr/reports',
    iconName: 'BarChart3',
  },
  {
    title: 'Office Calendar',
    path: '/hr/calendar',
    iconName: 'CalendarRange',
    feature: 'calendar.view',
    children: calendarNavChildrenForRbac('MANAGER', '/hr'),
  },
]

const employeeNav: RoleNavItem[] = [
  {
    title: 'Dashboard',
    path: '/employee/dashboard',
    iconName: 'LayoutDashboard',
  },
  {
    title: 'My Profile',
    path: '/employee/profile',
    iconName: 'UserRound',
    feature: 'employee.profile.own',
  },
  {
    title: 'My Attendance',
    path: '/employee/attendance',
    iconName: 'ClipboardList',
    feature: 'attendance.reports',
  },
  {
    title: 'Check In / Check Out',
    path: '/employee/check-in',
    iconName: 'Clock',
    feature: 'attendance.checkIn',
  },
  {
    title: 'Attendance Corrections',
    path: '/employee/attendance/corrections',
    iconName: 'ClipboardList',
    feature: 'attendance.corrections',
  },
  {
    title: 'Attendance Regularization',
    path: '/employee/attendance/regularization',
    iconName: 'ClipboardList',
    feature: 'attendance.regularization',
  },
  {
    title: 'Leave Management',
    path: '/employee/leave',
    iconName: 'CalendarDays',
    children: employeeLeaveNavChildren(),
  },
  {
    title: 'Payroll Management',
    path: '/employee/payslips',
    iconName: 'Wallet',
    children: employeePayrollNavChildren(),
  },
  {
    title: 'Leads Management',
    path: '/employee/leads',
    iconName: 'Megaphone',
    feature: 'leads.my',
    children: employeeLeadsNavChildren(),
  },
  {
    title: 'My Documents',
    path: '/employee/documents',
    iconName: 'FileText',
    feature: 'employee.documents.own',
  },
  {
    title: 'Company Holidays',
    path: '/employee/holidays',
    iconName: 'Palmtree',
    feature: 'attendance.holidays',
  },
  {
    title: 'Office Calendar',
    path: '/employee/calendar',
    iconName: 'CalendarRange',
    feature: 'calendar.view',
    children: employeeCalendarNavChildren(),
  },
  {
    title: 'Announcements',
    path: '/employee/announcements',
    iconName: 'Megaphone',
  },
]

export const ROLE_UI_CONFIG: Record<BackendRoleCode, RoleUiConfig> = {
  SUPER_ADMIN: {
    roleCode: 'SUPER_ADMIN',
    routePrefix: ROLE_ROUTE_MAP.SUPER_ADMIN,
    label: 'Super Admin',
    navigation: superAdminNav,
  },
  HR_ADMIN: {
    roleCode: 'HR_ADMIN',
    routePrefix: ROLE_ROUTE_MAP.HR_ADMIN,
    label: 'Admin',
    navigation: adminNav,
  },
  MANAGER: {
    roleCode: 'MANAGER',
    routePrefix: ROLE_ROUTE_MAP.MANAGER,
    label: 'HR',
    navigation: hrNav,
  },
  EMPLOYEE: {
    roleCode: 'EMPLOYEE',
    routePrefix: ROLE_ROUTE_MAP.EMPLOYEE,
    label: 'Employee',
    navigation: employeeNav,
  },
}

export function getRoleUiConfig(roleCode: BackendRoleCode): RoleUiConfig {
  return ROLE_UI_CONFIG[roleCode]
}
