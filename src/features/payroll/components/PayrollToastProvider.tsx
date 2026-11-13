/**
 * Wraps payroll pages with toast state and the toast UI host.
 * Used at the root of PayrollPage.
 */

import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { PayrollToastContext } from '../context/payrollToastContext'
import { PayrollToast } from './PayrollToast'

type ToastMessage = { id: number; text: string }

export function PayrollToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const showToast = useCallback((text: string) => {
    const id = Date.now()
    setMessages((current) => [...current, { id, text }])
    window.setTimeout(() => {
      setMessages((current) => current.filter((item) => item.id !== id))
    }, 3200)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <PayrollToastContext.Provider value={value}>
      {children}
      <PayrollToast messages={messages} />
    </PayrollToastContext.Provider>
  )
}
