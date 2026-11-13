/**
 * Thresholds and copy for HR Overview attention items.
 */

import type { LeaveTypeCode } from './leaveTypeCodes'

/** Paid leave types checked for the low-balance attention row. */
export const LOW_BALANCE_TYPE_CODES: LeaveTypeCode[] = ['CL', 'SL', 'EL', 'PL']

/** Flag when available balance is strictly below this many days. */
export const LOW_BALANCE_THRESHOLD_DAYS = 3

export function lowBalanceAttentionSentence(): string {
  return `Fewer than ${LOW_BALANCE_THRESHOLD_DAYS} paid days left on CL, SL, EL or PL`
}
