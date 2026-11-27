import type { ApprovalWorkflowDetailView, WorkflowAssigneeType } from '../types/api/leaveApprovalWorkflows.types'

import {
  type ApprovalWorkflowForm,
  defaultApprovalWorkflowForm,
} from './buildApprovalWorkflowApiBody'

function assigneeFromStep(step: ApprovalWorkflowDetailView['steps'][number]): WorkflowAssigneeType {
  if (step.assigneeType) return step.assigneeType
  return 'ANY_PROCESSOR'
}

export function approvalWorkflowFormFromDetail(detail: ApprovalWorkflowDetailView): ApprovalWorkflowForm {
  const base = defaultApprovalWorkflowForm()
  const ids = detail.leaveTypeIds ?? (detail.leaveTypeId ? [detail.leaveTypeId] : [])

  return {
    name: detail.name,
    description: detail.description ?? '',
    leaveTypeId: ids.length === 1 ? ids[0] : '',
    isActive: detail.active,
    steps:
      detail.steps.length > 0
        ? detail.steps.map((step) => ({
            assigneeType: assigneeFromStep(step),
            employeeIds: step.employeeIds ?? [],
            departmentId: step.departmentId ?? '',
          }))
        : base.steps,
  }
}