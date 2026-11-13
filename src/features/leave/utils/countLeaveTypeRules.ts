/**
 * Counts optional rules set on a leave type (for the "More rules" badge).
 */

import type { LeaveTypePolicy } from '../types/leaveSettings'
import { resolveEarningModel } from './leaveEarningModel'

export function countLeaveTypeRules(policy: LeaveTypePolicy): number {
  let count = 0
  if (policy.maxConsecutiveDays != null && policy.maxConsecutiveDays > 0) count += 1
  if (policy.minNoticeDays > 0) count += 1
  if (policy.backdatingAllowedDays > 0) count += 1
  if (policy.medicalCertificateAfterDays != null && policy.medicalCertificateAfterDays > 0) count += 1
  if (!policy.halfDayAllowed) count += 1
  if (policy.dayCounting === 'calendar') count += 1
  const model = resolveEarningModel(policy)
  if (model === 'yearly_quota' || model === 'earned_monthly' || model === 'per_days_worked') {
    if (policy.carryForward === 'capped') count += 1
    if (policy.encashable) count += 1
    if (policy.allowLwpConversion) count += 1
  }
  if (policy.minServiceMonths > 0) count += 1
  return count
}
