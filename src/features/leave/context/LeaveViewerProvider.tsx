/**
 * Provides shared demo leave role to Leave page and sidebar.
 */

import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { useOptionalRbacSession } from '@/features/rbac/hooks/useRbacSession'

import type { UserRole } from '../constants/userRoles'
import {
  LEAVE_DEMO_VIEWERS,
  readStoredLeaveDemoRole,
  writeStoredLeaveDemoRole,
} from '../constants/leaveDemoViewers'
import { LeaveViewerContext, type LeaveViewerContextValue } from './leaveViewerContextValue'

export function LeaveViewerProvider({ children }: { children: ReactNode }) {
  const rbac = useOptionalRbacSession()
  const [demoRole, setDemoRole] = useState<UserRole>(() => readStoredLeaveDemoRole() ?? 'HR_ADMIN')
  const role: UserRole = rbac ? rbac.roleCode : demoRole

  const setViewerRole = useCallback(
    (next: UserRole) => {
      if (rbac) return
      setDemoRole(next)
      writeStoredLeaveDemoRole(next)
    },
    [rbac],
  )

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
