/**
 * Demo Employee | Manager | HR view switch until real authentication is wired.
 * This is the single place to connect real login and role resolution later.
 */

import { useCallback, useState } from 'react'

import { HR_DEMO_USER_ID, HR_DEMO_USER_NAME } from '../constants/leaveRules'
import type { LeaveViewer, LeaveViewerRole } from '../types/viewer'

const DEMO_EMPLOYEE: LeaveViewer = {
  role: 'Employee',
  employeeId: 'EMP-1006',
  displayName: 'Arjun Das',
}

const DEMO_MANAGER: LeaveViewer = {
  role: 'Manager',
  employeeId: 'EMP-1001',
  displayName: 'Ananya Sharma',
}

const DEMO_HR: LeaveViewer = {
  role: 'HR',
  employeeId: HR_DEMO_USER_ID,
  displayName: HR_DEMO_USER_NAME,
}

const BY_ROLE: Record<LeaveViewerRole, LeaveViewer> = {
  Employee: DEMO_EMPLOYEE,
  Manager: DEMO_MANAGER,
  HR: DEMO_HR,
}

export function useLeaveViewer() {
  const [role, setRole] = useState<LeaveViewerRole>('HR')
  const viewer = BY_ROLE[role]

  const setViewerRole = useCallback((next: LeaveViewerRole) => {
    setRole(next)
  }, [])

  return { viewer, role, setViewerRole }
}
