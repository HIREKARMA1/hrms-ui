import type {
  ApiLeaveCarryForwardPolicyItem,
  CarryForwardPolicyTableRow,
  LeaveCarryForwardPoliciesData,
} from '../types/api/leaveCarryForwardPolicies.types'

function resolveCode(item: ApiLeaveCarryForwardPolicyItem): string {
  return (item.leaveType?.code ?? item.leaveTypeCode ?? '—').trim().toUpperCase()
}

function resolveName(item: ApiLeaveCarryForwardPolicyItem, code: string): string {
  const name = item.leaveType?.name?.trim()
  if (name) return name
  return code === '—' ? 'Unknown type' : code
}

function resolveMode(item: ApiLeaveCarryForwardPolicyItem): string {
  const raw = (item.carryForwardMode ?? item.mode ?? '').trim().toUpperCase()
  if (!raw) return '—'
  if (raw === 'NONE' || raw === 'NO') return 'None'
  if (raw === 'CAPPED' || raw === 'CAP') return 'Capped'
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())
}

function resolveCapDetail(item: ApiLeaveCarryForwardPolicyItem): string {
  const mode = resolveMode(item)
  if (mode === 'None') return 'Not allowed'
  const cap =
    item.carryForwardCapDays ??
    item.maxCarryForwardDays ??
    item.capDays ??
    item.maxDays
  if (typeof cap === 'number') {
    return `Up to ${cap} day(s)`
  }
  return mode === 'Capped' ? 'Cap not specified' : '—'
}

function resolveEncashment(item: ApiLeaveCarryForwardPolicyItem): string {
  if (typeof item.allowEncashment === 'boolean') {
    return item.allowEncashment ? 'Allowed' : 'No'
  }
  if (typeof item.encashable === 'boolean') {
    return item.encashable ? 'Allowed' : 'No'
  }
  return '—'
}

function resolveActive(item: ApiLeaveCarryForwardPolicyItem): boolean {
  if (typeof item.enabled === 'boolean') return item.enabled
  if (typeof item.isActive === 'boolean') return item.isActive
  return true
}

export function mapApiCarryForwardPoliciesToTableRows(
  data: LeaveCarryForwardPoliciesData,
): CarryForwardPolicyTableRow[] {
  return data.items.map((item) => {
    const leaveTypeCode = resolveCode(item)
    return {
      id: item.id,
      leaveTypeCode,
      leaveTypeName: resolveName(item, leaveTypeCode),
      mode: resolveMode(item),
      capDetail: resolveCapDetail(item),
      encashment: resolveEncashment(item),
      active: resolveActive(item),
    }
  })
}