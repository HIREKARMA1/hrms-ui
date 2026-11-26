import { describe, expect, it } from 'vitest'

import {
  activeEncashmentPolicies,
  validateEncashmentDays,
  validateEncashmentRequestBalance,
  encashmentPolicyRule,
} from './encashmentRequestPolicy'

describe('encashmentRequestPolicy', () => {
  const policy = {
    id: 'p1',
    leaveTypeId: 'lt-pl',
    ratePerDay: 1000,
    currency: 'INR',
    minDays: 1,
    maxDaysPerRequest: 10,
    maxDaysPerYear: null,
    effectiveFrom: '2026-11-25',
    effectiveTo: '2026-12-31',
    isActive: true,
  }

  it('validates balance without policy rules', () => {
    expect(validateEncashmentRequestBalance(5, 3)).toBeNull()
    expect(validateEncashmentRequestBalance(0, 1)).toMatch(/do not have any leave balance/)
    expect(validateEncashmentRequestBalance(5, 6)).toMatch(/not have enough balance/)
  })

  it('validates balance and policy caps', () => {
    const rule = encashmentPolicyRule(policy)!
    expect(validateEncashmentDays(5, 3, rule)).toBeNull()
    expect(validateEncashmentDays(5, 5, rule)).toMatch(/Keep at least 1 day/)
    expect(validateEncashmentDays(12, 11, rule)).toMatch(/at most 10 days/)
  })

  it('filters policies by effective window', () => {
    const active = activeEncashmentPolicies([policy], '2026-11-26')
    expect(active).toHaveLength(1)
    expect(activeEncashmentPolicies([policy], '2027-01-01').length).toBe(0)
  })
})