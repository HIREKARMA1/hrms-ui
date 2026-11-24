import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'

import { AttendanceCorrectionsPage } from '@/features/attendance/pages/AttendanceCorrectionsPage'
import { AttendanceOverviewPage } from '@/features/attendance/pages/AttendanceOverviewPage'
import { AttendanceReportsPage } from '@/features/attendance/pages/AttendanceReportsPage'
import { AttendanceSettingsPage } from '@/features/attendance/pages/AttendanceSettingsPage'
import { CheckInPage } from '@/features/attendance/pages/CheckInPage'
import { DailyAttendancePage } from '@/features/attendance/pages/DailyAttendancePage'
import { HolidayPage } from '@/features/attendance/pages/HolidayPage'
import { OvertimePage } from '@/features/attendance/pages/OvertimePage'
import { RegularizationPage } from '@/features/attendance/pages/RegularizationPage'
import { WeeklyOffPage } from '@/features/attendance/pages/WeeklyOffPage'
import { EmployeeDirectoryPage } from '@/features/employees/pages/EmployeeDirectoryPage'
import { EmployeeDocumentsPage } from '@/features/employees/pages/EmployeeDocumentsPage'
import { EmployeeOverviewPage } from '@/features/employees/pages/EmployeeOverviewPage'
import { EmployeeProfilePage } from '@/features/employees/pages/EmployeeProfilePage'
import { EmployeeRegistrationPage } from '@/features/employees/pages/EmployeeRegistrationPage'
import { OrganizationDepartmentsPage } from '@/features/organization/pages/OrganizationDepartmentsPage'
import { PermissionsPage } from '@/features/permissions/pages/PermissionsPage'
import { RolesPage } from '@/features/roles/pages/RolesPage'
import { UsersPage } from '@/features/users/pages/UsersPage'
import { RequireAccess } from '../components/RequireAccess'

import { createLeavePayrollRoutes } from './leavePayrollModuleRoutes'
import { createLeadsModuleRoutes } from './leadsModuleRoutes'
import { createOfficeCalendarModuleRoutes } from './calendarModuleRoutes'
import { createRecruitmentModuleRoutes } from './recruitmentModuleRoutes'
import { createSupportModuleRoutes } from './supportModuleRoutes'

type RolePrefix = 'superadmin' | 'hradmin' | 'manager'

/**
 * Reuses existing Employee + Attendance + Recruitment pages under each role prefix.
 * Does not duplicate feature modules.
 */
export function createOrgRoleModuleRoutes(prefix: RolePrefix): ReactElement[] {
  return [
    ...(prefix === 'superadmin'
      ? [
          <Route
            key={`${prefix}-roles`}
            path={`/${prefix}/roles`}
            element={
              <RequireAccess feature="module.roles" featureLabel="Role Management">
                <RolesPage />
              </RequireAccess>
            }
          />,
          <Route
            key={`${prefix}-permissions`}
            path={`/${prefix}/permissions`}
            element={
              <RequireAccess
                feature="module.permissions"
                featureLabel="Permission Management"
              >
                <PermissionsPage />
              </RequireAccess>
            }
          />,
        ]
      : []),
    <Route
      key={`${prefix}-users`}
      path={`/${prefix}/users`}
      element={
        <RequireAccess feature="module.users" featureLabel="User Management">
          <UsersPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-employees`}
      path={`/${prefix}/employees`}
      element={
        <RequireAccess feature="employee.overview" featureLabel="Employee Management">
          <EmployeeOverviewPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-employees-directory`}
      path={`/${prefix}/employees/directory`}
      element={
        <RequireAccess feature="employee.directory" featureLabel="Employee Directory">
          <EmployeeDirectoryPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-employees-add`}
      path={`/${prefix}/employees/add`}
      element={
        <RequireAccess
          feature="employee.registration.edit"
          featureLabel="Employee Registration"
        >
          <EmployeeRegistrationPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-onboarding`}
      path={`/${prefix}/onboarding`}
      element={
        <RequireAccess
          feature="employee.registration.edit"
          featureLabel="Employee Registration"
        >
          <EmployeeRegistrationPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-employees-profile`}
      path={`/${prefix}/employees/profile/:employeeId`}
      element={
        <RequireAccess
          feature="employee.registration.view"
          featureLabel="Employee Profile"
        >
          <EmployeeProfilePage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-departments`}
      path={`/${prefix}/departments`}
      element={
        <RequireAccess
          feature="employee.organization.view"
          featureLabel="Organization & Departments"
        >
          <OrganizationDepartmentsPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-designations`}
      path={`/${prefix}/designations`}
      element={
        <RequireAccess
          feature="employee.organization.view"
          featureLabel="Designations"
        >
          <OrganizationDepartmentsPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-documents`}
      path={`/${prefix}/documents`}
      element={
        <RequireAccess
          feature="employee.documents.view"
          featureLabel="Employee Documents"
        >
          <EmployeeDocumentsPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance`}
      path={`/${prefix}/attendance`}
      element={
        <RequireAccess feature="attendance.overview" featureLabel="Attendance Overview">
          <AttendanceOverviewPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-daily`}
      path={`/${prefix}/attendance/daily`}
      element={
        <RequireAccess feature="attendance.daily" featureLabel="Daily Attendance">
          <DailyAttendancePage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-check-in`}
      path={`/${prefix}/attendance/check-in`}
      element={
        <RequireAccess feature="attendance.checkIn" featureLabel="Check-in / Check-out">
          <CheckInPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-corrections`}
      path={`/${prefix}/attendance/corrections`}
      element={
        <RequireAccess
          feature="attendance.corrections"
          featureLabel="Attendance Corrections"
        >
          <AttendanceCorrectionsPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-regularization`}
      path={`/${prefix}/attendance/regularization`}
      element={
        <RequireAccess
          feature="attendance.regularization"
          featureLabel="Attendance Regularization"
        >
          <RegularizationPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-overtime`}
      path={`/${prefix}/attendance/overtime`}
      element={
        <RequireAccess feature="attendance.overtime" featureLabel="Overtime Management">
          <OvertimePage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-weekly-off`}
      path={`/${prefix}/attendance/weekly-off`}
      element={
        <RequireAccess feature="attendance.weeklyOff" featureLabel="Weekly Off Management">
          <WeeklyOffPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-holidays`}
      path={`/${prefix}/attendance/holidays`}
      element={
        <RequireAccess feature="attendance.holidays" featureLabel="Holiday Management">
          <HolidayPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-reports`}
      path={`/${prefix}/attendance/reports`}
      element={
        <RequireAccess feature="attendance.reports" featureLabel="Attendance Reports">
          <AttendanceReportsPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-settings`}
      path={`/${prefix}/attendance/settings`}
      element={
        <RequireAccess feature="attendance.settings" featureLabel="Attendance Settings">
          <AttendanceSettingsPage />
        </RequireAccess>
      }
    />,
    ...(prefix === 'superadmin' || prefix === 'manager'
      ? [createRecruitmentModuleRoutes(prefix)]
      : []),
    ...(prefix === 'manager' ? [createSupportModuleRoutes()] : []),
    ...createLeavePayrollRoutes(prefix),
    ...(prefix === 'hradmin' || prefix === 'superadmin' || prefix === 'manager'
      ? createLeadsModuleRoutes(prefix)
      : []),
    ...(prefix === 'hradmin' || prefix === 'superadmin' || prefix === 'manager'
      ? createOfficeCalendarModuleRoutes(prefix)
      : []),
  ]
}
