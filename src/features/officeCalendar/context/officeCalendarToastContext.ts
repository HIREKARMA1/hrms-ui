import { createContext } from 'react'

export type OfficeCalendarToastContextValue = {
  showToast: (text: string) => void
}

export const OfficeCalendarToastContext = createContext<OfficeCalendarToastContextValue | null>(null)