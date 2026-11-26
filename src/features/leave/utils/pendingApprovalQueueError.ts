import { getApiErrorMessage } from '@/services/api/errors'

const EMPLOYEE_LINK_PATTERN = /employee record|not linked to an employee/i

export function isPendingEmployeeLinkError(error: unknown): boolean {
  const message = getApiErrorMessage(error, '')
  return EMPLOYEE_LINK_PATTERN.test(message)
}

export function pendingApprovalQueueErrorMessage(error: unknown, fallback: string): string {
  const message = getApiErrorMessage(error, fallback)
  if (EMPLOYEE_LINK_PATTERN.test(message)) {
    return 'Your sign-in account is not linked to an employee record. The workflow approval queue (GET /leave-approval/pending) requires a linked employee. Contact your HR administrator to link your account.'
  }
  return message
}