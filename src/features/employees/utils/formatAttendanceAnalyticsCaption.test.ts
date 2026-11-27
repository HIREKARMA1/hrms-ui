import { describe, expect, it } from 'vitest'

import type { AttendanceAnalyticsData } from '../api/employeeDashboardApi.types'
import { formatAttendanceAnalyticsSubtitle } from './formatAttendanceAnalyticsCaption'

const base: AttendanceAnalyticsData = {
  startDate: '2026-11-01',
  endDate: '2026-11-26',
  timezone: 'Asia/Kolkata',
  source: 'stored',
  departmentId: null,
  empty: false,
  eligibleEmployees: 5,
  skippedEmployees: 0,
  summary: {
    totalAttendanceRecords: 10,
    present: 11,
    onTime: 9,
    late: 2,
    absent: 56,
    onLeave: 2,
    halfDay: 0,
    missedPunch: 0,
    holiday: 0,
    weeklyOff: 0,
    attendancePercentage: 72.5,
  },
  series: [],
}

describe('formatAttendanceAnalyticsCaption', () => {
  it('formats API date range in subtitle', () => {
    expect(formatAttendanceAnalyticsSubtitle(base)).toContain('1 Nov')
    expect(formatAttendanceAnalyticsSubtitle(base)).toContain('26 Nov')
    expect(formatAttendanceAnalyticsSubtitle(base)).toContain('Asia/Kolkata')
  })
})