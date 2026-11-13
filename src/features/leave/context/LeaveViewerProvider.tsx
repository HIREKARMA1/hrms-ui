/**
 * Provides shared demo leave role to Leave page and sidebar.
 */

import { useCallback, useMemo, useState, type ReactNode } from 'react'

import type { UserRole } from '../constants/userRoles'
import {
  LEAVE_DEMO_VIEWERS,
  readStoredLeaveDemoRole,
  writeStoredLeaveDemoRole,
} from '../constants/leaveDemoViewers'
import { LeaveViewerContext, type LeaveViewerContextValue } from './leaveViewerContextValue'

export function LeaveViewerProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(() => readStoredLeaveDemoRole() ?? 'HR_ADMIN')

  const setViewerRole = useCallback((next: UserRole) => {
    setRole(next)
    writeStoredLeaveDemoRole(next)
  }, [])

  const value = useMemo(
    (): LeaveViewerContextValue => ({
      viewer: LEAVE_DEMO_VIEWERS[role],
      role,
      setViewerRole,
    }),
    [role, setViewerRole],
  )

  return <LeaveViewerContext.Provider value={value}>{children}</LeaveViewerContext.Provider>
}
