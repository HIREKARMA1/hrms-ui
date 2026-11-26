import { describe, expect, it } from 'vitest'

import {
  buildAccrualPolicyCreateBody,
  buildCarryForwardPolicyCreateBody,
  type AccrualPolicyForm,
  type CarryForwardPolicyForm,
} from './buildLeavePolicyApiBody'

const accrualForm = (patch: Partial<AccrualPolicyForm> = {}): AccrualPolicyForm => ({
  leaveTypeId: 'lt-cl',
  frequency: 'MONTHLY',
  accrualAmount: '1.5',
  annualAllocationLimit: '',
  maxAccumulatedBalance: '12',
  effectiveFrom: '2026-01-01',
  effectiveTo: '',
  isActive: true,
  ...patch,
})

const carryForm = (patch: Partial<CarryForwardPolicyForm> = {}): CarryForwardPolicyForm => ({
  leaveTypeId: 'lt-el',
  enabled: true,
  maxCarryForwardDays: '10',
  expiryMonths: '',
  expiryNever: true,
  effectiveYear: '2026',
  isActive: true,
  ...patch,
})

describe('buildAccrualPolicyCreateBody', () => {
  it('builds a minimal accrual payload', () => {
    expect(buildAccrualPolicyCreateBody(accrualForm())).toEqual({
      leaveTypeId: 'lt-cl',
      frequency: 'MONTHLY',
      accrualAmount: 1.5,
      effectiveFrom: '2026-01-01',
      maxAccumulatedBalance: 12,
      isActive: true,
    })
  })

  it('rejects missing amount', () => {
    expect(buildAccrualPolicyCreateBody(accrualForm({ accrualAmount: '' }))).toBeNull()
  })
})

describe('buildCarryForwardPolicyCreateBody', () => {
  it('omits expiryMonths when never expires (live API rejects null)', () => {
    const body = buildCarryForwardPolicyCreateBody(carryForm())
    expect(body).toEqual({
      leaveTypeId: 'lt-el',
      enabled: true,
      maxCarryForwardDays: 10,
      effectiveYear: 2026,
      isActive: true,
    })
    expect(body).not.toHaveProperty('expiryMonths')
  })

  it('includes expiry months when set', () => {
    expect(
      buildCarryForwardPolicyCreateBody(
        carryForm({ expiryNever: false, expiryMonths: '6' }),
      ),
    ).toMatchObject({ expiryMonths: 6 })
  })
})