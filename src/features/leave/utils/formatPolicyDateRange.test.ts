import { describe, expect, it } from 'vitest'

import { formatExpiryMonths, formatPolicyEffectiveRange } from './formatPolicyDateRange'

describe('formatPolicyDateRange', () => {
  it('compacts same-month effective range', () => {
    expect(formatPolicyEffectiveRange('2026-11-25', '2026-11-27')).toBe('25–27 Nov 2026')
  })

  it('formats open-ended effective range', () => {
    expect(formatPolicyEffectiveRange('2026-11-25', null)).toBe('25 Nov 2026 – open')
  })

  it('formats expiry months with singular month', () => {
    expect(formatExpiryMonths(1)).toBe('1 month')
    expect(formatExpiryMonths(6)).toBe('6 months')
    expect(formatExpiryMonths(null)).toBe('Never')
  })
})