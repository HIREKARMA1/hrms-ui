import { describe, expect, it } from 'vitest'

import { readIsWeeklyOffDay } from './normalizeWeeklyOffDayFlag'

describe('readIsWeeklyOffDay', () => {
  it('accepts camelCase and snake_case booleans', () => {
    expect(readIsWeeklyOffDay({ isWeeklyOff: true })).toBe(true)
    expect(readIsWeeklyOffDay({ is_weekly_off: true })).toBe(true)
  })

  it('accepts weeklyOffRule object', () => {
    expect(readIsWeeklyOffDay({ weeklyOffRule: { weekday: 'SUNDAY' } })).toBe(true)
  })
})