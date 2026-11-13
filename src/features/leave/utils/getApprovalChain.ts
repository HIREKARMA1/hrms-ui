/**
 * Resolves multi-level approval chain, skipping when approver is the applicant.
 * Used in apply preview and approval routing in requestService.
 */

import type { ApprovalLevel } from '../types/leaveRequest'
import type { LeaveEmployee } from '../types/employee'
import type { LeaveTypePolicy } from '../types/leaveSettings'
import { HR_DEMO_USER_ID } from '../constants/leaveRules'

export type ResolvedApprovalStep = {
  level: ApprovalLevel
  approverId: string
  approverName: string
  label: string
}

export function getApprovalChain(
  policy: LeaveTypePolicy,
  applicant: LeaveEmployee,
  employeesById: Record<string, LeaveEmployee>,
  requestDays: number,
): ResolvedApprovalStep[] {
  const levels: ApprovalLevel[] = []
  const managerOnly =
    policy.managerOnlyUpToDays !== null &&
    requestDays <= policy.managerOnlyUpToDays &&
    policy.approvalChain !== 'hr'

  if (managerOnly || policy.approvalChain === 'manager') {
    levels.push('Manager')
  } else if (policy.approvalChain === 'manager_hr') {
    levels.push('Manager', 'HR')
  } else {
    levels.push('HR')
  }

  const steps: ResolvedApprovalStep[] = []
  for (const level of levels) {
    const approver = resolveApprover(level, applicant, employeesById)
    if (approver.id === applicant.id) {
      continue
    }
    steps.push({
      level,
      approverId: approver.id,
      approverName: approver.name,
      label: level === 'Manager' ? 'Manager' : 'HR',
    })
  }
  if (steps.length === 0) {
    const hr = employeesById[HR_DEMO_USER_ID]
    steps.push({
      level: 'HR',
      approverId: HR_DEMO_USER_ID,
      approverName: hr?.name ?? 'HR',
      label: 'HR',
    })
  }
  return steps
}

function resolveApprover(
  level: ApprovalLevel,
  applicant: LeaveEmployee,
  employeesById: Record<string, LeaveEmployee>,
): LeaveEmployee {
  if (level === 'Manager' && applicant.managerId) {
    return employeesById[applicant.managerId] ?? employeesById[HR_DEMO_USER_ID]
  }
  return employeesById[HR_DEMO_USER_ID]
}
