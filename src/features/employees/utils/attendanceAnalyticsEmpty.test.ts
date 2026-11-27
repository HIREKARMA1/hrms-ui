import { describe, expect, it } from 'vitest'

import { attendanceAnalyticsHasChartData } from './attendanceAnalyticsEmpty'

describe('attendanceAnalyticsHasChartData', () => {
  it('returns false when series is empty and API reports empty', () => {
    expect(attendanceAnalyticsHasChartData([], true)).toBe(false)
  })

  it('returns true when any day has a non-zero status count', () => {
    expect(
      attendanceAnalyticsHasChartData(
        [{ present: 0, absent: 2, onLeave: 0, late: 0 }],
        false,
      ),
    ).toBe(true)
  })

  it('returns false when every day is zero', () => {
    expect(
      attendanceAnalyticsHasChartData(
        [
          { present: 0, absent: 0, onLeave: 0, late: 0 },
          { present: 0, absent: 0, onLeave: 0, late: 0 },
        ],
        false,
      ),
    ).toBe(false)
  })
})