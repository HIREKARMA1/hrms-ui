import type { LeaveSnapshot } from '../services/leaveService'
import type { LeaveRequest } from '../types/leaveRequest'
import { isHrActionRequest, sortHrActionRequests } from './attentionHrQueue'

/** Merge workflow pending API rows with snapshot HR-queue requests (dedupe by id). */
export function mergeHrAttentionQueue(
  snapshot: LeaveSnapshot,
  workflowPending: LeaveRequest[] | null,
): LeaveRequest[] {
  const fromSnapshot = snapshot.requests.filter((row) => isHrActionRequest(snapshot, row))
  if (workflowPending === null) return sortHrActionRequests(fromSnapshot, snapshot)

  const byId = new Map<string, LeaveRequest>()
  for (const row of workflowPending) {
    if (row.status !== 'Pending') continue
    if (!row.id) continue
    byId.set(row.id, row)
  }
  for (const row of fromSnapshot) {
    if (!byId.has(row.id)) byId.set(row.id, row)
  }
  return sortHrActionRequests([...byId.values()], snapshot)
}