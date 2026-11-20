import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage'
import { AttendanceCorrectionsPage } from '@/features/attendance/pages/AttendanceCorrectionsPage'
import { AttendanceOverviewPage } from '@/features/attendance/pages/AttendanceOverviewPage'
import { AttendanceReportsPage } from '@/features/attendance/pages/AttendanceReportsPage'
import { AttendanceSettingsPage } from '@/features/attendance/pages/AttendanceSettingsPage'
import { CheckInPage } from '@/features/attendance/pages/CheckInPage'
import { DailyAttendancePage } from '@/features/attendance/pages/DailyAttendancePage'
import { HolidayPage } from '@/features/attendance/pages/HolidayPage'
import { MyAttendancePage } from '@/features/attendance/pages/MyAttendancePage'
import { OvertimePage } from '@/features/attendance/pages/OvertimePage'
import { RegularizationPage } from '@/features/attendance/pages/RegularizationPage'
import { WeeklyOffPage } from '@/features/attendance/pages/WeeklyOffPage'
import { RequireAuth } from '@/features/auth/components/RequireAuth'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { ContactAdministratorPage } from '@/features/support/pages/ContactAdministratorPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { EmployeeDashboardPage } from '@/features/employee/pages/EmployeeDashboardPage'
import { MyEmployeeDocumentsPage } from '@/features/employees/pages/EmployeeDocumentsPage'
import { EmployeeOverviewPage } from '@/features/employees/pages/EmployeeOverviewPage'
import { MyEmployeeProfilePage } from '@/features/employees/pages/EmployeeProfilePage'
import { LeavePage } from '@/features/leave/pages/LeavePage'
import { PayrollPage } from '@/features/payroll/pages/PayrollPage'
import { RequireAccess } from '@/features/rbac/components/RequireAccess'
import { RoleLayout } from '@/features/rbac/components/RoleLayout'
import { RoleModulePage } from '@/features/rbac/components/RoleModulePage'
import { UserLandingRedirect } from '@/features/rbac/components/UserLandingRedirect'
import { WorkspaceModuleRedirect } from '@/features/rbac/components/WorkspaceModuleRedirect'
import { createEmployeeCalendarModuleRoutes } from '@/features/rbac/routes/calendarModuleRoutes'
import { createEmployeeLeadsModuleRoutes } from '@/features/rbac/routes/leadsModuleRoutes'
import { createEmployeeLeavePayrollRoutes } from '@/features/rbac/routes/leavePayrollModuleRoutes'
import { createOrgRoleModuleRoutes } from '@/features/rbac/routes/roleModuleRoutes'
import { SuperAdminDashboardPage } from '@/features/superadmin/pages/SuperAdminDashboardPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/contact-administrator"
          element={<ContactAdministratorPage />}
        />

        {/* Every route below requires an authenticated session. */}
        <Route element={<RequireAuth />}>
        {/* Legacy shared routes: MainLayout in the user's own role workspace. */}
        <Route element={<RoleLayout />}>
          <Route path="/dashboard" element={<UserLandingRedirect />} />
          <Route
            path="/employees"
            element={
              <RequireAccess feature="employee.overview" featureLabel="Employee Management">
                <EmployeeOverviewPage />
              </RequireAccess>
            }
          />
          <Route
            path="/employees/*"
            element={<Navigate to="/employees" replace />}
          />

          <Route
            path="/attendance"
            element={
              <RequireAccess feature="attendance.overview" featureLabel="Attendance Overview">
                <AttendanceOverviewPage />
              </RequireAccess>
            }
          />
          <Route
            path="/attendance/daily"
            element={
              <RequireAccess feature="attendance.daily" featureLabel="Daily Attendance">
                <DailyAttendancePage />
              </RequireAccess>
            }
          />
          <Route
            path="/attendance/check-in"
            element={
              <RequireAccess feature="attendance.checkIn" featureLabel="Check-in / Check-out">
                <CheckInPage />
              </RequireAccess>
            }
          />
          <Route
            path="/attendance/corrections"
            element={
              <RequireAccess feature="attendance.corrections" featureLabel="Attendance Corrections">
                <AttendanceCorrectionsPage />
              </RequireAccess>
            }
          />
          <Route
            path="/attendance/regularization"
            element={
              <RequireAccess
                feature="attendance.regularization"
                featureLabel="Attendance Regularization"
              >
                <RegularizationPage />
              </RequireAccess>
            }
          />
          <Route
            path="/attendance/overtime"
            element={
              <RequireAccess feature="attendance.overtime" featureLabel="Overtime Management">
                <OvertimePage />
              </RequireAccess>
            }
          />
          <Route
            path="/attendance/weekly-off"
            element={
              <RequireAccess feature="attendance.weeklyOff" featureLabel="Weekly Off Management">
                <WeeklyOffPage />
              </RequireAccess>
            }
          />
          <Route
            path="/attendance/holidays"
            element={
              <RequireAccess feature="attendance.holidays" featureLabel="Holiday Management">
                <HolidayPage />
              </RequireAccess>
            }
          />
          <Route
            path="/attendance/reports"
            element={
              <RequireAccess feature="attendance.reports" featureLabel="Attendance Reports">
                <AttendanceReportsPage />
              </RequireAccess>
            }
          />
          <Route
            path="/attendance/settings"
            element={
              <RequireAccess feature="attendance.settings" featureLabel="Attendance Settings">
                <AttendanceSettingsPage />
              </RequireAccess>
            }
          />

          <Route path="/leave" element={<LeavePage />} />
          <Route path="/leave/:section" element={<LeavePage />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/payroll/:section" element={<PayrollPage />} />

          {[
            '/recruitment',
            '/performance',
            '/organization/*',
            '/documents',
            '/calendar',
            '/reports',
            '/settings',
          ].map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <RequireAccess feature="dashboard.hr" featureLabel="HR Dashboard">
                  <DashboardPage />
                </RequireAccess>
              }
            />
          ))}
          <Route path="/leads" element={<WorkspaceModuleRedirect section="leads" />} />
          <Route path="/leads/*" element={<WorkspaceModuleRedirect section="leads" />} />
        </Route>

        <Route element={<RoleLayout roleCode="SUPER_ADMIN" />}>
          <Route
            path="/superadmin/dashboard"
            element={<SuperAdminDashboardPage />}
          />
          <Route
            path="/superadmin"
            element={<Navigate to="/superadmin/dashboard" replace />}
          />
          {createOrgRoleModuleRoutes('superadmin')}
          <Route path="/superadmin/*" element={<RoleModulePage />} />
        </Route>

        <Route element={<RoleLayout roleCode="HR_ADMIN" />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          {createOrgRoleModuleRoutes('admin')}
          <Route path="/admin/*" element={<RoleModulePage />} />
        </Route>

        <Route element={<RoleLayout roleCode="MANAGER" />}>
          <Route
            path="/hr/dashboard"
            element={
              <RequireAccess
                feature="dashboard.hr"
                featureLabel="HR Dashboard"
              >
                <DashboardPage />
              </RequireAccess>
            }
          />
          <Route path="/hr" element={<Navigate to="/hr/dashboard" replace />} />
          {createOrgRoleModuleRoutes('hr')}
          <Route path="/hr/*" element={<RoleModulePage />} />
        </Route>

        <Route element={<RoleLayout roleCode="EMPLOYEE" />}>
          <Route
            path="/employee/dashboard"
            element={<EmployeeDashboardPage />}
          />
          <Route
            path="/employee"
            element={<Navigate to="/employee/dashboard" replace />}
          />
          <Route
            path="/employee/attendance"
            element={
              <RequireAccess
                feature="attendance.reports"
                featureLabel="My Attendance"
              >
                <MyAttendancePage />
              </RequireAccess>
            }
          />
          <Route
            path="/employee/check-in"
            element={
              <RequireAccess
                feature="attendance.checkIn"
                featureLabel="Check-in / Check-out"
              >
                <CheckInPage />
              </RequireAccess>
            }
          />
          <Route
            path="/employee/attendance/corrections"
            element={
              <RequireAccess
                feature="attendance.corrections"
                featureLabel="Attendance Corrections"
              >
                <AttendanceCorrectionsPage />
              </RequireAccess>
            }
          />
          <Route
            path="/employee/attendance/regularization"
            element={
              <RequireAccess
                feature="attendance.regularization"
                featureLabel="Attendance Regularization"
              >
                <RegularizationPage />
              </RequireAccess>
            }
          />
          <Route
            path="/employee/holidays"
            element={
              <RequireAccess
                feature="attendance.holidays"
                featureLabel="Company Holidays"
              >
                <HolidayPage />
              </RequireAccess>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <RequireAccess
                feature="employee.profile.own"
                featureLabel="My Profile"
              >
                <MyEmployeeProfilePage />
              </RequireAccess>
            }
          />
          <Route
            path="/employee/documents"
            element={
              <RequireAccess
                feature="employee.documents.own"
                featureLabel="My Documents"
              >
                <MyEmployeeDocumentsPage />
              </RequireAccess>
            }
          />
          {createEmployeeLeavePayrollRoutes()}
          {createEmployeeLeadsModuleRoutes()}
          {createEmployeeCalendarModuleRoutes()}
          <Route path="/employee/*" element={<RoleModulePage />} />
        </Route>
        </Route>
        {/* End of authenticated routes. */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
