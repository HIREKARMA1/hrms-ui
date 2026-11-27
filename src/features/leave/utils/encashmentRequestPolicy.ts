import { toDateOnly } from '../api/leaveMappers'
import type { LeaveTypeOption } from '../api/leaveMappers'
import type { ApiLeaveEncashmentPolicyItem } from '../types/api/leaveEncashmentPolicies.types'

export type EncashmentPolicyRule = {
  policyId: string
  leaveTypeId: string
  minDaysAfter: number
  maxDaysPerRequest: number
  maxDaysPerYear: number | null
  rateLabel: string | null
}

export function policyMinDaysAfter(item: ApiLeaveEncashmentPolicyItem): number {
  const days =
    item.minDays ??
    item.minimumBalanceDays ??
    item.minBalanceDays ??
    item.minBalanceAfterEncashment
  return typeof days === 'number' ? days : 0
}

export function isEncashmentPolicyEffectiveOn(item: ApiLeaveEncashmentPolicyItem, asOf: string): boolean {
  if (item.isActive === false || item.enabled === false) return false
  const from = item.effectiveFrom ? toDateOnly(item.effectiveFrom) : null
  if (from && asOf < from) return false
  const to = item.effectiveTo ? toDateOnly(item.effectiveTo) : null
  if (to && asOf > to) return false
  return Boolean(item.leaveTypeId)
}

export function encashmentPolicyRule(item: ApiLeaveEncashmentPolicyItem): EncashmentPolicyRule | null {
  if (!item.leaveTypeId) return null
  const rate =
    typeof item.ratePerDay === 'number'
      ? `${(item.currency ?? 'INR').toUpperCase()} ${item.ratePerDay.toLocaleString()} / day`
      : null
  return {
    policyId: item.id,
    leaveTypeId: item.leaveTypeId,
    minDaysAfter: policyMinDaysAfter(item),
    maxDaysPerRequest: typeof item.maxDaysPerRequest === 'number' ? item.maxDaysPerRequest : 0,
    maxDaysPerYear:
      item.maxDaysPerYear ??
      item.maximumDaysPerYear ??
      item.maxEncashmentDaysPerYear ??
      null,
    rateLabel: rate,
  }
}

export function activeEncashmentPolicies(
  items: ApiLeaveEncashmentPolicyItem[],
  asOf: string,
): ApiLeaveEncashmentPolicyItem[] {
  return items.filter((item) => isEncashmentPolicyEffectiveOn(item, asOf))
}

export function leaveTypesWithEncashmentPolicy(
  leaveTypes: LeaveTypeOption[],
  policies: ApiLeaveEncashmentPolicyItem[],
  asOf: string,
): LeaveTypeOption[] {
  const active = activeEncashmentPolicies(policies, asOf)
  const policyTypeIds = new Set(active.map((item) => item.leaveTypeId))
  return leaveTypes.filter((type) => type.isActive && type.isPaid && policyTypeIds.has(type.id))
}

export function ruleForLeaveType(
  policies: ApiLeaveEncashmentPolicyItem[],
  leaveTypeId: string,
  asOf: string,
): EncashmentPolicyRule | null {
  const match = activeEncashmentPolicies(policies, asOf).find((item) => item.leaveTypeId === leaveTypeId)
  return match ? encashmentPolicyRule(match) : null
}

/** Client checks for employee POST /leave-encashments (policy rules enforced on the server). */
export function validateEncashmentRequestBalance(balance: number, days: number): string | null {
  if (days < 1) return 'Enter at least one day to encash.'
  if (balance <= 0) return 'You do not have any leave balance to encash for this type.'
  if (days > balance) return 'You do not have enough balance for this request.'
  return null
}

export function validateEncashmentDays(
  balance: number,
  days: number,
  rule: EncashmentPolicyRule | null,
): string | null {
  const basic = validateEncashmentRequestBalance(balance, days)
  if (basic) return basic
  if (!rule) return 'No active encashment policy applies to this leave type today.'
  if (rule.maxDaysPerRequest > 0 && days > rule.maxDaysPerRequest) {
    return `You can encash at most ${rule.maxDaysPerRequest} day${rule.maxDaysPerRequest === 1 ? '' : 's'} per request.`
  }
  const after = balance - days
  if (after < rule.minDaysAfter) {
    return `Keep at least ${rule.minDaysAfter} day${rule.minDaysAfter === 1 ? '' : 's'} in balance after encashment.`
  }
  return null
}