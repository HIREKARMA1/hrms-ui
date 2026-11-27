import { describe, expect, it } from 'vitest'

import {
  buildAttendanceStatCards,
  buildHolidayStatCard,
  buildLeaveStatCards,
  mapRecentAttendanceRows,
} from './buildEmployeeDashboardView'

describe('buildEmployeeDashboardView', () => {
  it('builds attendance ratio from summary', () => {
    const cards = buildAttendanceStatCards({
      presentDays: 18,
      absentDays: 1,
      lateDays: 1,
    })
    expect(cards[0]?.value).toBe('18/20')
    expect(cards[1]?.value).toBe('18')
    expect(cards[2]?.value).toBe('1')
  })

  it('sums leave balance and pending requests', () => {
    const cards = buildLeaveStatCards(
      {
        items: [
          {
            leaveTypeId: 'lt-1',
            year: 2026,
            totalAllocated: 12,
            usedLeaves: 2,
            pendingLeaves: 0,
            availableLeaves: 10,
          },
          {
            leaveTypeId: 'lt-2',
            year: 2026,
            totalAllocated: 6,
            usedLeaves: 0,
            pendingLeaves: 1,
            availableLeaves: 2,
          },
        ],
      },
      [
        {
          id: 'lr-1',
          employeeId: 'emp-1',
          leaveTypeCode: 'CASUAL',
          fromDate: '2026-11-05',
          toDate: '2026-11-06',
          days: 2,
          segments: [],
          reason: 'Personal',
          appliedOn: '2026-11-01',
          status: 'Pending',
          currentLevel: 'Manager',
          currentStepLabel: 'Pending manager',
          escalated: false,
          steps: [],
        },
      ],
    )
    expect(cards[0]?.value).toBe('12')
    expect(cards[1]?.value).toBe('1')
  })

  it('picks next holiday by date', () => {
    const card = buildHolidayStatCard(
      [
        { id: 'h1', name: 'Christmas', date: '2026-12-25', type: 'public', mandatory: true, description: '' },
        { id: 'h2', name: 'Diwali', date: '2026-11-08', type: 'public', mandatory: true, description: '' },
      ],
      '2026-11-01',
    )
    expect(card.value).toBe('Diwali')
  })

  it('maps recent attendance rows with display formatting', () => {
    const rows = mapRecentAttendanceRows([
      {
        date: '2026-11-10',
        checkIn: '09:00',
        checkOut: '18:00',
        status: 'PRESENT',
      },
    ])
    expect(rows[0]?.status).toBe('Present')
    expect(rows[0]?.checkIn).toBe('09:00')
  })
})