import type { LeaveTypeOption } from '../api/leaveMappers'
import type { ApprovalWorkflowStepView } from '../types/api/leaveApprovalWorkflows.types'
import type { LeaveEmployee } from '../types/employee'

import { assigneeTypeLabel } from './buildApprovalWorkflowApiBody'

export function resolveLeaveTypeDisplayLabel(
  leaveTypeIds: string[] | undefined,
  leaveTypes: LeaveTypeOption[],
  codeFallback?: string,
): string | null {
  if (!leaveTypeIds?.length) {
    if (!codeFallback || codeFallback === '—' || codeFallback === 'MULTI') return null
    const byCode = leaveTypes.find((type) => type.code.toUpperCase() === codeFallback.toUpperCase())
    return byCode ? `${byCode.name} (${byCode.code})` : codeFallback
  }
  const matches = leaveTypeIds
    .map((id) => leaveTypes.find((type) => type.id === id))
    .filter((type): type is LeaveTypeOption => Boolean(type))
  if (matches.length === 0) {
    return codeFallback ? `${codeFallback}` : null
  }
  if (matches.length === 1) {
    return `${matches[0].name} (${matches[0].code})`
  }
  return matches.map((type) => `${type.code}`).join(', ')
}

function namesForEmployeeIds(ids: string[] | undefined, employees: LeaveEmployee[]): string {
  if (!ids?.length) return 'No approvers listed'
  return ids
    .map((id) => employees.find((employee) => employee.id === id)?.name ?? `Employee ${id.slice(-6)}`)
    .join(', ')
}

export function describeWorkflowStepLabel(
  step: ApprovalWorkflowStepView,
  employees: LeaveEmployee[] = [],
): string {
  const level = step.order
  const assigneeType = step.assigneeType

  if (assigneeType === 'EXPLICIT_EMPLOYEES') {
    const names = namesForEmployeeIds(step.employeeIds, employees)
    return `Level ${level}: ${names}`
  }

  if (assigneeType === 'DEPARTMENT') {
    const dept = step.departmentId?.trim()
    return dept
      ? `Level ${level}: ${assigneeTypeLabel('DEPARTMENT')} · ${dept.slice(0, 8)}…`
      : `Level ${level}: ${assigneeTypeLabel('DEPARTMENT')}`
  }

  if (assigneeType === 'ANY_PROCESSOR') {
    return `Level ${level}: ${assigneeTypeLabel('ANY_PROCESSOR')}`
  }

  if (step.label.trim()) return step.label.trim()
  return `Level ${level}`
}

export function enrichWorkflowStepViews(
  steps: ApprovalWorkflowStepView[],
  employees: LeaveEmployee[] = [],
): ApprovalWorkflowStepView[] {
  return steps.map((step) => ({
    ...step,
    label: describeWorkflowStepLabel(step, employees),
  }))
}

export function formatStepsSummaryFromViews(steps: ApprovalWorkflowStepView[]): string {
  if (steps.length === 0) return '—'
  return steps.map((step) => {
    const short = step.label.replace(/^Level \d+: /, '')
    return `L${step.order}: ${short}`
  }).join(' → ')
}