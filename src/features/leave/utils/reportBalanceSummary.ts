/**
 * Rows for HR balance summary report and CSV export.
 */

import type { LeaveSnapshot } from '../services/leaveService'
import { BALANCE_TYPE_CODES } from '../constants/leaveTypeCodes'
import { activeEmployees } from './employmentStatus'
import { ledgerBalanceForType, pendingDaysForType, usedDaysForType } from './calculateBalance'
import { leaveTodayIso } from './leaveToday'

export function balanceSummaryRows(snapshot: LeaveSnapshot) {
  const year = leaveTodayIso().slice(0, 4)
  const rows: (string | number)[][] = []
  for (const emp of activeEmployees(snapshot.employees).filter((item) => !item.id.startsWith('EMP-HR'))) {
    for (const code of BALANCE_TYPE_CODES) {
      const used = usedDaysForType(snapshot.requests, emp.id, code, year)
      const pending = pendingDaysForType(snapshot.requests, emp.id, code)
      const balance = ledgerBalanceForType(snapshot.ledger, emp.id, code) - pending
      rows.push([emp.name, emp.department, code, 0, 0, used, pending, balance])
    }
  }
  return rows
}

export const BALANCE_SUMMARY_HEADERS = ['Employee', 'Department', 'Type', 'Opening', 'Accrued', 'Used', 'Pending', 'Balance']
