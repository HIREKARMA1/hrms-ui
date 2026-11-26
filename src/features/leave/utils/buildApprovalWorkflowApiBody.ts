import type { LeaveTypeOption } from '../api/leaveMappers'
import type {
  CreateApprovalWorkflowBody,
  UpdateApprovalWorkflowBody,
  WorkflowAssigneeType,
} from '../types/api/leaveApprovalWorkflows.types'

import { assertActiveWorkflowLeaveType } from './workflowLeaveTypeOptions'

export type ApprovalWorkflowFormStep = {
  assigneeType: WorkflowAssigneeType
  employeeIds: string[]
  departmentId: string
}

export type ApprovalWorkflowForm = {
  name: string
  description: string
  /** Required on create; sent as `leaveTypeIds: [id]`. */
  leaveTypeId: string
  isActive: boolean
  steps: ApprovalWorkflowFormStep[]
}

const ASSIGNEE_TYPES: WorkflowAssigneeType[] = ['ANY_PROCESSOR', 'DEPARTMENT', 'EXPLICIT_EMPLOYEES']

export function defaultApprovalWorkflowForm(): ApprovalWorkflowForm {
  const step = (): ApprovalWorkflowFormStep => ({
    assigneeType: 'ANY_PROCESSOR',
    employeeIds: [],
    departmentId: '',
  })
  return {
    name: '',
    description: '',
    leaveTypeId: '',
    isActive: true,
    steps: [step(), step()],
  }
}

export function assigneeTypeOptions(): readonly WorkflowAssigneeType[] {
  return ASSIGNEE_TYPES
}

export function assigneeTypeLabel(type: WorkflowAssigneeType): string {
  switch (type) {
    case 'ANY_PROCESSOR':
      return 'Any processor (approve queue)'
    case 'DEPARTMENT':
      return 'Department'
    case 'EXPLICIT_EMPLOYEES':
      return 'Named employees'
    default:
      return type
  }
}

function buildLevel(
  step: ApprovalWorkflowFormStep,
  levelNumber: number,
): { ok: true; level: CreateApprovalWorkflowBody['levels'][number] } | { ok: false; error: string } {
  const assigneeType = step.assigneeType
  const base = { levelNumber, assigneeType }

  if (assigneeType === 'EXPLICIT_EMPLOYEES') {
    const employeeIds = step.employeeIds.map((id) => id.trim()).filter(Boolean)
    if (employeeIds.length === 0) {
      return {
        ok: false,
        error: `Level ${levelNumber}: select at least one employee for named approvers.`,
      }
    }
    return { ok: true, level: { ...base, assigneeEmployeeIds: employeeIds } }
  }

  if (assigneeType === 'DEPARTMENT') {
    const departmentId = step.departmentId.trim()
    if (!departmentId) {
      return { ok: false, error: `Level ${levelNumber}: enter a department id.` }
    }
    return { ok: true, level: { ...base, departmentId } }
  }

  return { ok: true, level: base }
}

export function buildCreateApprovalWorkflowBody(
  form: ApprovalWorkflowForm,
  leaveTypes: LeaveTypeOption[] = [],
): { ok: true; body: CreateApprovalWorkflowBody } | { ok: false; error: string } {
  const name = form.name.trim()
  if (!name) return { ok: false, error: 'Enter a workflow name.' }

  const levels: CreateApprovalWorkflowBody['levels'] = []
  for (let index = 0; index < form.steps.length; index++) {
    const built = buildLevel(form.steps[index], index + 1)
    if (!built.ok) return built
    levels.push(built.level)
  }

  if (levels.length === 0) return { ok: false, error: 'Add at least one approval level.' }

  const leaveTypeId = form.leaveTypeId.trim()
  const typeCheck = assertActiveWorkflowLeaveType(leaveTypeId, leaveTypes)
  if (!typeCheck.ok) return typeCheck
  const leaveTypeIds = [leaveTypeId]

  const body: CreateApprovalWorkflowBody = {
    name,
    isActive: form.isActive,
    leaveTypeIds,
    levels,
  }

  const description = form.description.trim()
  if (description) body.description = description

  return { ok: true, body }
}

export function buildUpdateApprovalWorkflowBody(
  form: ApprovalWorkflowForm,
  leaveTypes: LeaveTypeOption[] = [],
): { ok: true; body: UpdateApprovalWorkflowBody } | { ok: false; error: string } {
  const created = buildCreateApprovalWorkflowBody(form, leaveTypes)
  if (!created.ok) return created
  return { ok: true, body: created.body }
}