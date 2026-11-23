/**
 * Preview year-end carry-forward, lapse, and encashment per employee and type.
 * Caps and encashable flags come from LeaveSettings leave type policies.
 */

import type { LedgerEntry } from '../types/ledger'
import type { LeaveSettings } from '../types/leaveSettings'
import { ledgerBalanceForType } from './calculateBalance'
import { accruesLeaveBalance } from './leaveEarningModel'

export type YearEndPreviewRow = {
  employeeId: string
  leaveTypeCode: string
  carryForward: number
  lapse: number
  encashment: number
}

export function calculateYearEndPreview(
  settings: LeaveSettings,
  ledger: LedgerEntry[],
  employeeIds: string[],
): YearEndPreviewRow[] {
  const rows: YearEndPreviewRow[] = []
  for (const employeeId of employeeIds) {
    for (const policy of settings.leaveTypes) {
      if (!policy.enabled || !accruesLeaveBalance(policy)) {
        continue
      }
      const balance = ledgerBalanceForType(ledger, employeeId, policy.code)
      if (balance <= 0) {
        continue
      }
      let carry = 0
      let lapse = 0
      let encash = 0
      if (policy.carryForward === 'capped') {
        const cap = policy.carryForwardCapDays ?? 0
        carry = Math.min(balance, cap)
        const above = balance - carry
        if (policy.encashable && above > 0) {
          encash = above
        } else {
          lapse = above
        }
      } else {
        lapse = balance
      }
      if (carry > 0 || lapse > 0 || encash > 0) {
        rows.push({
          employeeId,
          leaveTypeCode: policy.code,
          carryForward: carry,
          lapse,
          encashment: encash,
        })
      }
    }
  }
  return rows
}
