import { describe, expect, it } from 'vitest'

import { buildLeaveTypeCreateBody, parseLeaveTypeMaxDays } from './buildLeaveTypeApiBody'

describe('buildLeaveTypeCreateBody', () => {
  it('omits requiresApproval and null description', () => {
    const body = buildLeaveTypeCreateBody({
      code: 'pl',
      name: 'Paid Leave',
      description: '',
      isPaid: true,
      isActive: true,
      maxAllowedDays: '1',
    })
    expect(body).toEqual({
      code: 'PL',
      name: 'Paid Leave',
      isPaid: true,
      isActive: true,
      maxAllowedDays: 1,
    })
    expect(body).not.toHaveProperty('requiresApproval')
    expect(body).not.toHaveProperty('description')
  })

  it('rejects decimal max days at parse time', () => {
    expect(parseLeaveTypeMaxDays('1.5')).toBe('decimal')
  })
})