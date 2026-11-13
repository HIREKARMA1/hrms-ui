/**
 * Payment status labels, styles, and allowed state transitions.
 * Used by usePayroll actions and StatusPill components.
 */

import type { PaymentStatus } from '../types/payroll'

export const PAYMENT_STATUSES: PaymentStatus[] = [
  'Paid',
  'Pending',
  'Failed',
  'On Hold',
]

export const STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  Paid: [],
  Pending: ['Paid', 'On Hold'],
  Failed: ['Pending'],
  'On Hold': ['Pending'],
}

export const statusPillClasses: Record<PaymentStatus, string> = {
  Paid: 'bg-hrms-success/10 text-hrms-success',
  Pending:
    'bg-hrms-warning/10 text-[color-mix(in_srgb,var(--color-hrms-warning)_45%,var(--color-hrms-navy))]',
  Failed: 'bg-hrms-danger/10 text-hrms-danger',
  'On Hold': 'bg-hrms-muted-bg text-hrms-text-secondary',
}

export const statusPillDotClasses: Record<PaymentStatus, string> = {
  Paid: 'bg-hrms-success',
  Pending: 'bg-hrms-warning',
  Failed: 'bg-hrms-danger',
  'On Hold': 'bg-hrms-text-secondary',
}

export function canTransition(
  from: PaymentStatus,
  to: PaymentStatus,
): boolean {
  return STATUS_TRANSITIONS[from].includes(to)
}
