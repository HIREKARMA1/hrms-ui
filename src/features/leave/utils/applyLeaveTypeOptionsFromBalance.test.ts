import { describe, expect, it } from 'vitest'

import { applyLeaveTypeOptionsFromBalance } from './applyLeaveTypeOptionsFromBalance'

describe('applyLeaveTypeOptionsFromBalance', () => {
  it('returns null when balance rows are not provided (demo mode)', () => {
    expect(applyLeaveTypeOptionsFromBalance(null)).toBeNull()
    expect(applyLeaveTypeOptionsFromBalance(undefined)).toBeNull()
  })

  it('dedupes by code and uses server names', () => {
    const options = applyLeaveTypeOptionsFromBalance([
      {
        leaveTypeId: 'a',
        leaveTypeCode: 'EARNED',
        leaveTypeName: 'Earned Leave',
        year: 2026,
        allocated: 12,
        used: 0,
        pending: 0,
        available: 10,
      },
      {
        leaveTypeId: 'b',
        leaveTypeCode: 'EARNED',
        leaveTypeName: 'Earned Leave dup',
        year: 2026,
        allocated: 0,
        used: 0,
        pending: 0,
        available: 0,
      },
      {
        leaveTypeId: 'c',
        leaveTypeCode: 'SICK',
        leaveTypeName: 'Sick Leave',
        year: 2026,
        allocated: 6,
        used: 1,
        pending: 0,
        available: 5,
      },
    ])
    expect(options).toHaveLength(2)
    expect(options?.map((o) => o.code)).toEqual(['EARNED', 'SICK'])
    expect(options?.[0]).toMatchObject({ label: 'Earned Leave', available: 10, used: 0, pending: 0 })
  })
})