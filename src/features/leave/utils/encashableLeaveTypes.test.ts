import { describe, expect, it } from 'vitest'

import type { LeaveTypeOption } from '../api/leaveMappers'
import { encashableLeaveTypes } from './encashableLeaveTypes'

function type(overrides: Partial<LeaveTypeOption>): LeaveTypeOption {
  return {
    id: 'lt-1',
    code: 'EL',
    name: 'Earned',
    description: null,
    isPaid: true,
    isActive: true,
    requiresApproval: true,
    maxAllowedDays: 12,
    ...overrides,
  }
}

describe('encashableLeaveTypes', () => {
  it('keeps only active paid types', () => {
    const rows = encashableLeaveTypes([
      type({ id: 'a', isPaid: true, isActive: true }),
      type({ id: 'b', isPaid: false, isActive: true, code: 'UL' }),
      type({ id: 'c', isPaid: true, isActive: false }),
    ])
    expect(rows.map((row) => row.id)).toEqual(['a'])
  })
})