import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { MainLayout } from '@/components/layout/MainLayout'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
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
          <Route path="/employees/*" element={<DashboardPage />} />
          <Route path="/attendance" element={<DashboardPage />} />
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
