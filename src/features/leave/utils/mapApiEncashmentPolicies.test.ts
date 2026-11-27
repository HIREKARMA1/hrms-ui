import { describe, expect, it } from 'vitest'

import type { LeaveEncashmentPoliciesData } from '../types/api/leaveEncashmentPolicies.types'
import { mapApiEncashmentPoliciesToTableRows } from './mapApiEncashmentPolicies'

describe('mapApiEncashmentPoliciesToTableRows', () => {
  it('maps live encashment policy response fields', () => {
    const data: LeaveEncashmentPoliciesData = {
      items: [
        {
          id: 'pol-1',
          leaveTypeId: 'lt-pl',
          ratePerDay: 1000,
          currency: 'INR',
          minDays: 1,
          maxDaysPerRequest: 10,
          maxDaysPerYear: null,
          effectiveFrom: '2026-11-25',
          effectiveTo: '2026-11-27',
          isActive: true,
          leaveType: { id: 'lt-pl', code: 'PL', name: 'Paid Leave' },
        },
      ],
    }

    const [row] = mapApiEncashmentPoliciesToTableRows(data)
    expect(row).toMatchObject({
      leaveTypeCode: 'PL',
      leaveTypeName: 'Paid Leave',
      ratePerDay: 'INR 1,000 / day',
      minDays: '1 day',
      maxPerRequest: '10 days',
      maxPerYear: 'No limit',
      active: true,
    })
    expect(row.effective).toBe('25–27 Nov 2026')
  })
})