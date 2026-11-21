import type { LedgerEntry, LedgerEntryKind } from '../types/ledger'
import type {
  ApiLeaveHistoryRow,
  LeaveHistoryData,
} from '../types/api/leaveHistory.types'

const KIND_MAP: Record<string, LedgerEntryKind> = {
  OPENING: 'Opening',
  OPENING_BALANCE: 'Opening',
  ACCRUAL: 'Accrual',
  MONTHLY_ACCRUAL: 'Accrual',
  LEAVE_TAKEN: 'Leave taken',
  LEAVE: 'Leave taken',
  DEDUCTION: 'Leave taken',
  DEDUCT: 'Leave taken',
  CANCELLED: 'Cancelled',
  CANCELLATION: 'Cancelled',
  CANCEL: 'Cancelled',
  ADJUSTMENT: 'Adjustment',
  MANUAL_ADJUSTMENT: 'Adjustment',
  CARRY_FORWARD: 'Carry-forward',
  CARRYFORWARD: 'Carry-forward',
  LAPSE: 'Lapse',
  ENCASHMENT: 'Encashment',
}

function resolveKind(row: ApiLeaveHistoryRow): LedgerEntryKind {
  const raw = (
    row.entryType ??
    row.transactionType ??
    row.kind ??
    row.type ??
    ''
  )
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')
  if (raw && KIND_MAP[raw]) return KIND_MAP[raw]
  const spaced = raw.replace(/_/g, ' ').toLowerCase()
  if (spaced.includes('accrual')) return 'Accrual'
  if (spaced.includes('cancel')) return 'Cancelled'
  if (spaced.includes('adjust')) return 'Adjustment'
  if (spaced.includes('carry')) return 'Carry-forward'
  if (spaced.includes('encash')) return 'Encashment'
  if (spaced.includes('lapse')) return 'Lapse'
  if (spaced.includes('opening')) return 'Opening'
  return 'Leave taken'
}

function resolveLeaveTypeCode(row: ApiLeaveHistoryRow): string {
  return (row.leaveType?.code ?? row.leaveTypeCode ?? 'LV').trim().toUpperCase()
}

function resolveDate(row: ApiLeaveHistoryRow): string {
  const raw = row.effectiveDate ?? row.date ?? row.createdAt
  if (raw) return raw.slice(0, 10)
  return new Date().toISOString().slice(0, 10)
}

function resolveDays(row: ApiLeaveHistoryRow): number {
  if (typeof row.days === 'number') return row.days
  if (typeof row.quantity === 'number') return row.quantity
  return 0
}

function resolveBalanceAfter(row: ApiLeaveHistoryRow): number {
  if (typeof row.balanceAfter === 'number') return row.balanceAfter
  if (typeof row.runningBalance === 'number') return row.runningBalance
  if (typeof row.balance === 'number') return row.balance
  return 0
}

export function mapApiLeaveHistoryToLedger(
  data: LeaveHistoryData,
  fallbackEmployeeId: string,
): LedgerEntry[] {
  return data.items.map((row) => ({
    id: row.id,
    employeeId: row.employeeId?.trim() || fallbackEmployeeId,
    leaveTypeCode: resolveLeaveTypeCode(row),
    date: resolveDate(row),
    kind: resolveKind(row),
    days: resolveDays(row),
    balanceAfter: resolveBalanceAfter(row),
    reason: (row.reason ?? row.notes ?? '').trim() || '—',
    by: (row.actorName ?? row.performedBy ?? row.createdBy ?? 'System').trim() || 'System',
  }))
}