import { useContext } from 'react'

import { OfficeCalendarToastContext } from '../context/officeCalendarToastContext'

export function useOfficeCalendarToast() {
  const context = useContext(OfficeCalendarToastContext)
  if (!context) {
    throw new Error('useOfficeCalendarToast must be used within OfficeCalendarToastProvider')
  }
  return context
}