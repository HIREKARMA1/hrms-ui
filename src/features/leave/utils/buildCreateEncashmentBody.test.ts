import { describe, expect, it } from 'vitest'

import { buildCreateEncashmentBody } from './buildCreateEncashmentBody'

describe('buildCreateEncashmentBody', () => {
  it('builds a minimal POST body', () => {
    const body = buildCreateEncashmentBody('emp-1', {
      leaveTypeId: 'lt-el',
      days: '3',
      year: '',
      reason: '',
    })
    expect(body).toEqual({ employeeId: 'emp-1', leaveTypeId: 'lt-el', days: 3 })
  })

  it('includes optional year and reason', () => {
    const body = buildCreateEncashmentBody('emp-1', {
      leaveTypeId: 'lt-el',
      days: '2',
      year: '2026',
      reason: 'Medical',
    })
    expect(body).toEqual({
      employeeId: 'emp-1',
      leaveTypeId: 'lt-el',
      days: 2,
      year: 2026,
      reason: 'Medical',
    })
  })

  it('returns null when days are invalid', () => {
    expect(
      buildCreateEncashmentBody('emp-1', {
        leaveTypeId: 'lt-el',
        days: '0',
        year: '',
        reason: '',
      }),
    ).toBeNull()
  })
})