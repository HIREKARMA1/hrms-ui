/**
 * Demo viewer role and resolved identity for leave UI without real auth.
 * Consumed by useLeaveViewer across LeavePage tabs.
 */

import type { UserRole } from '../constants/userRoles'

export type LeaveViewerRole = UserRole

export type LeaveViewer = {
  role: LeaveViewerRole
  employeeId: string
  displayName: string
}
