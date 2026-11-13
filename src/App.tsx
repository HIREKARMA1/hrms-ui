import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { MainLayout } from '@/components/layout/MainLayout'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
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
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { EmployeeOverviewPage } from '@/features/employees/pages/EmployeeOverviewPage'
import { LeavePage } from '@/features/leave/pages/LeavePage'
import { PayrollPage } from '@/features/payroll/pages/PayrollPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
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
          <Route path="/leave/:section" element={<LeavePage />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/payroll/:section" element={<PayrollPage />} />

          <Route path="/recruitment" element={<DashboardPage />} />
          <Route path="/performance" element={<DashboardPage />} />
          <Route path="/leads" element={<DashboardPage />} />
          <Route path="/organization/*" element={<DashboardPage />} />
          <Route path="/documents" element={<DashboardPage />} />
          <Route path="/calendar" element={<DashboardPage />} />
          <Route path="/reports" element={<DashboardPage />} />
          <Route path="/settings" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
