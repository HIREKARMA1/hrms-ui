import { describe, expect, it } from 'vitest'

import type { OnProbationData } from '../api/employeeDashboardApi.types'

import { formatOnProbationSubtitle } from './formatOnProbationCaption'

describe('formatOnProbationCaption', () => {
  it('returns default text when data is undefined', () => {
    expect(formatOnProbationSubtitle(undefined)).toContain('probation status')
  })

  it('pluralizes total count', () => {
    const data: OnProbationData = {
      empty: false,
      items: [],
      pagination: { page: 1, limit: 10, total: 4, totalPages: 1 },
    }
    expect(formatOnProbationSubtitle(data)).toBe('4 on probation · newest joiners first')
  })

  it('uses singular phrasing for one employee', () => {
    const data: OnProbationData = {
      empty: false,
      items: [],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    }
    expect(formatOnProbationSubtitle(data)).toBe('1 on probation · newest joiners first')
  })
})