/**
 * Demo viewers for each role until real authentication is wired.
 */

import type { UserRole } from './userRoles'
import { HR_DEMO_USER_ID, HR_DEMO_USER_NAME } from './leaveRules'
import type { LeaveViewer } from '../types/viewer'

export const LEAVE_DEMO_VIEWERS: Record<UserRole, LeaveViewer> = {
  EMPLOYEE: {
    role: 'EMPLOYEE',
    employeeId: 'EMP-1006',
    displayName: 'Arjun Das',
  },
  MANAGER: {
    role: 'MANAGER',
    employeeId: 'EMP-1001',
    displayName: 'Ananya Sharma',
  },
  HR_ADMIN: {
    role: 'HR_ADMIN',
    employeeId: HR_DEMO_USER_ID,
    displayName: HR_DEMO_USER_NAME,
  },
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    employeeId: HR_DEMO_USER_ID,
    displayName: 'Rohith Goud (Super Admin)',
  },
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
