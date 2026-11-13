/**
 * Formats approval chain as step labels for settings tables and dialogs.
 */

import type { LeaveTypePolicy } from '../types/leaveSettings'

export function formatApprovalFlow(policy: LeaveTypePolicy): string[] {
  if (policy.approvalChain === 'hr') return ['You', 'HR']
  if (policy.approvalChain === 'manager') return ['You', 'Manager']
  if (policy.managerOnlyUpToDays != null) {
    return ['You', `Manager ≤${policy.managerOnlyUpToDays}d`, 'HR']
  }
  return ['You', 'Manager', 'HR']
}
