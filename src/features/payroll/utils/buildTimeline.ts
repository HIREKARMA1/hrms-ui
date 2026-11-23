/**
 * Builds payment timeline steps for the detail panel from employee status.
 * Used by PaymentInfoTab to show payroll processing progress.
 */

import type { EmployeeWithComputed, TimelineStep } from '../types/payroll'

export function buildPaymentTimeline(
  employee: EmployeeWithComputed,
): TimelineStep[] {
  const failed = employee.status === 'Failed'
  const paid = employee.status === 'Paid'
  const inFlight = employee.status === 'Pending' || employee.status === 'On Hold'

  return [
    { label: 'Generated', completed: true },
    { label: 'Approved', completed: !failed && (paid || inFlight) },
    { label: 'Sent to bank', completed: paid },
    {
      label: failed ? 'Failed' : 'Credited',
      completed: paid || failed,
      failed,
    },
  ]
}
