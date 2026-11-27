import { describe, expect, it } from 'vitest'

import { formatAbsentNonWorkingDayMessage } from './formatAbsentTodayPanel'

describe('formatAbsentNonWorkingDayMessage', () => {
  it('describes holidays with optional label', () => {
    expect(
      formatAbsentNonWorkingDayMessage({ type: 'HOLIDAY', description: 'Diwali' }),
    ).toContain('Diwali')
  })

  it('handles weekly off', () => {
    expect(formatAbsentNonWorkingDayMessage({ type: 'WEEKLY_OFF' })).toContain('Weekly off')
  })
})