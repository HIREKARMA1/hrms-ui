/**
 * Provides leave employee data and actions to the page subtree.
 * Wraps LeavePage content in pages/LeavePage.tsx.
 */

import { useMemo, type ReactNode } from 'react'

import { useLeaveProviderState } from '../hooks/useLeaveProviderState'
import { LeaveContext, type LeaveContextValue } from './leaveContext'

export function LeaveProvider({ children }: { children: ReactNode }) {
  const state = useLeaveProviderState()
  const value = useMemo((): LeaveContextValue => state, [state])
  return <LeaveContext.Provider value={value}>{children}</LeaveContext.Provider>
}
