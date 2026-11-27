import { describe, expect, it } from 'vitest'

import { monthKeysBetween, overviewRangeBounds } from './overviewRange'

describe('overviewRangeBounds', () => {
  const today = '2026-11-27'

  it('caps this year at today so analytics APIs do not receive future end dates', () => {
    expect(overviewRangeBounds('this_year', today)).toEqual({
      from: '2026-01-01',
      to: '2026-11-27',
    })
  })

  it('uses rolling windows ending on today', () => {
    expect(overviewRangeBounds('last_3_months', today).to).toBe(today)
    expect(overviewRangeBounds('last_6_months', today).to).toBe(today)
  })
})

describe('monthKeysBetween', () => {
  it('includes months from from through to inclusive', () => {
    expect(monthKeysBetween('2026-01-01', '2026-03-15')).toEqual(['2026-01', '2026-02', '2026-03'])
  })
})