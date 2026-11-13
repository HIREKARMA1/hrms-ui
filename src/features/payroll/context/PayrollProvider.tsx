/**
 * Provides payroll employee data and actions to the page subtree.
 * Wraps PayrollPage content in PayrollPage.tsx.
 */

import { useMemo, type ReactNode } from 'react'

import { usePayrollProviderState } from '../hooks/usePayrollProviderState'
import { PayrollContext, type PayrollContextValue } from './payrollContext'

export function PayrollProvider({ children }: { children: ReactNode }) {
  const state = usePayrollProviderState()
  const value = useMemo((): PayrollContextValue => state, [state])
  return <PayrollContext.Provider value={value}>{children}</PayrollContext.Provider>
}
