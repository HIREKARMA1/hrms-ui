/**
 * Pure stat totals for Variable Pay tab cards (excludes rejected where required).
 * Used by OvertimeTab, IncentivesTab, and BonusTab.
 */

import type { BonusRun, IncentiveEntry, OvertimeEntry } from '../types/variablePay'
import { roundMoney } from './roundMoney'

export function sumOvertimeStats(rows: OvertimeEntry[]) {
  const countable = rows.filter((row) => row.status !== 'Rejected')
  return {
    totalHours: countable.reduce((sum, row) => sum + row.hours, 0),
    totalAmount: roundMoney(countable.reduce((sum, row) => sum + row.amount, 0)),
    pending: rows.filter((row) => row.status === 'Pending approval').length,
    approved: rows.filter((row) => row.status === 'Approved').length,
  }
}

export function sumIncentiveStats(rows: IncentiveEntry[]) {
  const countable = rows.filter((row) => row.status !== 'Rejected')
  return {
    totalAmount: roundMoney(countable.reduce((sum, row) => sum + row.amount, 0)),
    entries: rows.length,
    pending: rows.filter((row) => row.status === 'Pending approval').length,
    approved: rows.filter((row) => row.status === 'Approved').length,
  }
}

export function sumBonusRunStats(runs: BonusRun[]) {
  const approvedPaid = runs.filter((run) => run.status === 'Approved' || run.status === 'Paid')
  const totalBonus = approvedPaid.reduce(
    (sum, run) =>
      sum + run.lines.filter((line) => line.included).reduce((inner, line) => inner + line.amount, 0),
    0,
  )
  const includedEmployees = approvedPaid.reduce(
    (sum, run) => sum + run.lines.filter((line) => line.included).length,
    0,
  )
  return {
    runs: runs.length,
    totalBonus: roundMoney(totalBonus),
    includedEmployees,
    draftRuns: runs.filter((run) => run.status === 'Draft').length,
  }
}
