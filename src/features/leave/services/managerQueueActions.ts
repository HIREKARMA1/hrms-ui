/**
 * Mock mutations for manager encashment and comp-off approval queues.
 */

import { getLeaveStore } from './mockLeaveStore'

export function resolveEncashmentRequest(id: string, mode: 'approve' | 'reject'): void {
  const row = getLeaveStore().encashments.find((item) => item.id === id)
  if (!row || row.status !== 'Pending approval') return
  row.status = mode === 'approve' ? 'Pending payout' : 'Rejected'
}

export function resolveCompOffRequest(id: string, mode: 'approve' | 'reject'): void {
  const row = getLeaveStore().compOffRequests.find((item) => item.id === id)
  if (!row || row.status !== 'Pending') return
  row.status = mode === 'approve' ? 'Approved' : 'Rejected'
}
