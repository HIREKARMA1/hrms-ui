/**
 * Opening and sample accrual ledger rows for all twelve employees.
 * Loaded into mockLeaveStore on init for balance calculations.
 */

import type { LedgerEntry } from '../types/ledger'

function openings(employeeId: string, balances: Record<string, number>): LedgerEntry[] {
  const date = '2026-01-01'
  return Object.entries(balances).map(([leaveTypeCode, days]) => ({
    id: `LED-${employeeId}-${leaveTypeCode}-O`,
    employeeId,
    leaveTypeCode,
    date,
    kind: 'Opening',
    days,
    balanceAfter: days,
    reason: 'Opening balance',
    by: 'System',
  }))
}

const template = { CL: 8, SL: 10, EL: 18, PL: 4, CO: 2 }

export function buildMockLedgers(employeeIds: string[]): LedgerEntry[] {
  const rows: LedgerEntry[] = []
  for (const employeeId of employeeIds) {
    if (employeeId.startsWith('EMP-HR')) {
      continue
    }
    rows.push(...openings(employeeId, template))
    rows.push({
      id: `LED-${employeeId}-EL-A`,
      employeeId,
      leaveTypeCode: 'EL',
      date: '2026-06-01',
      kind: 'Accrual',
      days: 1,
      balanceAfter: template.EL + 1,
      reason: 'June accrual',
      by: 'System',
    })
  }
  return rows
}
