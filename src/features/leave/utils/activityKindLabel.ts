import type { ActivityEventKind } from './buildRecentActivity'

const LABELS: Record<ActivityEventKind, string> = {
  applied: 'Applied',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  escalated: 'Escalated',
  adjustment: 'Updated',
  accrual: 'Accrual',
}

export function activityKindLabel(kind: ActivityEventKind): string {
  return LABELS[kind]
}