import { describe, expect, it } from 'vitest'

import type { UpcomingAnniversariesData } from '../api/employeeDashboardApi.types'
import {
  formatUpcomingAnniversariesSubtitle,
  formatUpcomingAnniversaryBadge,
} from './formatUpcomingAnniversaryCaption'

const base: UpcomingAnniversariesData = {
  date: '2026-11-26',
  timezone: 'UTC',
  days: 30,
  windowEnd: '2026-12-26',
  empty: false,
  items: [],
  pagination: { page: 1, limit: 8, total: 0, totalPages: 1 },
}

describe('formatUpcomingAnniversaryCaption', () => {
  it('builds subtitle from API window', () => {
    expect(formatUpcomingAnniversariesSubtitle(base)).toContain('30 days')
  })

  it('formats anniversary badge with years', () => {
    expect(
      formatUpcomingAnniversaryBadge({
        employeeId: '1',
        employeeCode: 'E1',
        employeeName: 'A',
        department: null,
        joiningDate: '2024-11-26',
        upcomingAnniversary: '2026-11-26',
        daysUntil: 0,
        yearsOfService: 2,
      }),
    ).toBe('Today · 2 yrs')
  })
})