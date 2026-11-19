/**
 * Demo personas for the Leave / Payroll UI when nobody is signed in.
 * Never used for an authenticated user (see `resolveLeaveViewer`).
 */

import type { UserRole } from './userRoles'
import { HR_DEMO_USER_ID, HR_DEMO_USER_NAME } from './leaveRules'
import type { LinkedLeaveViewer } from '../types/viewer'

function demoViewer(role: UserRole, employeeId: string, displayName: string): LinkedLeaveViewer {
  return { role, employeeId, actorId: employeeId, displayName, email: null, source: 'demo' }
}

export const LEAVE_DEMO_VIEWERS: Record<UserRole, LinkedLeaveViewer> = {
  EMPLOYEE: demoViewer('EMPLOYEE', 'EMP-1006', 'Arjun Das'),
  MANAGER: demoViewer('MANAGER', 'EMP-1001', 'Ananya Sharma'),
  HR_ADMIN: demoViewer('HR_ADMIN', HR_DEMO_USER_ID, HR_DEMO_USER_NAME),
  SUPER_ADMIN: demoViewer('SUPER_ADMIN', HR_DEMO_USER_ID, 'Rohith Goud (Super Admin)'),
}

const STORAGE_KEY = 'leave-demo-role'

export function readStoredLeaveDemoRole(): UserRole | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === 'EMPLOYEE' || raw === 'MANAGER' || raw === 'HR_ADMIN' || raw === 'SUPER_ADMIN') return raw
  return null
}

export function writeStoredLeaveDemoRole(role: UserRole) {
  window.localStorage.setItem(STORAGE_KEY, role)
}
