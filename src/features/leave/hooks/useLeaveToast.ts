/**
 * Shows short-lived toast messages after leave UI actions.
 * Used by tabs, sheets, and approval row actions.
 */

import { useContext } from 'react'

import { LeaveToastContext } from '../context/leaveToastContext'

export function useLeaveToast() {
  const context = useContext(LeaveToastContext)
  if (!context) {
    throw new Error('useLeaveToast must be used within LeaveToastProvider')
  }
  return context
}
