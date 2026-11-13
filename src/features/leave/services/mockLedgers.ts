/**
 * Opening and sample accrual ledger rows for all twelve employees.
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

function balancesFor(employeeId: string) {
  if (employeeId === 'EMP-1003') return { CL: 2, SL: 10, EL: 18, PL: 4, CO: 2 }
  if (employeeId === 'EMP-1005') return { CL: 8, SL: 10, EL: 2, PL: 4, CO: 2 }
  if (employeeId === 'EMP-1008') return { CL: 2, SL: 10, EL: 18, PL: 4, CO: 2 }
  return { ...template }
}

export function buildMockLedgers(employeeIds: string[]): LedgerEntry[] {
  const rows: LedgerEntry[] = []
  for (const employeeId of employeeIds) {
    if (employeeId.startsWith('EMP-HR')) continue
    const balances = balancesFor(employeeId)
    rows.push(...openings(employeeId, balances))
    rows.push({
      id: `LED-${employeeId}-EL-A`,
      employeeId,
      leaveTypeCode: 'EL',
      date: '2026-06-01',
      kind: 'Accrual',
      days: 1,
      balanceAfter: balances.EL + 1,
      reason: 'June accrual',
      by: 'System',
    })
  }
  return rows
}
