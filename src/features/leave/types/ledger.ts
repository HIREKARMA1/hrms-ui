/**
 * Append-only leave balance ledger entry kinds and row shape.
 * Used by Balances tab and balance calculation utils.
 */

export type LedgerEntryKind =
  | 'Opening'
  | 'Accrual'
  | 'Leave taken'
  | 'Cancelled'
  | 'Adjustment'
  | 'Carry-forward'
  | 'Lapse'
  | 'Encashment'

export type LedgerEntry = {
  id: string
  employeeId: string
  leaveTypeCode: string
  date: string
  kind: LedgerEntryKind
  days: number
  balanceAfter: number
  reason: string
  by: string
}
