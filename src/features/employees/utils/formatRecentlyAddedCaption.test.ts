import { describe, expect, it } from 'vitest'

import type { RecentlyAddedData } from '../api/employeeDashboardApi.types'

import { formatRecentlyAddedSubtitle } from './formatRecentlyAddedCaption'

describe('formatRecentlyAddedCaption', () => {
  it('returns default text when data is undefined', () => {
    expect(formatRecentlyAddedSubtitle(undefined)).toContain('created')
  })

  it('formats period and day window', () => {
    const data: RecentlyAddedData = {
      date: '2026-11-26',
      timezone: 'UTC',
      days: 30,
      periodStart: '2026-10-28',
      periodEnd: '2026-11-26',
      empty: false,
      items: [],
      pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
    }
    const subtitle = formatRecentlyAddedSubtitle(data)
    expect(subtitle).toContain('last 30 days')
    expect(subtitle).toContain('3 records')
  })

  it('uses today label when days is 1', () => {
    const data: RecentlyAddedData = {
      date: '2026-11-26',
      timezone: 'UTC',
      days: 1,
      periodStart: '2026-11-26',
      periodEnd: '2026-11-26',
      empty: true,
      items: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    }
    expect(formatRecentlyAddedSubtitle(data)).toContain('today')
  })
})