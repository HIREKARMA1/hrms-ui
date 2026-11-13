/**
 * Plain approval note under chips in the leave types table.
 */

import type { LeaveTypePolicy } from '../types/leaveSettings'

function daysWord(n: number) {
  return `${n} day${n === 1 ? '' : 's'}`
}

export function buildApprovalReadableLine(policy: LeaveTypePolicy): string | null {
  if (policy.approvalChain === 'manager') return null
  if (policy.approvalChain === 'hr') return null
  const n = policy.managerOnlyUpToDays
  if (n != null && n > 0) {
    return `Manager only up to ${daysWord(n)}`
  }
  return null
}
