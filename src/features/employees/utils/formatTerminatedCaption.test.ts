import { describe, expect, it } from 'vitest'

import type { TerminatedData } from '../api/employeeDashboardApi.types'

import { formatTerminatedSubtitle } from './formatTerminatedCaption'

describe('formatTerminatedCaption', () => {
  it('returns default text when data is undefined', () => {
    expect(formatTerminatedSubtitle(undefined)).toContain('terminated status')
  })

  it('formats total count', () => {
    const data: TerminatedData = {
      empty: false,
      items: [],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    }
    expect(formatTerminatedSubtitle(data)).toBe('2 terminated · most recently updated first')
  })
})