/**
 * Maps earning models to accrual behaviour; accrual and year-end skip non-balance types.
 */

import type { LeaveTypePolicy } from '../types/leaveSettings'
import type { LeaveEarningModel } from '../types/leaveEarningModel'

export function resolveEarningModel(policy: LeaveTypePolicy): LeaveEarningModel {
  if (policy.earningModel) return policy.earningModel
  if (!policy.paid && policy.annualQuotaDays === null) return 'unpaid'
  if (policy.code === 'CO') return 'comp_off'
  if (policy.accrualMethod === 'per_days_worked') return 'per_days_worked'
  if (policy.accrualMethod === 'monthly') return 'earned_monthly'
  if (['MAT', 'PAT', 'MAR', 'BER'].includes(policy.code)) return 'per_event'
  return 'yearly_quota'
}

/** Types that receive monthly accrual credits or year-end unused-day handling. */
export function accruesLeaveBalance(policy: LeaveTypePolicy): boolean {
  const model = resolveEarningModel(policy)
  return model === 'yearly_quota' || model === 'earned_monthly' || model === 'per_days_worked'
}

export function applyEarningModelToPolicy(policy: LeaveTypePolicy, model: LeaveEarningModel): LeaveTypePolicy {
  const next = { ...policy, earningModel: model }
  if (model === 'unpaid') {
    return { ...next, paid: false, annualQuotaDays: null, encashable: false, accrualMethod: 'upfront' }
  }
  if (model === 'comp_off') {
    return { ...next, paid: true, annualQuotaDays: null, accrualMethod: 'upfront', encashable: false, compOffExpiryDays: next.compOffExpiryDays ?? 60 }
  }
  if (model === 'per_event') {
    return { ...next, paid: true, accrualMethod: 'upfront', carryForward: 'none', encashable: false }
  }
  if (model === 'per_days_worked') {
    return {
      ...next,
      paid: true,
      accrualMethod: 'per_days_worked',
      daysWorkedPerAccrualDay: next.daysWorkedPerAccrualDay ?? 20,
      qualifyingDays: next.qualifyingDays ?? 180,
    }
  }
  if (model === 'earned_monthly') {
    return { ...next, paid: true, accrualMethod: 'monthly', annualQuotaDays: next.annualQuotaDays ?? 12 }
  }
  return { ...next, paid: true, accrualMethod: 'upfront', annualQuotaDays: next.annualQuotaDays ?? 12 }
}
