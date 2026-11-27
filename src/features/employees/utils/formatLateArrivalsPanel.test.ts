import { describe, expect, it } from 'vitest'

import { formatLateArrivalsShiftHint } from './formatLateArrivalsPanel'

describe('formatLateArrivalsShiftHint', () => {
  it('includes on-time cut-off when provided', () => {
    expect(
      formatLateArrivalsShiftHint({
        name: 'General Shift',
        latestOnTimeCheckIn: '10:30:00',
      }),
    ).toContain('10:30')
    expect(
      formatLateArrivalsShiftHint({
        name: 'General Shift',
        latestOnTimeCheckIn: '10:30:00',
      }),
    ).toContain('General Shift')
  })
})