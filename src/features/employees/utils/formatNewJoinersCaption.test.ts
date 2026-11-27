import { describe, expect, it } from 'vitest'

import type { NewJoinersData } from '../api/employeeDashboardApi.types'
import {
  currentMonthInputValue,
  formatNewJoinersSubtitle,
  parseMonthInputValue,
} from './formatNewJoinersCaption'

describe('formatNewJoinersCaption', () => {
  it('parses month input', () => {
    expect(parseMonthInputValue('2026-11')).toEqual({ year: 2026, month: 11 })
  })

  it('formats subtitle from API period', () => {
    const data: NewJoinersData = {
      date: '2026-11-26',
      timezone: 'UTC',
      year: 2026,
      month: 11,
      periodStart: '2026-11-01',
      periodEnd: '2026-11-30',
      empty: true,
      items: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    }
    expect(formatNewJoinersSubtitle(data)).toContain('1 Nov')
    expect(formatNewJoinersSubtitle(data)).toContain('30 Nov')
  })

  it('builds current month value', () => {
    expect(currentMonthInputValue(new Date('2026-11-15'))).toBe('2026-11')
  })
})