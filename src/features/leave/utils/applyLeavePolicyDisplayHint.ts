import type { LeaveTypePolicy } from '../types/leaveSettings'

/** Short policy line for apply dialog; omitted when server stub has no meaningful limits. */
export function applyLeavePolicyDisplayHint(policy: LeaveTypePolicy | undefined): string | null {
  if (!policy) return null
  const parts: string[] = []
  if (policy.maxConsecutiveDays !== null && policy.maxConsecutiveDays > 0) {
    parts.push(`Up to ${policy.maxConsecutiveDays} consecutive days`)
  }
  if (policy.minNoticeDays > 0) {
    parts.push(`${policy.minNoticeDays} day(s) notice`)
  }
  if (parts.length === 0) return null
  return parts.join(' · ')
}