import { useMemo, type ReactNode } from 'react'

import { useOfficeCalendarProviderState } from '../hooks/useOfficeCalendarProviderState'
import { OfficeCalendarContext, type OfficeCalendarContextValue } from './officeCalendarContext'

export function OfficeCalendarProvider({ children }: { children: ReactNode }) {
  const state = useOfficeCalendarProviderState()
  const value = useMemo((): OfficeCalendarContextValue => state, [state])
  return <OfficeCalendarContext.Provider value={value}>{children}</OfficeCalendarContext.Provider>
}