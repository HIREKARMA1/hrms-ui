import type {
  ApiLeaveEncashmentPolicyItem,
  EncashmentPolicyTableRow,
  LeaveEncashmentPoliciesData,
} from '../types/api/leaveEncashmentPolicies.types'
import { formatPolicyEffectiveRange } from './formatPolicyDateRange'

function resolveCode(item: ApiLeaveEncashmentPolicyItem): string {
  return (item.leaveType?.code ?? item.leaveTypeCode ?? '—').trim().toUpperCase()
}

function resolveName(item: ApiLeaveEncashmentPolicyItem, code: string): string {
  const name = item.leaveType?.name?.trim()
  if (name) return name
  return code === '—' ? 'Company default' : code
}

function resolveMinDays(item: ApiLeaveEncashmentPolicyItem): string {
  const days =
    item.minDays ??
    item.minimumBalanceDays ??
    item.minBalanceDays ??
    item.minBalanceAfterEncashment
  if (typeof days === 'number') return `${days} day${days === 1 ? '' : 's'}`
  return '—'
}

function resolveRate(item: ApiLeaveEncashmentPolicyItem): string {
  if (typeof item.ratePerDay !== 'number') return '—'
  const currency = (item.currency ?? 'INR').trim().toUpperCase()
  const amount = item.ratePerDay.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return `${currency} ${amount} / day`
}

function resolveMaxPerRequest(item: ApiLeaveEncashmentPolicyItem): string {
  if (typeof item.maxDaysPerRequest !== 'number') return '—'
  const days = item.maxDaysPerRequest
  return `${days} day${days === 1 ? '' : 's'}`
}

function resolveMaxPerYear(item: ApiLeaveEncashmentPolicyItem): string {
  const days =
    item.maxDaysPerYear ??
    item.maximumDaysPerYear ??
    item.maxEncashmentDaysPerYear
  if (typeof days === 'number') return `${days} day${days === 1 ? '' : 's'} / year`
  if (item.maxDaysPerYear === null) return 'No limit'
  return '—'
}

function resolveEffective(item: ApiLeaveEncashmentPolicyItem): string {
  return formatPolicyEffectiveRange(item.effectiveFrom, item.effectiveTo)
}

function resolveActive(item: ApiLeaveEncashmentPolicyItem): boolean {
  if (typeof item.enabled === 'boolean') return item.enabled
  if (typeof item.isActive === 'boolean') return item.isActive
  return true
}

export function mapApiEncashmentPoliciesToTableRows(
  data: LeaveEncashmentPoliciesData,
): EncashmentPolicyTableRow[] {
  return data.items.map((item) => {
    const leaveTypeCode = resolveCode(item)
    return {
      id: item.id,
      leaveTypeCode,
      leaveTypeName: resolveName(item, leaveTypeCode),
      ratePerDay: resolveRate(item),
      minDays: resolveMinDays(item),
      maxPerRequest: resolveMaxPerRequest(item),
      maxPerYear: resolveMaxPerYear(item),
      effective: resolveEffective(item),
      active: resolveActive(item),
    }
  })
}