/**
 * Request and workflow status labels mapped to LeaveStatusPill tokens.
 * Used in tables and detail sheets across leave tabs.
 */

export const LEAVE_REQUEST_STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled'] as const

export const leaveStatusPillClasses: Record<string, string> = {
  Pending: 'bg-hrms-warning/10 text-hrms-warning',
  Approved: 'bg-hrms-success/10 text-hrms-success',
  Rejected: 'bg-hrms-danger/10 text-hrms-danger',
  Cancelled: 'bg-hrms-muted-bg text-hrms-text-muted',
  Escalated: 'bg-hrms-info/10 text-hrms-info',
  'Pending approval': 'bg-hrms-warning/10 text-hrms-warning',
  'Pending payout': 'bg-hrms-warning/10 text-hrms-warning',
  'Paid via payroll': 'bg-hrms-success/10 text-hrms-success',
}
