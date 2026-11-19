/**
 * Shares the Leave / Payroll viewer. Signed-in users get their Redux identity
 * and workspace role; the demo role switch only applies when nobody is signed in.
 */

import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import { useOptionalRbacSession } from '@/features/rbac/hooks/useRbacSession'

import type { UserRole } from '../constants/userRoles'
import {
  readStoredLeaveDemoRole,
  writeStoredLeaveDemoRole,
} from '../constants/leaveDemoViewers'
import { resolveLeaveViewer } from '../utils/resolveLeaveViewer'
import { LeaveViewerContext, type LeaveViewerContextValue } from './leaveViewerContextValue'

export function LeaveViewerProvider({ children }: { children: ReactNode }) {
  const rbac = useOptionalRbacSession()
  const { user } = useAuthenticatedUser()
  const [demoRole, setDemoRole] = useState<UserRole>(() => readStoredLeaveDemoRole() ?? 'HR_ADMIN')
  const workspaceRole = rbac?.roleCode ?? null
  const viewer = useMemo(
    () => resolveLeaveViewer({ user, workspaceRole, demoRole }),
    [user, workspaceRole, demoRole],
  )
  const isDemo = viewer.source === 'demo'

  const setViewerRole = useCallback(
    (next: UserRole) => {
      if (!isDemo) return
      setDemoRole(next)
      writeStoredLeaveDemoRole(next)
    },
    [isDemo],
  )

  const value = useMemo(
    (): LeaveViewerContextValue => ({
      viewer,
      role: viewer.role,
      setViewerRole,
    }),
    [viewer, setViewerRole],
  )

  return <LeaveViewerContext.Provider value={value}>{children}</LeaveViewerContext.Provider>
}
