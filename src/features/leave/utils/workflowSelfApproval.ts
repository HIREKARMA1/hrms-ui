import type { LeaveTypeOption } from '../api/leaveMappers'
import {
  WORKFLOW_SELF_APPROVAL_EXPLICIT_LEVEL_HINT,
  WORKFLOW_SELF_APPROVAL_FORM_HINT,
  workflowSelfApprovalRequestMessage,
} from '../constants/workflowSelfApprovalMessages'
import type {
  ApprovalWorkflowDetailView,
  ApprovalWorkflowStepView,
  ApprovalWorkflowsListData,
} from '../types/api/leaveApprovalWorkflows.types'
import type { LeaveEmployee } from '../types/employee'
import type { LeaveRequest } from '../types/leaveRequest'
import type { ApprovalWorkflowForm } from './buildApprovalWorkflowApiBody'
import type { WorkflowApprovalNotice } from './leaveWorkflowApproval'
import { mapApiApprovalWorkflowItemToDetail } from './mapApiApprovalWorkflows'
import { canUserActOnLeaveRequest } from './leaveWorkflowApproval'

/** `Pending: level 2` → 2 */
export function parsePendingWorkflowLevel(currentStepLabel: string): number | null {
  const match = currentStepLabel.match(/level\s+(\d+)/i)
  if (!match) return null
  const level = Number.parseInt(match[1], 10)
  return Number.isFinite(level) && level > 0 ? level : null
}

export function workflowStepAtLevel(
  workflow: ApprovalWorkflowDetailView,
  levelNumber: number,
): ApprovalWorkflowStepView | undefined {
  return workflow.steps.find((step) => step.order === levelNumber)
}

function explicitEmployeeIds(step: ApprovalWorkflowStepView | undefined): string[] {
  if (!step || step.assigneeType !== 'EXPLICIT_EMPLOYEES') return []
  return (step.employeeIds ?? []).map((id) => id.trim()).filter(Boolean)
}

/** True when the applicant is a named approver at the request’s current workflow level. */
export function isApplicantNamedApproverAtCurrentLevel(
  request: LeaveRequest,
  workflow: ApprovalWorkflowDetailView | null | undefined,
): boolean {
  if (request.status !== 'Pending' || !request.multiLevelWorkflow || !workflow) return false
  const level = parsePendingWorkflowLevel(request.currentStepLabel)
  if (!level) return false
  const step = workflowStepAtLevel(workflow, level)
  const ids = explicitEmployeeIds(step)
  return ids.includes(request.employeeId)
}

export function workflowSelfApprovalRequestNotice(
  request: LeaveRequest,
  workflow: ApprovalWorkflowDetailView | null | undefined,
  applicantDisplayName?: string,
): WorkflowApprovalNotice | null {
  if (!isApplicantNamedApproverAtCurrentLevel(request, workflow)) return null
  const name = applicantDisplayName?.trim() || request.employeeName?.trim() || 'This employee'
  return {
    tone: 'warning',
    message: workflowSelfApprovalRequestMessage(name),
  }
}

export function workflowFormSelfApprovalWarnings(form: ApprovalWorkflowForm): string[] {
  const warnings: string[] = []
  const hasExplicit = form.steps.some((step) => step.assigneeType === 'EXPLICIT_EMPLOYEES')
  if (hasExplicit) {
    warnings.push(WORKFLOW_SELF_APPROVAL_FORM_HINT)
  }
  form.steps.forEach((step, index) => {
    if (step.assigneeType === 'EXPLICIT_EMPLOYEES' && step.employeeIds.length > 0) {
      warnings.push(`Level ${index + 1}: ${WORKFLOW_SELF_APPROVAL_EXPLICIT_LEVEL_HINT}`)
    }
  })
  return [...new Set(warnings)]
}

function matchesLeaveTypeCode(detail: ApprovalWorkflowDetailView, leaveTypeCode: string): boolean {
  const target = leaveTypeCode.trim().toUpperCase()
  const codes = detail.leaveTypeCode
    .split(',')
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean)
  return codes.includes(target) || detail.leaveTypeCode.trim().toUpperCase() === target
}

export function findActiveWorkflowForLeaveType(
  data: ApprovalWorkflowsListData | undefined,
  leaveTypeCode: string,
  leaveTypes: LeaveTypeOption[] = [],
  employees: LeaveEmployee[] = [],
): ApprovalWorkflowDetailView | null {
  if (!data?.items.length) return null
  let inactiveFallback: ApprovalWorkflowDetailView | null = null
  for (const item of data.items) {
    const detail = mapApiApprovalWorkflowItemToDetail(item, leaveTypes, employees)
    if (!matchesLeaveTypeCode(detail, leaveTypeCode)) continue
    if (detail.active) return detail
    inactiveFallback ??= detail
  }
  return inactiveFallback
}

export function canUserActOnLeaveRequestRespectingSelfApproval(
  request: LeaveRequest,
  actionableRequestIds: ReadonlySet<string>,
  workflow: ApprovalWorkflowDetailView | null | undefined,
): boolean {
  if (isApplicantNamedApproverAtCurrentLevel(request, workflow)) return false
  return canUserActOnLeaveRequest(request, actionableRequestIds)
}

export function workflowDetailSelfApprovalHints(
  workflow: ApprovalWorkflowDetailView,
): string[] {
  const hints: string[] = []
  for (const step of workflow.steps) {
    if (step.assigneeType === 'EXPLICIT_EMPLOYEES' && (step.employeeIds?.length ?? 0) > 0) {
      hints.push(`Level ${step.order}: ${WORKFLOW_SELF_APPROVAL_EXPLICIT_LEVEL_HINT}`)
    }
  }
  if (hints.length > 0 && !hints.includes(WORKFLOW_SELF_APPROVAL_FORM_HINT)) {
    hints.unshift(WORKFLOW_SELF_APPROVAL_FORM_HINT)
  }
  return hints
}