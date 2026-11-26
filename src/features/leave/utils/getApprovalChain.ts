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
    if (!approver || approver.id === applicant.id) {
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
    steps.push(fallbackApprovalStep(employeesById))
  }
  return steps
}

function fallbackApprovalStep(employeesById: Record<string, LeaveEmployee>): ResolvedApprovalStep {
  const hr = employeesById[HR_DEMO_USER_ID]
  return {
    level: 'HR',
    approverId: hr?.id ?? '',
    approverName: hr?.name ?? 'HR approval',
    label: 'HR',
  }
}

function resolveApprover(
  level: ApprovalLevel,
  applicant: LeaveEmployee,
  employeesById: Record<string, LeaveEmployee>,
): LeaveEmployee | undefined {
  if (level === 'Manager' && applicant.managerId) {
    const manager = employeesById[applicant.managerId]
    if (manager) return manager
  }
  if (level === 'Manager') return undefined
  return employeesById[HR_DEMO_USER_ID]
}
