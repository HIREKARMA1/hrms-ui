/**
 * Reads payroll state and actions from PayrollProvider context.
 * Used by payroll page sections and detail panel components.
 */

import { useContext } from 'react'

import { PayrollContext } from '../context/payrollContext'

export function usePayroll() {
  const context = useContext(PayrollContext)
  if (!context) {
    throw new Error('usePayroll must be used within PayrollProvider')
  }
  return context
}
