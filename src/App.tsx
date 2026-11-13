import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { MainLayout } from '@/components/layout/MainLayout'
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
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { EmployeeDashboardPage } from '@/features/employee/pages/EmployeeDashboardPage'
import { EmployeeOverviewPage } from '@/features/employees/pages/EmployeeOverviewPage'
import { LeavePage } from '@/features/leave/pages/LeavePage'
import { PayrollPage } from '@/features/payroll/pages/PayrollPage'
import { RequireAccess } from '@/features/rbac/components/RequireAccess'
import { RoleLayout } from '@/features/rbac/components/RoleLayout'
import { RoleModulePage } from '@/features/rbac/components/RoleModulePage'
import { createOrgRoleModuleRoutes } from '@/features/rbac/routes/roleModuleRoutes'
import { SuperAdminDashboardPage } from '@/features/superadmin/pages/SuperAdminDashboardPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={<Navigate to="/hr/dashboard" replace />}
          />
          <Route path="/employees" element={<EmployeeOverviewPage />} />
          <Route
            path="/employees/*"
            element={<Navigate to="/employees" replace />}
          />

          <Route path="/attendance" element={<AttendanceOverviewPage />} />
          <Route path="/attendance/daily" element={<DailyAttendancePage />} />
          <Route path="/attendance/check-in" element={<CheckInPage />} />
          <Route
            path="/attendance/corrections"
            element={<AttendanceCorrectionsPage />}
          />
          <Route
            path="/attendance/regularization"
            element={<RegularizationPage />}
          />
          <Route path="/attendance/overtime" element={<OvertimePage />} />
          <Route path="/attendance/weekly-off" element={<WeeklyOffPage />} />
          <Route path="/attendance/holidays" element={<HolidayPage />} />
          <Route path="/attendance/reports" element={<AttendanceReportsPage />} />
          <Route
            path="/attendance/settings"
            element={<AttendanceSettingsPage />}
          />

          <Route path="/leave" element={<LeavePage />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/recruitment" element={<DashboardPage />} />
          <Route path="/performance" element={<DashboardPage />} />
          <Route path="/leads" element={<DashboardPage />} />
          <Route path="/organization/*" element={<DashboardPage />} />
          <Route path="/documents" element={<DashboardPage />} />
          <Route path="/calendar" element={<DashboardPage />} />
          <Route path="/reports" element={<DashboardPage />} />
          <Route path="/settings" element={<DashboardPage />} />
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
          <Route path="/employee/*" element={<RoleModulePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
