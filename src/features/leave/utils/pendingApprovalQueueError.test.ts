import { describe, expect, it } from 'vitest'

import { isPendingEmployeeLinkError, pendingApprovalQueueErrorMessage } from './pendingApprovalQueueError'

function rtkError(message: string) {
  return { status: 400 as const, data: { message } }
}

describe('pendingApprovalQueueError', () => {
  it('detects employee link errors from API message', () => {
    const error = rtkError('Authenticated user is not linked to an employee record')
    expect(isPendingEmployeeLinkError(error)).toBe(true)
    expect(pendingApprovalQueueErrorMessage(error, 'fallback')).toMatch(/not linked to an employee record/)
  })

  it('passes through other errors', () => {
    const error = rtkError('Server error')
    expect(isPendingEmployeeLinkError(error)).toBe(false)
    expect(pendingApprovalQueueErrorMessage(error, 'fallback')).toBe('Server error')
  })
})