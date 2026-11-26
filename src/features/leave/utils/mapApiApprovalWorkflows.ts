import type { LeaveTypeOption } from '../api/leaveMappers'
import type {
  ApiApprovalWorkflowItem,
  ApiApprovalWorkflowStep,
  ApprovalWorkflowDetailView,
  ApprovalWorkflowsListData,
  ApprovalWorkflowStepView,
  ApprovalWorkflowTableRow,
  WorkflowAssigneeType,
} from '../types/api/leaveApprovalWorkflows.types'
import { assigneeTypeLabel } from './buildApprovalWorkflowApiBody'
import type { LeaveEmployee } from '../types/employee'
import {
  enrichWorkflowStepViews,
  formatStepsSummaryFromViews,
} from './approvalWorkflowStepLabels'

export function resolveLeaveTypeCodeFromIds(
  leaveTypeIds: string[],
  leaveTypes?: LeaveTypeOption[],
  apiFallback?: { leaveType?: ApiApprovalWorkflowItem['leaveType']; leaveTypeCode?: string },
): string {
  if (leaveTypeIds.length === 0) return '—'

  if (leaveTypes?.length) {
    const codes = leaveTypeIds
      .map((id) => leaveTypes.find((type) => type.id === id)?.code)
      .filter((code): code is string => Boolean(code))
    if (codes.length === leaveTypeIds.length && codes.length > 0) {
      return codes.length > 1 ? codes.join(', ') : codes[0]!.toUpperCase()
    }
    if (codes.length > 0) {
      return codes.map((code) => code.toUpperCase()).join(', ')
    }
  }

  if (leaveTypeIds.length > 1) return 'MULTI'

  return (
    apiFallback?.leaveType?.code ??
    apiFallback?.leaveTypeCode ??
    leaveTypeIds[0]?.slice(0, 8) ??
    '—'
  )
    .trim()
    .toUpperCase()
}

function resolveName(item: ApiApprovalWorkflowItem): string {
  const name = (item.name ?? item.title ?? item.code ?? '').trim()
  return name || 'Workflow'
}

function resolveLeaveTypeIds(item: ApiApprovalWorkflowItem): string[] {
  if (Array.isArray(item.leaveTypeIds)) return item.leaveTypeIds
  if (item.leaveTypeId) return [item.leaveTypeId]
  if (item.leaveType?.id) return [item.leaveType.id]
  return []
}

function resolveLeaveTypeCode(item: ApiApprovalWorkflowItem, leaveTypes?: LeaveTypeOption[]): string {
  return resolveLeaveTypeCodeFromIds(resolveLeaveTypeIds(item), leaveTypes, {
    leaveType: item.leaveType,
    leaveTypeCode: item.leaveTypeCode,
  })
}

function resolveSteps(item: ApiApprovalWorkflowItem): ApiApprovalWorkflowStep[] {
  const steps = item.steps ?? item.workflowSteps ?? item.levels
  return Array.isArray(steps) ? steps : []
}

function normalizeAssigneeType(value: string | undefined): WorkflowAssigneeType | undefined {
  if (value === 'EXPLICIT_EMPLOYEES' || value === 'DEPARTMENT' || value === 'ANY_PROCESSOR') {
    return value
  }
  return undefined
}

function formatStepLabel(step: ApiApprovalWorkflowStep, index: number): string {
  const assigneeType = normalizeAssigneeType(step.assigneeType)
  if (assigneeType) {
    return `L${step.levelNumber ?? index + 1}: ${assigneeTypeLabel(assigneeType)}`
  }
  const label =
    step.label?.trim() ||
    step.name?.trim() ||
    step.level?.trim() ||
    step.role?.trim() ||
    step.approverRole?.trim() ||
    step.approverType?.trim()
  if (label) return label.replace(/_/g, ' ')
  return `Step ${index + 1}`
}

function sortSteps(steps: ApiApprovalWorkflowStep[]): ApiApprovalWorkflowStep[] {
  return [...steps].sort((a, b) => {
    const orderA = a.order ?? a.sequence ?? a.stepOrder ?? 0
    const orderB = b.order ?? b.sequence ?? b.stepOrder ?? 0
    if (orderA !== orderB) return orderA - orderB
    return 0
  })
}

function resolveStepViews(
  item: ApiApprovalWorkflowItem,
  employees?: LeaveEmployee[],
): ApprovalWorkflowStepView[] {
  const sorted = sortSteps(resolveSteps(item))
  const views = sorted.map((step, index) => ({
    order: step.order ?? step.sequence ?? step.stepOrder ?? step.levelNumber ?? index + 1,
    label: formatStepLabel(step, index),
    approverRole: step.approverRole?.trim() || step.approverType?.trim() || step.role?.trim(),
    assigneeType: normalizeAssigneeType(step.assigneeType),
    employeeIds: step.assigneeEmployeeIds ?? step.employeeIds,
    departmentId: step.departmentId,
  }))
  return employees?.length ? enrichWorkflowStepViews(views, employees) : views
}

function resolveStepsSummary(item: ApiApprovalWorkflowItem, employees?: LeaveEmployee[]): string {
  const views = resolveStepViews(item, employees)
  return formatStepsSummaryFromViews(views)
}

function resolveActive(item: ApiApprovalWorkflowItem): boolean {
  if (typeof item.enabled === 'boolean') return item.enabled
  if (typeof item.isActive === 'boolean') return item.isActive
  return true
}

export function mapApiApprovalWorkflowItemToTableRow(
  item: ApiApprovalWorkflowItem,
  leaveTypes?: LeaveTypeOption[],
  employees?: LeaveEmployee[],
): ApprovalWorkflowTableRow {
  return {
    id: item.id,
    name: resolveName(item),
    leaveTypeCode: resolveLeaveTypeCode(item, leaveTypes),
    stepsSummary: resolveStepsSummary(item, employees),
    active: resolveActive(item),
  }
}

export function mapApiApprovalWorkflowItemToDetail(
  item: ApiApprovalWorkflowItem,
  leaveTypes?: LeaveTypeOption[],
  employees?: LeaveEmployee[],
): ApprovalWorkflowDetailView {
  const table = mapApiApprovalWorkflowItemToTableRow(item, leaveTypes, employees)
  return {
    ...table,
    description: item.description?.trim() || undefined,
    leaveTypeIds: resolveLeaveTypeIds(item),
    leaveTypeId: resolveLeaveTypeIds(item)[0],
    steps: resolveStepViews(item, employees),
  }
}

export function tableRowToApprovalWorkflowDetail(
  row: ApprovalWorkflowTableRow,
): ApprovalWorkflowDetailView {
  const steps =
    row.stepsSummary === '—'
      ? []
      : row.stepsSummary.split('→').map((label, index) => ({
          order: index + 1,
          label: label.trim(),
        }))
  return { ...row, description: undefined, steps }
}

export function mapApiApprovalWorkflowsToTableRows(
  data: ApprovalWorkflowsListData,
  leaveTypes?: LeaveTypeOption[],
  employees?: LeaveEmployee[],
): ApprovalWorkflowTableRow[] {
  return data.items.map((item) => mapApiApprovalWorkflowItemToTableRow(item, leaveTypes, employees))
}