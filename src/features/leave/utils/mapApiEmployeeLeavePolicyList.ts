import type {
  ApiEmployeeLeavePolicyItem,
  AssignedLeavePolicyTableRow,
  EmployeeLeavePolicyListData,
} from '../types/api/employeeLeavePolicyList.types'

function resolveCode(item: ApiEmployeeLeavePolicyItem): string {
  return (item.leaveType?.code ?? item.leaveTypeCode ?? '—').trim().toUpperCase()
}

function resolveName(item: ApiEmployeeLeavePolicyItem, code: string): string {
  const name = item.leaveTypeName?.trim() || item.leaveType?.name?.trim()
  if (name) return name
  return code === '—' ? 'Unknown type' : code
}

function resolveGrantMode(item: ApiEmployeeLeavePolicyItem): string {
  const raw = (item.grantMode ?? '').trim()
  if (!raw) return '—'
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())
}

function resolveEntitlementDetail(item: ApiEmployeeLeavePolicyItem): string {
  const mode = (item.grantMode ?? '').toUpperCase()
  if (mode.includes('MONTHLY') && typeof item.monthlyAccrualAmount === 'number') {
    return `${item.monthlyAccrualAmount} day(s) / month`
  }
  if (typeof item.annualEntitlement === 'number') {
    return `${item.annualEntitlement} day(s) / year`
  }
  if (typeof item.monthlyAccrualAmount === 'number' && item.monthlyAccrualAmount > 0) {
    return `${item.monthlyAccrualAmount} day(s) / month`
  }
  return '—'
}

function resolveEffectiveRange(item: ApiEmployeeLeavePolicyItem): string {
  const from = item.effectiveFrom?.trim()
  const to = item.effectiveTo?.trim()
  if (from && to) return `${from} → ${to}`
  if (from) return `From ${from}`
  if (to) return `Until ${to}`
  return '—'
}

function resolveRowId(item: ApiEmployeeLeavePolicyItem, index: number): string {
  return item.id ?? `${item.leaveTypeId ?? resolveCode(item)}-${item.year ?? index}-${index}`
}

export function mapApiEmployeeLeavePolicyItemToRow(
  item: ApiEmployeeLeavePolicyItem,
  index: number,
): AssignedLeavePolicyTableRow {
  const leaveTypeCode = resolveCode(item)
  return {
    id: resolveRowId(item, index),
    leaveTypeCode,
    leaveTypeName: resolveName(item, leaveTypeCode),
    grantMode: resolveGrantMode(item),
    entitlementDetail: resolveEntitlementDetail(item),
    effectiveRange: resolveEffectiveRange(item),
    useCompanyDefaults: item.useCompanyDefaults === true,
    active: item.isActive !== false,
  }
}

export function mapApiEmployeeLeavePolicyListToRows(
  data: EmployeeLeavePolicyListData,
): AssignedLeavePolicyTableRow[] {
  return data.items.map(mapApiEmployeeLeavePolicyItemToRow)
}