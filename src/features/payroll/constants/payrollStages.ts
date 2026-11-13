/**
 * Payroll run progress stages shown in PayrollProgress.
 * Used on PayrollPage for the month run tracker.
 */

import type { PayrollStage } from '../types/payroll'

export const PAYROLL_STAGES: PayrollStage[] = [
  'Draft',
  'Under review',
  'Approved',
  'Processed',
  'Paid',
]
