/**
 * Wraps leave page with toast state and the toast UI host.
 * Used at the root of LeavePage alongside LeaveProvider.
 */

import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { LeaveToastContext } from '../context/leaveToastContext'
import { LeaveToast } from './LeaveToast'

type ToastMessage = { id: number; text: string }

export function LeaveToastProvider({ children }: { children: ReactNode }) {
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
    <LeaveToastContext.Provider value={value}>
      {children}
      <LeaveToast messages={messages} />
    </LeaveToastContext.Provider>
  )
}
