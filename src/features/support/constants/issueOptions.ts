import type { AdminRequestIssue } from '../types/adminSupportRequest'

export const ADMIN_REQUEST_ISSUE_OPTIONS: {
  value: AdminRequestIssue
  label: string
  description: string
}[] = [
  {
    value: 'employee_id',
    label: 'Employee ID / login access',
    description: 'Unable to sign in or wrong employee ID on record.',
  },
  {
    value: 'password',
    label: 'Password',
    description: 'Forgot password, reset not received, or cannot change password.',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Something else — describe below.',
  },
]

export const ADMIN_REQUEST_ISSUE_LABELS: Record<AdminRequestIssue, string> = {
  employee_id: 'Employee ID',
  password: 'Password',
  other: 'Other',
}

export const ADMIN_REQUEST_STATUS_LABELS = {
  open: 'Open',
  replied: 'Replied',
  closed: 'Closed',
} as const