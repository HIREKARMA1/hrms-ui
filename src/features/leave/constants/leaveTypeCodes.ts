/**
 * Fixed leave type codes and display labels for filters and balances.
 * Must stay aligned with companyDefaults seed policies.
 */

export const LEAVE_TYPE_CODES = [
  'CL',
  'SL',
  'EL',
  'PL',
  'LWP',
  'MAT',
  'PAT',
  'CO',
  'MAR',
  'BER',
] as const

export type LeaveTypeCode = (typeof LEAVE_TYPE_CODES)[number]

export const LEAVE_TYPE_LABELS: Record<LeaveTypeCode, string> = {
  CL: 'Casual Leave',
  SL: 'Sick Leave',
  EL: 'Earned Leave',
  PL: 'Paid Leave',
  LWP: 'Leave Without Pay',
  MAT: 'Maternity',
  PAT: 'Paternity',
  CO: 'Compensatory Off',
  MAR: 'Marriage',
  BER: 'Bereavement',
}

export const BALANCE_TYPE_CODES: LeaveTypeCode[] = ['CL', 'SL', 'EL', 'PL', 'CO']
