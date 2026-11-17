import { useContext } from 'react'

import { OfficeCalendarConfirmContext } from '../context/officeCalendarConfirmContext'

export function useOfficeCalendarConfirm() {
  const context = useContext(OfficeCalendarConfirmContext)
  if (!context) {
    throw new Error('useOfficeCalendarConfirm must be used within OfficeCalendarConfirmProvider')
  }
  return context
}