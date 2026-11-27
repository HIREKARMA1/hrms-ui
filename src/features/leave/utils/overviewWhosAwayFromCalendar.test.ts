import { describe, expect, it } from 'vitest'

import type { BackendLeaveCalendarItem } from '../api/leaveApi.types'

import { countUpcomingLeaveStartsFromCalendar } from './overviewFromLeaveCalendar'
import { outlook14DaysFromCalendar } from './overviewOutlook14FromCalendar'
import { listWhosAwayFromCalendar } from './overviewWhosAwayFromCalendar'

const item = (
  overrides: Partial<BackendLeaveCalendarItem> & Pick<BackendLeaveCalendarItem, 'id' | 'startDate' | 'endDate'>,
): BackendLeaveCalendarItem => ({
  employeeId: 'e1',
  employeeName: 'Asha Rao',
  leaveTypeId: 'lt1',
  leaveTypeName: 'Paid Leave',
  dayPortion: 'FULL_DAY',
  totalDays: 2,
  status: 'APPROVED',
  ...overrides,
})

describe('overview calendar live helpers', () => {
  const items = [
    item({ id: 'lr1', startDate: '2026-11-26', endDate: '2026-11-28' }),
    item({ id: 'lr2', employeeId: 'e2', employeeName: 'Meera', startDate: '2026-11-30', endDate: '2026-12-01' }),
  ]

  it('counts upcoming starts in the next 7 days', () => {
    expect(countUpcomingLeaveStartsFromCalendar(items, '2026-11-26', 7)).toBe(1)
  })

  it('builds 14-day outlook cells from calendar', () => {
    const cells = outlook14DaysFromCalendar({
      items,
      holidaysByDate: new Map(),
      weeklyOffDays: [0, 6],
      coverageLimit: null,
      departmentByEmployeeId: new Map(),
      start: '2026-11-26',
    })
    const today = cells.find((cell) => cell.iso === '2026-11-26')
    expect(today?.onLeaveCount).toBe(1)
  })

  it('lists away rows for next 7 days window', () => {
    const rows = listWhosAwayFromCalendar(items, 'next_7', {
      typeCodeById: new Map([['lt1', 'PL']]),
      departmentByEmployeeId: new Map([['e2', 'Engineering']]),
      today: '2026-11-26',
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]?.employeeName).toBe('Meera')
  })
})