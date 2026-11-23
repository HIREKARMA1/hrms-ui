import type { RolesApiResponse } from '../types/roles'

/** Matches the documented roles API response shape for typing/demo. */
export const mockRolesApiResponse: RolesApiResponse = {
  success: true,
  message: 'Roles retrieved',
  data: {
    items: [
      {
        id: 'role-super-admin',
        code: 'SUPER_ADMIN',
        name: 'Super Admin',
        description: 'Full system access across all HRMS modules',
        isSystem: true,
        isActive: true,
        userCount: 1,
        permissionCount: 16,
      },
      {
        id: 'role-hr-admin',
        code: 'HR_ADMIN',
        name: 'Admin',
        description: 'Organizational administration without system controls',
        isSystem: true,
        isActive: true,
        userCount: 3,
        permissionCount: 12,
      },
      {
        id: 'role-manager',
        code: 'MANAGER',
        name: 'HR',
        description: 'HR operations and employee lifecycle management',
        isSystem: true,
        isActive: true,
        userCount: 8,
        permissionCount: 10,
      },
      {
        id: 'role-employee',
        code: 'EMPLOYEE',
        name: 'Employee',
        description: 'Self-service access to personal HR records',
        isSystem: true,
        isActive: true,
        userCount: 220,
        permissionCount: 4,
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 4,
      totalPages: 1,
    },
  },
}

export const superAdminDashboardMock = {
  stats: [
    { id: 'employees', label: 'Total Employees', value: 248, tone: 'brand' },
    { id: 'users', label: 'Total Users', value: 265, tone: 'info' },
    { id: 'admins', label: 'Total Admins', value: 4, tone: 'success' },
    { id: 'hr', label: 'Total HR Users', value: 8, tone: 'warning' },
    { id: 'active', label: 'Active Users', value: 241, tone: 'success' },
    { id: 'inactive', label: 'Inactive Users', value: 24, tone: 'danger' },
    { id: 'roles', label: 'Total Roles', value: 4, tone: 'brand' },
    { id: 'perms', label: 'Total Permissions', value: 16, tone: 'info' },
  ],
  employeeGrowth: [
    { month: 'Jun', employees: 210 },
    { month: 'Jul', employees: 218 },
    { month: 'Aug', employees: 226 },
    { month: 'Sep', employees: 234 },
    { month: 'Oct', employees: 241 },
    { month: 'Nov', employees: 248 },
  ],
  departments: [
    { name: 'Engineering', value: 86 },
    { name: 'Product', value: 38 },
    { name: 'Sales', value: 52 },
    { name: 'HR', value: 22 },
    { name: 'Finance', value: 24 },
    { name: 'Operations', value: 26 },
  ],
  userActivity: [
    { day: 'Mon', logins: 180 },
    { day: 'Tue', logins: 210 },
    { day: 'Wed', logins: 195 },
    { day: 'Thu', logins: 230 },
    { day: 'Fri', logins: 205 },
  ],
  recentActivities: [
    { id: '1', text: 'Role SUPER_ADMIN permissions reviewed', time: '10 min ago' },
    { id: '2', text: 'New admin user invited', time: '1 hour ago' },
    { id: '3', text: 'Audit log export generated', time: 'Yesterday' },
  ],
  recentEmployees: [
    { id: 'EMP-1201', name: 'Ishita Kapoor', department: 'Engineering' },
    { id: 'EMP-1202', name: 'Devansh Gupta', department: 'Product' },
    { id: 'EMP-1203', name: 'Neha Joshi', department: 'Operations' },
  ],
  roleDistribution: [
    { role: 'Employee', count: 220 },
    { role: 'HR', count: 8 },
    { role: 'Admin', count: 4 },
    { role: 'Super Admin', count: 1 },
  ],
}

export const adminDashboardMock = {
  stats: [
    { id: 'total', label: 'Total Employees', value: 248 },
    { id: 'active', label: 'Active Employees', value: 220 },
    { id: 'leave', label: 'Employees on Leave', value: 10 },
    { id: 'attendance', label: "Today's Attendance", value: '92%' },
    { id: 'pending', label: 'Pending Leave Requests', value: 14 },
    { id: 'joiners', label: 'New Joiners', value: 6 },
    { id: 'birthdays', label: 'Upcoming Birthdays', value: 4 },
  ],
  attendanceTrend: [
    { label: 'Week 1', present: 210, absent: 12 },
    { label: 'Week 2', present: 205, absent: 15 },
    { label: 'Week 3', present: 198, absent: 12 },
    { label: 'Week 4', present: 208, absent: 10 },
  ],
  departments: [
    { name: 'Engineering', value: 86 },
    { name: 'HR', value: 22 },
    { name: 'Finance', value: 24 },
    { name: 'Product', value: 38 },
    { name: 'Sales', value: 52 },
  ],
  activities: [
    { id: '1', text: 'Leave policy updated for Sales', time: '2 hours ago' },
    { id: '2', text: 'Department headcount synced', time: 'Yesterday' },
    { id: '3', text: '3 leave requests approved', time: 'Yesterday' },
  ],
}

export const hrDashboardMock = {
  stats: [
    { id: 'total', label: 'Total Employees', value: 248 },
    { id: 'active', label: 'Active Employees', value: 220 },
    { id: 'leave', label: 'Employees on Leave', value: 10 },
    { id: 'present', label: "Today's Present", value: 198 },
    { id: 'absent', label: "Today's Absent", value: 12 },
    { id: 'pending', label: 'Pending Leave Requests', value: 14 },
    { id: 'joiners', label: 'New Joiners', value: 6 },
    { id: 'notice', label: 'On Notice Period', value: 3 },
  ],
  pendingActivities: [
    { id: '1', title: 'Approve leave — Rahul Mehta', meta: 'Sick Leave · 1 day' },
    { id: '2', title: 'Complete onboarding — Ishita Kapoor', meta: 'Documents pending' },
    { id: '3', title: 'Exit checklist — Arjun Das', meta: 'Last day 30 Nov' },
  ],
  analytics: [
    { label: 'Engineering', headcount: 86 },
    { label: 'Product', headcount: 38 },
    { label: 'Sales', headcount: 52 },
    { label: 'HR', headcount: 22 },
  ],
}

export const employeeDashboardMock = {
  stats: [
    { id: 'attendance', label: 'My Attendance This Month', value: '18/22' },
    { id: 'present', label: 'Present Days', value: 18 },
    { id: 'absent', label: 'Absent Days', value: 1 },
    { id: 'balance', label: 'Leave Balance', value: 12 },
    { id: 'pending', label: 'Pending Leave Requests', value: 1 },
    { id: 'holiday', label: 'Next Holiday', value: 'Diwali' },
  ],
  recentAttendance: [
    { date: '12 Nov 2026', checkIn: '09:05 AM', checkOut: '06:10 PM', status: 'Present' },
    { date: '11 Nov 2026', checkIn: '09:22 AM', checkOut: '06:05 PM', status: 'Late' },
    { date: '10 Nov 2026', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present' },
  ],
  leaveHistory: [
    { type: 'Casual Leave', dates: '05–06 Nov 2026', status: 'Approved' },
    { type: 'Sick Leave', dates: '20 Oct 2026', status: 'Approved' },
    { type: 'Earned Leave', dates: '15 Dec 2026', status: 'Pending' },
  ],
  holidays: [
    { name: 'Diwali', date: '08 Nov 2026' },
    { name: 'Christmas', date: '25 Dec 2026' },
    { name: 'Republic Day', date: '26 Jan 2027' },
  ],
  announcements: [
    { id: '1', title: 'Open enrollment for benefits ends Friday', date: '11 Nov 2026' },
    { id: '2', title: 'Office closed for Diwali week cleanup day', date: '09 Nov 2026' },
  ],
}
