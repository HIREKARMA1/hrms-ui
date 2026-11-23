import type {
  AccrualPolicyTableRow,
  ApiLeaveAccrualPolicyItem,
  LeaveAccrualPoliciesData,
} from '../types/api/leaveAccrualPolicies.types'

function resolveCode(item: ApiLeaveAccrualPolicyItem): string {
  return (item.leaveType?.code ?? item.leaveTypeCode ?? '—').trim().toUpperCase()
}

function resolveName(item: ApiLeaveAccrualPolicyItem, code: string): string {
  const name = item.leaveType?.name?.trim()
  if (name) return name
  return code === '—' ? 'Unknown type' : code
}

function resolveMethod(item: ApiLeaveAccrualPolicyItem): string {
  const raw = (item.accrualMethod ?? item.method ?? item.frequency ?? '').trim()
  if (!raw) return '—'
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())
}

function resolveRateDetail(item: ApiLeaveAccrualPolicyItem): string {
  if (typeof item.daysPerMonth === 'number') {
    return `${item.daysPerMonth} day(s) / month`
  }
  if (typeof item.monthlyDays === 'number') {
    return `${item.monthlyDays} day(s) / month`
  }
  if (typeof item.accrualDays === 'number') {
    return `${item.accrualDays} day(s)`
  }
  if (typeof item.daysWorkedPerAccrualDay === 'number') {
    return `1 day per ${item.daysWorkedPerAccrualDay} days worked`
  }
  return '—'
}

function resolveActive(item: ApiLeaveAccrualPolicyItem): boolean {
  if (typeof item.enabled === 'boolean') return item.enabled
  if (typeof item.isActive === 'boolean') return item.isActive
  return true
}

export function mapApiAccrualPoliciesToTableRows(
  data: LeaveAccrualPoliciesData,
): AccrualPolicyTableRow[] {
  return data.items.map((item) => {
    const leaveTypeCode = resolveCode(item)
    return {
      id: item.id,
      leaveTypeCode,
      leaveTypeName: resolveName(item, leaveTypeCode),
      method: resolveMethod(item),
      rateDetail: resolveRateDetail(item),
      active: resolveActive(item),
    }
  })
}