/**
 * Shows short-lived toast messages during payroll UI actions.
 * Used by PageHeader, detail panel, and RunPayrollDialog.
 */

import { useContext } from 'react'

import { PayrollToastContext } from '../context/payrollToastContext'

export function usePayrollToast() {
  const context = useContext(PayrollToastContext)
  if (!context) {
    throw new Error('usePayrollToast must be used within PayrollToastProvider')
  }
  return context
}
