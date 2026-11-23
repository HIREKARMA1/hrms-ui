/**
 * Ledger entry kind labels for balances and accrual previews.
 * Used by ledger tables and adjustment dialog.
 */

import type { LedgerEntryKind } from '../types/ledger'

export const LEDGER_ENTRY_KINDS: LedgerEntryKind[] = [
  'Opening',
  'Accrual',
  'Leave taken',
  'Cancelled',
  'Adjustment',
  'Carry-forward',
  'Lapse',
  'Encashment',
]
