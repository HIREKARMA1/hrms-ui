/**
 * Cross-tab navigation intents for HR Admin (shared state, not URL).
 */

import { useContext } from 'react'

import { LeavePageNavContext } from '../context/LeavePageNavContext'

export function useLeavePageNav() {
  const ctx = useContext(LeavePageNavContext)
  if (!ctx) throw new Error('useLeavePageNav must be used within LeavePageNavProvider')
  return ctx
}
