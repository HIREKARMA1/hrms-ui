import type {
  ApiLeaveEncashmentPolicyItem,
  EncashmentPolicyTableRow,
  LeaveEncashmentPoliciesData,
} from '../types/api/leaveEncashmentPolicies.types'

function resolveCode(item: ApiLeaveEncashmentPolicyItem): string {
  return (item.leaveType?.code ?? item.leaveTypeCode ?? '—').trim().toUpperCase()
}

function resolveName(item: ApiLeaveEncashmentPolicyItem, code: string): string {
  const name = item.leaveType?.name?.trim()
  if (name) return name
  return code === '—' ? 'Company default' : code
}

function resolveMinBalance(item: ApiLeaveEncashmentPolicyItem): string {
  const days =
    item.minimumBalanceDays ??
    item.minBalanceDays ??
    item.minBalanceAfterEncashment
  if (typeof days === 'number') {
    return `Keep at least ${days} day(s)`
  }
  return '—'
}

function resolveMaxPerYear(item: ApiLeaveEncashmentPolicyItem): string {
  const days =
    item.maximumDaysPerYear ??
    item.maxDaysPerYear ??
    item.maxEncashmentDaysPerYear
  if (typeof days === 'number') {
    return `${days} day(s) / year`
  }
  return '—'
}

function resolveAllowed(item: ApiLeaveEncashmentPolicyItem): string {
  if (typeof item.encashable === 'boolean') {
    return item.encashable ? 'Yes' : 'No'
  }
  if (typeof item.allowEncashment === 'boolean') {
    return item.allowEncashment ? 'Yes' : 'No'
  }
  return '—'
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
      minBalance: resolveMinBalance(item),
      maxPerYear: resolveMaxPerYear(item),
      allowed: resolveAllowed(item),
      active: resolveActive(item),
    }
  })
}