import { describe, expect, it } from 'vitest'

import {
  formatOnLeaveDayPortion,
  formatOnLeaveRequestDates,
} from './formatOnLeaveTodayPanel'

describe('formatOnLeaveTodayPanel', () => {
  it('formats day portion labels', () => {
    expect(formatOnLeaveDayPortion('FULL_DAY')).toBe('Full day')
    expect(formatOnLeaveDayPortion('FIRST_HALF')).toBe('First half')
  })

  it('formats single and multi-day request ranges', () => {
    expect(formatOnLeaveRequestDates('2026-11-26', '2026-11-26')).toContain('26 Nov')
    expect(formatOnLeaveRequestDates('2026-11-18', '2026-11-20')).toContain('–')
  })
})