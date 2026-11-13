/**
 * Consumes LeaveProvider context for tab components and sheets.
 * Throws when used outside LeavePage provider tree.
 */

import { useContext } from 'react'

import { LeaveContext, type LeaveContextValue } from '../context/leaveContext'

export function useLeave(): LeaveContextValue {
  const value = useContext(LeaveContext)
  if (!value) {
    throw new Error('useLeave must be used within LeaveProvider')
  }
  return value
}
