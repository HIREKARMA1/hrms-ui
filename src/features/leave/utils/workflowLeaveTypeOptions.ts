import type { LeaveTypeOption } from '../api/leaveMappers'

export function activeLeaveTypesForWorkflow(leaveTypes: LeaveTypeOption[]): LeaveTypeOption[] {
  return leaveTypes.filter((type) => type.isActive)
}

export function findLeaveTypeOption(
  leaveTypes: LeaveTypeOption[],
  id: string,
): LeaveTypeOption | undefined {
  const trimmed = id.trim()
  if (!trimmed) return undefined
  return leaveTypes.find((type) => type.id === trimmed)
}

export function workflowLeaveTypeInactiveMessage(type: LeaveTypeOption): string {
  return `${type.name} (${type.code}) is inactive. Activate it under Leave types, or choose another leave type.`
}

export function assertActiveWorkflowLeaveType(
  leaveTypeId: string,
  leaveTypes: LeaveTypeOption[],
): { ok: true } | { ok: false; error: string } {
  const selected = findLeaveTypeOption(leaveTypes, leaveTypeId)
  if (!selected) {
    return { ok: false, error: 'Select a leave type for this workflow.' }
  }
  if (!selected.isActive) {
    return { ok: false, error: workflowLeaveTypeInactiveMessage(selected) }
  }
  return { ok: true }
}