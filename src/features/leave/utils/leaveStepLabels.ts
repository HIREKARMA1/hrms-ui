/**
 * Human-readable labels for leave request timeline step kinds.
 */

import type { LeaveRequest, LeaveStepKind } from '../types/leaveRequest'

export const LEAVE_STEP_LABELS: Record<LeaveStepKind, string> = {
  applied: 'Application submitted',
  approval: 'Approved',
  rejection: 'Rejected',
  cancellation: 'Cancelled',
  escalation: 'Escalated',
  delegation: 'Delegated',
}

export function leaveStepLabel(kind: LeaveStepKind): string {
  return LEAVE_STEP_LABELS[kind] ?? kind
}

export function sortLeaveSteps(steps: LeaveRequest['steps']): LeaveRequest['steps'] {
  return [...steps].sort((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id))
}
