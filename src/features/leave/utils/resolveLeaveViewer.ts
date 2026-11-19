import type { AuthUser } from '@/features/auth/types/auth.types'
import { getUserDisplayName } from '@/features/auth/utils/authUser'

import { LEAVE_DEMO_VIEWERS } from '../constants/leaveDemoViewers'
import type { UserRole } from '../constants/userRoles'
import type { LeaveViewer } from '../types/viewer'

/**
 * Leave / Payroll viewer.
 *
 * - Signed in: identity is the Redux auth user, never a demo persona. The
 *   workspace role only decides which UI is shown (least privilege if there is
 *   none). No employee record is assumed because /auth/me does not return one.
 * - Not signed in: the selected demo persona.
 */
export function resolveLeaveViewer(input: {
  user: AuthUser | null
  workspaceRole: UserRole | null
  demoRole: UserRole
}): LeaveViewer {
  const { user, workspaceRole, demoRole } = input
  if (user) {
    return {
      role: workspaceRole ?? 'EMPLOYEE',
      employeeId: null,
      actorId: user.id,
      displayName: getUserDisplayName(user),
      email: user.email || null,
      source: 'authenticated',
    }
  }
  return LEAVE_DEMO_VIEWERS[demoRole]
}
