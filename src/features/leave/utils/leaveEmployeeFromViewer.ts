/**
 * Minimal LeaveEmployee for self-service when the directory/request embeds
 * have not yet listed the authenticated linked employee.
 */

import type { LeaveEmployee } from '../types/employee'
import type { LinkedLeaveViewer } from '../types/viewer'

export function leaveEmployeeFromViewer(viewer: LinkedLeaveViewer): LeaveEmployee {
  return {
    id: viewer.employeeId,
    name: viewer.displayName.trim() || viewer.email?.trim() || viewer.employeeId,
    department: '',
    gender: 'Other',
    joiningDate: '',
    managerId: null,
    employmentStatus: 'ACTIVE',
  }
}

/** Prefer a directory/embed match; fall back to the auth-linked viewer identity. */
export function resolveMyLeaveEmployee(
  employees: LeaveEmployee[] | undefined,
  viewer: LinkedLeaveViewer,
): LeaveEmployee {
  return employees?.find((item) => item.id === viewer.employeeId) ?? leaveEmployeeFromViewer(viewer)
}
