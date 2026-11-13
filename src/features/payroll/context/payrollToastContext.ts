/**
 * Toast context for payroll-only notification messages.
 * Used by PayrollToastProvider and usePayrollToast.
 */

import { createContext } from 'react'

export type PayrollToastContextValue = {
  showToast: (text: string) => void
}

export const PayrollToastContext = createContext<PayrollToastContextValue | null>(
  null,
)
