import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'

import { LeavePage } from '@/features/leave/pages/LeavePage'
import { PayrollPage } from '@/features/payroll/pages/PayrollPage'

type RolePrefix = 'superadmin' | 'hradmin' | 'manager'

/**
 * Leave + payroll pages under each org role prefix (mirrors attendance/recruitment wiring).
 */
export function createLeavePayrollRoutes(prefix: RolePrefix): ReactElement[] {
  return [
    <Route key={`${prefix}-leave`} path={`/${prefix}/leave`} element={<LeavePage />} />,
    <Route
      key={`${prefix}-leave-section`}
      path={`/${prefix}/leave/:section`}
      element={<LeavePage />}
    />,
    <Route key={`${prefix}-payroll`} path={`/${prefix}/payroll`} element={<PayrollPage />} />,
    <Route
      key={`${prefix}-payroll-section`}
      path={`/${prefix}/payroll/:section`}
      element={<PayrollPage />}
    />,
  ]
}

export function createEmployeeLeavePayrollRoutes(): ReactElement[] {
  return [
    <Route key="employee-leave" path="/employee/leave" element={<LeavePage />} />,
    <Route key="employee-leave-section" path="/employee/leave/:section" element={<LeavePage />} />,
    <Route key="employee-payslips" path="/employee/payslips" element={<PayrollPage />} />,
    <Route
      key="employee-payslips-section"
      path="/employee/payslips/:section"
      element={<PayrollPage />}
    />,
  ]
}
