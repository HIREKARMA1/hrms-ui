/**
 * Demo role switch until real authentication is wired.
 * Consumes LeaveViewerProvider (MainLayout).
 */

import { useContext } from 'react'

import { LeaveViewerContext } from '../context/leaveViewerContextValue'

export function useLeaveViewer() {
  const ctx = useContext(LeaveViewerContext)
  if (!ctx) {
    throw new Error('useLeaveViewer must be used within LeaveViewerProvider')
  }
  return ctx
}
