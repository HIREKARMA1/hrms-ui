import type {
  ApiEmployeeLeavePolicyDefaultItem,
  EmployeeLeavePolicyDefaultTableRow,
  EmployeeLeavePolicyDefaultsData,
} from '../types/api/employeeLeavePolicyDefaults.types'

function resolveCode(item: ApiEmployeeLeavePolicyDefaultItem): string {
  const code = (item.leaveType?.code ?? item.leaveTypeCode ?? item.code ?? '—').trim().toUpperCase()
  return code || '—'
}

function resolveName(item: ApiEmployeeLeavePolicyDefaultItem, code: string): string {
  const name = item.leaveTypeName?.trim() || item.leaveType?.name?.trim()
  if (name) return name
  return code === '—' ? 'Unknown type' : code
}

function resolveGrantMode(item: ApiEmployeeLeavePolicyDefaultItem): string {
  const raw = (item.grantMode ?? '').trim()
  if (!raw) return '—'
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())
}

function resolveEntitlementDetail(item: ApiEmployeeLeavePolicyDefaultItem): string {
  const mode = (item.grantMode ?? '').toUpperCase()
  if (mode.includes('MONTHLY') && typeof item.monthlyAccrualAmount === 'number') {
    return `${item.monthlyAccrualAmount} day(s) / month`
  }
  if (typeof item.annualEntitlement === 'number') {
    return `${item.annualEntitlement} day(s) / year`
  }
  if (typeof item.monthlyAccrualAmount === 'number') {
    return `${item.monthlyAccrualAmount} day(s) / month`
  }
  return '—'
}

function resolveActive(item: ApiEmployeeLeavePolicyDefaultItem): boolean {
  if (typeof item.isActive === 'boolean') return item.isActive
  if (typeof item.enabled === 'boolean') return item.enabled
  return true
}

function resolveRowId(item: ApiEmployeeLeavePolicyDefaultItem, index: number): string {
  return (
    item.id ??
    item.leaveTypeId ??
    item.leaveType?.id ??
    `${resolveCode(item)}-${index}`
  )
}

export function mapApiEmployeeLeavePolicyDefaultsToTableRows(
  data: EmployeeLeavePolicyDefaultsData,
): EmployeeLeavePolicyDefaultTableRow[] {
  return data.items.map((item, index) => {
    const leaveTypeCode = resolveCode(item)
    return {
      id: resolveRowId(item, index),
      leaveTypeCode,
      leaveTypeName: resolveName(item, leaveTypeCode),
      grantMode: resolveGrantMode(item),
      entitlementDetail: resolveEntitlementDetail(item),
      active: resolveActive(item),
    }
  })
}