/**
 * Who is using the Leave / Payroll UI.
 * Signed in: identity comes from the Redux auth user; the workspace sets the role.
 * Not signed in (demo routes only): one of the LEAVE_DEMO_VIEWERS personas.
 */

import type { UserRole } from '../constants/userRoles'

export type LeaveViewerRole = UserRole

export type LeaveViewer = {
  role: LeaveViewerRole
  /**
   * Employee record used for self-service lookups (my requests, balances,
   * team, payslip). Null for signed-in users: GET /auth/me does not return
   * the linked employee, so none is assumed.
   */
  employeeId: string | null
  /** Recorded as the actor on approvals / cancellations: the auth user id, or the demo employee id. */
  actorId: string
  displayName: string
  email: string | null
  source: 'authenticated' | 'demo'
}

/** A viewer whose employee record is known (demo personas only, today). */
export type LinkedLeaveViewer = LeaveViewer & { employeeId: string }

export function isLinkedLeaveViewer(viewer: LeaveViewer): viewer is LinkedLeaveViewer {
  return viewer.employeeId !== null
}
