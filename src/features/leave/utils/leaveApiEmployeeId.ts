import type { AuthUser } from '@/features/auth/types/auth.types'

import type { LeaveSnapshot } from '../services/leaveService'

const DEMO_EMPLOYEE_PREFIX = /^EMP-/i

export function isDemoLeaveEmployeeId(id: string): boolean {
  return DEMO_EMPLOYEE_PREFIX.test(id.trim())
}

/** Backend CUID (or any non-demo id) for leave APIs scoped to an employee. */
export function resolveLeaveApiEmployeeId(
  snapshot: LeaveSnapshot | null | undefined,
  user: AuthUser | null | undefined,
  contextEmployeeId?: string | null,
): string | null {
  const context = contextEmployeeId?.trim() ?? ''

  if (context && !isDemoLeaveEmployeeId(context)) {
    return context
  }

  const fromUser = user?.employeeId?.trim()
  if (fromUser && !isDemoLeaveEmployeeId(fromUser)) {
    if (!context || isDemoLeaveEmployeeId(context)) {
      return fromUser
    }
  }

  if (snapshot?.requestsSource !== 'api') {
    return null
  }

  if (context && isDemoLeaveEmployeeId(context)) {
    const employee = snapshot.employees.find((item) => item.id === context)
    const targetName = employee?.name?.trim().toLowerCase()
    if (targetName) {
      for (const req of snapshot.requests) {
        const apiId = req.employeeId?.trim()
        if (!apiId || isDemoLeaveEmployeeId(apiId)) continue
        const reqName = req.employeeName?.trim().toLowerCase()
        if (reqName === targetName) return apiId
      }
    }
  }

  const unique = new Set<string>()
  for (const req of snapshot.requests) {
    const id = req.employeeId?.trim()
    if (id && !isDemoLeaveEmployeeId(id)) {
      unique.add(id)
    }
  }
  if (unique.size === 1) {
    return [...unique][0] ?? null
  }

  for (const req of snapshot.requests) {
    const id = req.employeeId?.trim()
    if (id && !isDemoLeaveEmployeeId(id)) {
      return id
    }
  }

  return null
}