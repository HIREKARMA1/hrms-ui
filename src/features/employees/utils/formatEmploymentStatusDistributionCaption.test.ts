import { describe, expect, it } from 'vitest'

import type { ByStatusData } from '../api/employeeDashboardApi.types'

import { formatEmploymentStatusDistributionSubtitle } from './formatEmploymentStatusDistributionCaption'

describe('formatEmploymentStatusDistributionSubtitle', () => {
  it('mentions all departments when unfiltered', () => {
    const data: ByStatusData = {
      departmentId: null,
      totalEmployees: 10,
      empty: false,
      items: [],
    }
    expect(formatEmploymentStatusDistributionSubtitle(data)).toContain('all departments')
  })

  it('mentions department name when filtered', () => {
    const data: ByStatusData = {
      departmentId: 'dept-1',
      totalEmployees: 4,
      empty: false,
      items: [],
    }
    expect(formatEmploymentStatusDistributionSubtitle(data, 'Engineering')).toContain('Engineering')
  })
})