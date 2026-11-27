import { describe, expect, it } from 'vitest'

import { departmentAvailabilityFromDashboard } from './overviewDeptFromDashboard'

describe('departmentAvailabilityFromDashboard', () => {
  it('joins department headcount with on-leave counts', () => {
    const rows = departmentAvailabilityFromDashboard(
      {
        employmentStatus: 'ACTIVE',
        totalEmployees: 4,
        empty: false,
        items: [
          { departmentId: 'd1', departmentCode: 'DM', departmentName: 'Digital Markting', employeeCount: 4 },
        ],
      },
      [
        {
          leaveRequestId: 'lr1',
          employeeId: 'e1',
          employeeCode: 'HK1',
          employeeName: 'A',
          department: { id: 'd1', code: 'DM', name: 'Digital Markting' },
          leaveType: { id: 't1', code: 'PL', name: 'Paid Leave', isPaid: true },
          startDate: '2026-11-25',
          endDate: '2026-11-28',
          dayPortion: 'FULL_DAY',
          status: 'APPROVED',
          reason: null,
        },
      ],
      null,
    )
    expect(rows[0]).toMatchObject({ department: 'Digital Markting', headcount: 4, onLeave: 1, percent: 25 })
  })
})