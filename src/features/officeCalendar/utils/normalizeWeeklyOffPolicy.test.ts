import { describe, expect, it } from 'vitest'

import { normalizeWeeklyOffPolicy } from './normalizeWeeklyOffPolicy'

describe('normalizeWeeklyOffPolicy', () => {
  it('reads rules with weekday and occurrence', () => {
    const policy = normalizeWeeklyOffPolicy({
      rules: [
        { weekday: 'SUNDAY' },
        { weekday: 'SATURDAY', occurrence: 2 },
      ],
    })
    expect(policy.rules).toEqual([
      { weekday: 'SUNDAY' },
      { weekday: 'SATURDAY', occurrence: 2 },
    ])
  })

  it('unwraps policy envelope and ignores invalid rules', () => {
    const policy = normalizeWeeklyOffPolicy({
      policy: {
        rules: [{ weekday: 'FRIDAY' }, { weekday: 'BAD' }],
      },
    })
    expect(policy.rules).toEqual([{ weekday: 'FRIDAY' }])
  })
})