import { describe, expect, it } from 'vitest'

import type { LeaveAnalyticsData } from '@/features/employees/api/employeeDashboardApi.types'

import {
  leaveDonutFromAnalytics,
  leaveTrendMonthsFromAnalytics,
} from './mapLeaveAnalyticsToOverview'

describe('mapLeaveAnalyticsToOverview', () => {
  const base: LeaveAnalyticsData = {
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    timezone: 'Asia/Kolkata',
    departmentId: null,
    empty: false,
    summary: {
      totalLeaveRequests: 3,
      approved: 2,
      pending: 1,
      rejected: 0,
      cancelled: 0,
      totalApprovedLeaveDays: 3,
    },
    series: [
      { date: '2026-11-25', totalLeaveRequests: 1, approved: 1, pending: 0, rejected: 0, cancelled: 0, approvedLeaveDays: 1 },
      { date: '2026-11-26', totalLeaveRequests: 1, approved: 1, pending: 0, rejected: 0, cancelled: 0, approvedLeaveDays: 2 },
    ],
    byLeaveType: [
      {
        leaveTypeId: '1',
        leaveTypeCode: 'PL',
        leaveTypeName: 'Paid Leave',
        isPaid: true,
        requestCount: 2,
        approved: 2,
        pending: 0,
        rejected: 0,
        cancelled: 0,
        approvedLeaveDays: 3,
      },
    ],
  }

  it('buckets daily approved leave days by month', () => {
    const { rows, types } = leaveTrendMonthsFromAnalytics(base, '2026-11-01', '2026-11-30')
    expect(types).toEqual(['PL'])
    expect(rows.find((row) => row.month === '2026-11')?.total).toBe(3)
  })

  it('builds donut slices from byLeaveType', () => {
    const { slices, totalDays } = leaveDonutFromAnalytics(base)
    expect(totalDays).toBe(3)
    expect(slices[0]?.days).toBe(3)
    expect(slices[0]?.label).toBe('Paid Leave')
  })
})