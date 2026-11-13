/**
 * Leave encashment requests and payout lifecycle for HR and payroll API.
 * Used by My Leave, Approvals, and leavePayrollApi.
 */

export type EncashmentStatus =
  | 'Pending approval'
  | 'Approved'
  | 'Rejected'
  | 'Pending payout'
  | 'Paid via payroll'

export type EncashmentRequest = {
  id: string
  employeeId: string
  leaveTypeCode: string
  days: number
  appliedOn: string
  status: EncashmentStatus
  approvedOn?: string
}
