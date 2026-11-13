/**
 * Approval and workflow status labels mapped to existing StatusPill tokens.
 * Used by Variable Pay, bonus runs, and Final Settlement tables.
 */

import type { BonusRunStatus } from '../types/variablePay'
import type { ItemApprovalStatus } from '../types/variablePay'
import type { SettlementStatus } from '../types/finalSettlement'

/** Reuses payment status pill tokens — no new colors. */
export const approvalPillClasses: Record<string, string> = {
  Draft: 'bg-hrms-muted-bg text-hrms-text-secondary',
  'Pending approval':
    'bg-hrms-warning/10 text-[color-mix(in_srgb,var(--color-hrms-warning)_45%,var(--color-hrms-navy))]',
  Approved: 'bg-hrms-success/10 text-hrms-success',
  Paid: 'bg-hrms-success/10 text-hrms-success',
  Rejected: 'bg-hrms-danger/10 text-hrms-danger',
}

export const approvalPillDotClasses: Record<string, string> = {
  Draft: 'bg-hrms-text-secondary',
  'Pending approval': 'bg-hrms-warning',
  Approved: 'bg-hrms-success',
  Paid: 'bg-hrms-success',
  Rejected: 'bg-hrms-danger',
}

export const ITEM_APPROVAL_STATUSES: ItemApprovalStatus[] = [
  'Pending approval',
  'Approved',
  'Rejected',
]

export const BONUS_RUN_STATUSES: BonusRunStatus[] = ['Draft', 'Approved', 'Paid']

export const SETTLEMENT_STATUSES: SettlementStatus[] = [
  'Draft',
  'Pending approval',
  'Approved',
  'Paid',
  'Rejected',
]
