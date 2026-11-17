import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { OfficeCalendarToast } from '../components/OfficeCalendarToast'
import { OfficeCalendarToastContext } from './officeCalendarToastContext'

type ToastMessage = { id: number; text: string }

export function OfficeCalendarToastProvider({ children }: { children: ReactNode }) {
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
    <OfficeCalendarToastContext.Provider value={value}>
      {children}
      <OfficeCalendarToast messages={messages} />
    </OfficeCalendarToastContext.Provider>
  )
}