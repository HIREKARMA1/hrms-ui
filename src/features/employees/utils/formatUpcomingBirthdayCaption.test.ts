import { describe, expect, it } from 'vitest'

import type { UpcomingBirthdaysData } from '../api/employeeDashboardApi.types'
import {
  formatUpcomingBirthdayBadge,
  formatUpcomingBirthdaysSubtitle,
} from './formatUpcomingBirthdayCaption'

const base: UpcomingBirthdaysData = {
  date: '2026-11-26',
  timezone: 'UTC',
  days: 30,
  windowEnd: '2026-12-26',
  empty: false,
  items: [],
  pagination: { page: 1, limit: 8, total: 1, totalPages: 1 },
}

describe('formatUpcomingBirthdayCaption', () => {
  it('builds subtitle from API window fields', () => {
    expect(formatUpcomingBirthdaysSubtitle(base)).toContain('30 days')
    expect(formatUpcomingBirthdaysSubtitle(base)).toContain('1 birthday')
  })

  it('formats badge for today and future', () => {
    expect(
      formatUpcomingBirthdayBadge({
        employeeId: '1',
        employeeCode: 'E1',
        employeeName: 'A',
        department: null,
        dateOfBirth: '1990-01-01',
        upcomingBirthday: '2026-11-26',
        daysUntil: 0,
      }),
    ).toBe('Today')
    expect(
      formatUpcomingBirthdayBadge({
        employeeId: '1',
        employeeCode: 'E1',
        employeeName: 'A',
        department: null,
        dateOfBirth: '1990-12-26',
        upcomingBirthday: '2026-12-26',
        daysUntil: 30,
      }),
    ).toContain('in 30 days')
  })
})