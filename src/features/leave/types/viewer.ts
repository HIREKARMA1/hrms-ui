/**
 * Demo viewer role and resolved identity for leave UI without real auth.
 * Consumed by useLeaveViewer across LeavePage tabs.
 */

export type LeaveViewerRole = 'Employee' | 'Manager' | 'HR'

export type LeaveViewer = {
  role: LeaveViewerRole
  employeeId: string
  displayName: string
}
