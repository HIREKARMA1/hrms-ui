import { describe, expect, it } from 'vitest'

import type { ByDepartmentData } from '../api/employeeDashboardApi.types'

import { formatDepartmentDistributionSubtitle } from './formatDepartmentDistributionCaption'

describe('formatDepartmentDistributionSubtitle', () => {
  it('mentions all statuses when filter is null', () => {
    const data: ByDepartmentData = {
      employmentStatus: null,
      totalEmployees: 10,
      empty: false,
      items: [],
    }
    expect(formatDepartmentDistributionSubtitle(data)).toContain('all employment statuses')
  })

  it('mentions active only when filtered', () => {
    const data: ByDepartmentData = {
      employmentStatus: 'ACTIVE',
      totalEmployees: 5,
      empty: false,
      items: [],
    }
    expect(formatDepartmentDistributionSubtitle(data)).toContain('active only')
  })
})