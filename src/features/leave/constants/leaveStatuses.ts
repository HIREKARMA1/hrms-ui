/**
 * Request workflow status labels and pill tint tokens for LeaveStatusPill.
 * Pending manager/HR use warning; escalated and rejected use danger tints.
 */

export const LEAVE_REQUEST_STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled'] as const

export const leaveStatusPillClasses: Record<string, string> = {
  Pending: 'bg-hrms-warning/10 text-hrms-navy',
  Approved: 'bg-hrms-success/10 text-hrms-navy',
  Rejected: 'bg-hrms-danger/10 text-hrms-navy',
  Cancelled: 'bg-hrms-muted-bg text-hrms-text-muted',
  Escalated: 'bg-hrms-danger/10 text-hrms-navy',
  'Pending: Manager': 'bg-hrms-warning/10 text-hrms-navy',
  'Pending: HR': 'bg-hrms-warning/10 text-hrms-navy',
  'Pending approval': 'bg-hrms-warning/10 text-hrms-navy',
  'Pending payout': 'bg-hrms-warning/10 text-hrms-navy',
  'Paid via payroll': 'bg-hrms-success/10 text-hrms-navy',
  applied: 'bg-hrms-info/10 text-hrms-navy',
  approved: 'bg-hrms-success/10 text-hrms-navy',
  rejected: 'bg-hrms-danger/10 text-hrms-navy',
  cancelled: 'bg-hrms-muted-bg text-hrms-text-muted',
  Accrual: 'bg-hrms-info/10 text-hrms-navy',
  Adjustment: 'bg-hrms-lavender text-hrms-primary',
  Consumption: 'bg-hrms-warning/10 text-hrms-navy',
}

export const leaveStatusPillDotClasses: Record<string, string> = {
  Pending: 'bg-hrms-warning',
  Approved: 'bg-hrms-success',
  Rejected: 'bg-hrms-danger',
  Cancelled: 'bg-hrms-text-muted',
  Escalated: 'bg-hrms-danger',
  'Pending: Manager': 'bg-hrms-warning',
  'Pending: HR': 'bg-hrms-warning',
  'Pending approval': 'bg-hrms-warning',
  'Pending payout': 'bg-hrms-warning',
  'Paid via payroll': 'bg-hrms-success',
}
