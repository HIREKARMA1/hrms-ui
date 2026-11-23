import type {
  ApiApprovalWorkflowItem,
  ApiApprovalWorkflowStep,
  ApprovalWorkflowDetailView,
  ApprovalWorkflowsListData,
  ApprovalWorkflowStepView,
  ApprovalWorkflowTableRow,
} from '../types/api/leaveApprovalWorkflows.types'

function resolveName(item: ApiApprovalWorkflowItem): string {
  const name = (item.name ?? item.title ?? item.code ?? '').trim()
  return name || 'Workflow'
}

function resolveLeaveTypeCode(item: ApiApprovalWorkflowItem): string {
  return (
    item.leaveType?.code ??
    item.leaveTypeCode ??
    item.leaveTypeId?.slice(0, 8) ??
    '—'
  ).trim().toUpperCase()
}

function resolveSteps(item: ApiApprovalWorkflowItem): ApiApprovalWorkflowStep[] {
  const steps = item.steps ?? item.workflowSteps ?? item.levels
  return Array.isArray(steps) ? steps : []
}

function formatStepLabel(step: ApiApprovalWorkflowStep, index: number): string {
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

function resolveStepViews(item: ApiApprovalWorkflowItem): ApprovalWorkflowStepView[] {
  const sorted = sortSteps(resolveSteps(item))
  return sorted.map((step, index) => ({
    order: step.order ?? step.sequence ?? step.stepOrder ?? index + 1,
    label: formatStepLabel(step, index),
  }))
}

function resolveStepsSummary(item: ApiApprovalWorkflowItem): string {
  const views = resolveStepViews(item)
  if (views.length === 0) return '—'
  return views.map((step) => step.label).join(' → ')
}

function resolveActive(item: ApiApprovalWorkflowItem): boolean {
  if (typeof item.enabled === 'boolean') return item.enabled
  if (typeof item.isActive === 'boolean') return item.isActive
  return true
}

export function mapApiApprovalWorkflowItemToTableRow(
  item: ApiApprovalWorkflowItem,
): ApprovalWorkflowTableRow {
  return {
    id: item.id,
    name: resolveName(item),
    leaveTypeCode: resolveLeaveTypeCode(item),
    stepsSummary: resolveStepsSummary(item),
    active: resolveActive(item),
  }
}

export function mapApiApprovalWorkflowItemToDetail(
  item: ApiApprovalWorkflowItem,
): ApprovalWorkflowDetailView {
  const table = mapApiApprovalWorkflowItemToTableRow(item)
  return {
    ...table,
    description: item.description?.trim() || undefined,
    steps: resolveStepViews(item),
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
): ApprovalWorkflowTableRow[] {
  return data.items.map(mapApiApprovalWorkflowItemToTableRow)
}