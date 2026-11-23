import { useContext } from 'react'

import { OfficeCalendarContext } from '../context/officeCalendarContext'

export function useOfficeCalendar() {
  const value = useContext(OfficeCalendarContext)
  if (!value) {
    throw new Error('useOfficeCalendar must be used within OfficeCalendarProvider')
  }
  return value
}